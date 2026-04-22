import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import Stripe from "stripe";
import admin from "firebase-admin";

dotenv.config();

// Lazily initialize Firebase Admin
const getFirebaseAdmin = () => {
  if (admin.apps.length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount))
      });
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT missing. Webhooks will not be able to update database.");
    }
  }
  return admin;
};

// Lazily initialize Stripe
let stripeInstance: Stripe | null = null;
const getStripe = () => {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is missing");
    }
    stripeInstance = new Stripe(key, { apiVersion: '2025-02-24-preview' as any });
  }
  return stripeInstance;
};

const app = express();
const PORT = 3000;

// Need raw body for Stripe webhooks
app.post("/api/stripe/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).send("Webhook signature or secret missing");
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, invoiceId } = session.metadata || {};

    if (userId && invoiceId) {
      try {
        const firebaseAdmin = getFirebaseAdmin();
        const db = firebaseAdmin.firestore();
        await db.doc(`users/${userId}/invoices/${invoiceId}`).update({
          status: 'paid',
          paidAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Invoice ${invoiceId} marked as paid.`);
      } catch (err) {
        console.error("Failed to update invoice in Firestore:", err);
      }
    }
  }

  res.json({ received: true });
});

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

const oauth2Client = new google.auth.OAuth2(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/api/auth/google/callback`
);

// 1. Get Auth URL
app.get("/api/auth/google/url", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.send"
    ],
    prompt: "consent"
  });
  res.json({ url });
});

// 2. Status
app.get("/api/auth/google/status", (req, res) => {
  const tokensStr = req.cookies.google_tokens;
  res.json({ isConnected: !!tokensStr });
});

// 3. Callback
app.get("/api/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    // Store tokens in a secure cookie
    res.cookie("google_tokens", JSON.stringify(tokens), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 3600000 // 1 hour
    });

    // Notify the frontend via postMessage
    res.send(`
      <script>
        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
        window.close();
      </script>
    `);
  } catch (error) {
    console.error("Auth error:", error);
    res.send(`
      <script>
        window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR' }, '*');
        window.close();
      </script>
    `);
  }
});

// 3. List Drive Files
app.get("/api/drive/list", async (req, res) => {
  const tokensStr = req.cookies.google_tokens;
  if (!tokensStr) return res.status(401).json({ error: "Unauthorized" });

  try {
    const tokens = JSON.parse(tokensStr);
    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    
    const response = await drive.files.list({
      q: "mimeType = 'image/jpeg' or mimeType = 'image/png' or mimeType = 'application/pdf'",
      fields: "files(id, name, mimeType, thumbnailLink)",
      pageSize: 20
    });

    res.json({ files: response.data.files });
  } catch (error) {
    res.status(500).json({ error: "Failed to list files" });
  }
});

// 4. Download/Proxy File for extraction
app.get("/api/drive/file/:fileId", async (req, res) => {
  const tokensStr = req.cookies.google_tokens;
  if (!tokensStr) return res.status(401).json({ error: "Unauthorized" });

  try {
    const tokens = JSON.parse(tokensStr);
    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const { fileId } = req.params;

    const metadata = await drive.files.get({ fileId, fields: "name, mimeType" });
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );

    const base64 = Buffer.from(response.data as ArrayBuffer).toString("base64");
    res.json({ 
      name: metadata.data.name,
      mimeType: metadata.data.mimeType,
      data: base64
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch file" });
  }
});

// 5. Send Gmail with Attachment
app.post("/api/gmail/send-invoice", async (req, res) => {
  const tokensStr = req.cookies.google_tokens;
  if (!tokensStr) return res.status(401).json({ error: "Unauthorized" });

  try {
    const tokens = JSON.parse(tokensStr);
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const { to, subject, body, attachment, filename } = req.body;

    const boundary = "boundary_" + Math.random().toString(36).substring(2);
    const messageParts = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: 7bit",
      "",
      body,
      "",
      `--${boundary}`,
      `Content-Type: application/pdf; name="${filename}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${filename}"`,
      "",
      attachment,
      `--${boundary}--`
    ];

    const message = messageParts.join("\r\n");
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Gmail error:", error);
    res.status(500).json({ error: "Failed to send email via Gmail" });
  }
});

// 6. Create Stripe Checkout Session
app.post("/api/stripe/create-checkout", async (req, res) => {
  try {
    const stripe = getStripe();
    const { invoiceId, amount, customerName, customerEmail, userId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Invoice ${invoiceId}`,
            description: `Payment for invoice from ${customerName}`,
          },
          unit_amount: Math.round(amount * 100), // Stripe expects cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.APP_URL}/?payment=success&invoiceId=${invoiceId}`,
      cancel_url: `${process.env.APP_URL}/?payment=cancelled`,
      customer_email: customerEmail,
      metadata: {
        userId,
        invoiceId
      }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
