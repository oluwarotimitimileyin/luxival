import { apiConfig } from './apiConfig';

const API_URL = 'https://graph.facebook.com/v18.0';

function getToken() {
  return apiConfig.getKey('whatsapp_token');
}

function getPhoneId() {
  return apiConfig.getKey('whatsapp_phone_id');
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
) {
  if (!getToken() || !getPhoneId()) {
    return { success: false, error: 'WhatsApp Business API not configured' };
  }

  // Format phone number (remove + and non-digits)
  const formattedPhone = to.replace(/\D/g, '');

  try {
    const response = await fetch(
      `${API_URL}/${getPhoneId()}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: { body: message },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || `Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  language: string = 'en_US'
) {
  if (!getToken() || !getPhoneId()) {
    return { success: false, error: 'WhatsApp Business API not configured' };
  }

  const formattedPhone = to.replace(/\D/g, '');

  try {
    const response = await fetch(
      `${API_URL}/${getPhoneId()}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: language },
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || `Error: ${response.status}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}
