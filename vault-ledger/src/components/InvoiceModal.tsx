import React, { useState } from 'react';
import { X, FileText, Download, User, MapPin, Hash, Save, Mail, Loader2, CheckCircle2, Tag, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { ExtractedExpense } from '../services/geminiService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

interface Expense {
  id: string;
  merchantName: string;
  amount: number;
  date: string;
  category: string;
  currency: string;
  imageUrl?: string;
}

type InvoiceStatus = 'draft' | 'sent' | 'paid';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  amount: number;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  expenseIds: string[];
}

interface InvoiceModalProps {
  selectedExpenses: Expense[];
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  userProfile: { businessName: string; email: string; taxId?: string };
}

interface ManualItem {
  id: string;
  description: string;
  amount: number;
}

export default function InvoiceModal({ selectedExpenses, onClose, onSave, userProfile }: InvoiceModalProps) {
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    address: '',
    invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft' as InvoiceStatus,
    taxRate: 20 // Default VAT rate
  });
  const [manualItems, setManualItems] = useState<ManualItem[]>([]);
  const [newItem, setNewItem] = useState({ description: '', amount: '' });
  
  const [isMailing, setIsMailing] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const [mailError, setMailError] = useState<string | null>(null);

  const grossTotal = selectedExpenses.reduce((sum, exp) => sum + exp.amount, 0) + manualItems.reduce((sum, item) => sum + item.amount, 0);
  // Pattern: VAT = Total * (Rate / (100 + Rate))
  const taxAmount = (grossTotal * customer.taxRate) / (100 + customer.taxRate);
  const subtotal = grossTotal - taxAmount;
  const totalAmount = grossTotal;

  const addManualItem = () => {
    if (!newItem.description || !newItem.amount) return;
    const amount = parseFloat(newItem.amount);
    if (isNaN(amount)) return;

    setManualItems(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      description: newItem.description,
      amount
    }]);
    setNewItem({ description: '', amount: '' });
  };

  const removeManualItem = (id: string) => {
    setManualItems(prev => prev.filter(item => item.id !== id));
  };

  const buildPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(userProfile.businessName, 20, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Business Invoice", 20, 38);
    doc.text(`Email: ${userProfile.email}`, 20, 44);
    if (userProfile.taxId) {
      doc.text(`Tax/Business ID: ${userProfile.taxId}`, 20, 50);
    }

    // Invoice Info
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text(customer.name || "Customer Name", 20, 71);
    doc.text(customer.address || "Customer Address", 20, 77);
    doc.text(customer.email || "Customer Email", 20, 83);

    doc.setFont("helvetica", "bold");
    doc.text("INVOICE DETAILS", 140, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`Number: ${customer.invoiceNumber}`, 140, 71);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 77);
    doc.text(`Due Date: ${customer.dueDate}`, 140, 83);

    // Table
    const expenseRows = selectedExpenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.merchantName,
      exp.category.toUpperCase(),
      `${exp.currency}${exp.amount.toFixed(2)}`
    ]);

    const manualRows = manualItems.map(item => [
      new Date().toLocaleDateString(),
      item.description,
      "MANUAL ENTRY",
      `€${item.amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 95,
      head: [['Date', 'Description', 'Category', 'Amount']],
      body: [...expenseRows, ...manualRows],
      theme: 'striped',
      headStyles: { fillColor: [10, 10, 10] },
      margin: { left: 20, right: 20 }
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal: ${selectedExpenses[0]?.currency || '€'}${subtotal.toFixed(2)}`, 140, finalY);
    doc.text(`Tax (${customer.taxRate}%): ${selectedExpenses[0]?.currency || '€'}${taxAmount.toFixed(2)}`, 140, finalY + 6);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Due: ${selectedExpenses[0]?.currency || '€'}${totalAmount.toFixed(2)}`, 140, finalY + 14);

    // Receipt Screenshots
    const expensesWithImages = selectedExpenses.filter(e => e.imageUrl && e.imageUrl.startsWith('data:'));
    if (expensesWithImages.length > 0) {
      doc.addPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Receipt Evidence", 20, 20);
      doc.setDrawColor(200);
      doc.line(20, 23, 190, 23);

      const imgW = 80;
      const imgH = 60;
      const colGap = 10;
      let imgX = 20;
      let imgY = 30;
      let col = 0;

      for (const exp of expensesWithImages) {
        if (imgY + imgH + 10 > 280) {
          doc.addPage();
          imgY = 20;
          col = 0;
          imgX = 20;
        }
        try {
          const format = exp.imageUrl!.includes('image/png') ? 'PNG' : 'JPEG';
          doc.addImage(exp.imageUrl!, format, imgX, imgY, imgW, imgH);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.text(exp.merchantName, imgX, imgY + imgH + 4, { maxWidth: imgW });
          doc.text(new Date(exp.date).toLocaleDateString(), imgX, imgY + imgH + 9);
        } catch (_) {}

        col++;
        if (col >= 2) {
          col = 0;
          imgX = 20;
          imgY += imgH + 18;
        } else {
          imgX += imgW + colGap;
        }
      }
    }

    return doc;
  };

  const generatePDF = () => {
    const doc = buildPDF();
    doc.save(`${customer.invoiceNumber}.pdf`);
    saveInvoice(customer.status);
  };

  const saveInvoice = (finalStatus: InvoiceStatus) => {
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: customer.invoiceNumber,
      customerName: customer.name,
      customerEmail: customer.email,
      subtotal: subtotal,
      taxRate: customer.taxRate,
      taxAmount: taxAmount,
      amount: totalAmount,
      date: new Date().toISOString(),
      dueDate: customer.dueDate,
      status: finalStatus,
      expenseIds: selectedExpenses.map(e => e.id)
    });
  };

  const handleEmailInvoice = async () => {
    if (!customer.email) {
      setMailError("Recipient email is required.");
      return;
    }

    setIsMailing(true);
    setMailError(null);
    setMailSent(false);

    try {
      const doc = buildPDF();
      const pdfDataUri = doc.output('datauristring');
      const base64 = pdfDataUri.split(',')[1];

      await axios.post('/api/gmail/send-invoice', {
        to: customer.email,
        subject: `Invoice ${customer.invoiceNumber} from ${userProfile.businessName}`,
        body: `Dear ${customer.name || 'Client'},\n\nPlease find attached the invoice ${customer.invoiceNumber} for your recent expenses.\n\nBest regards,\n${userProfile.businessName}`,
        attachment: base64,
        filename: `${customer.invoiceNumber}.pdf`
      });

      setMailSent(true);
      saveInvoice('sent');
      setTimeout(() => setMailSent(false), 5000);
    } catch (err: any) {
      console.error("Email failed:", err);
      setMailError(err.response?.data?.error || "Failed to send email. Check your cloud connection.");
    } finally {
      setIsMailing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-lux-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] w-full max-w-4xl h-[85vh] flex overflow-hidden shadow-2xl"
      >
        {/* Left: Branding & Preview */}
        <div className="w-1/3 bg-lux-black text-white p-10 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-lux-gold rounded-sm flex items-center justify-center mb-8">
              <span className="text-lux-black font-serif font-bold text-xl">L</span>
            </div>
            <h2 className="text-3xl font-serif mb-4 leading-tight tracking-tight">Invoice Architect</h2>
            <p className="text-gray-400 text-xs font-mono uppercase tracking-[0.2em] leading-loose">
              Transforming verified expenses into strategic billing assets.
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm space-y-4">
              <div>
                <p className="lux-label text-lux-gold mb-1 opacity-60">Subtotal</p>
                <p className="text-xl font-serif text-white/90">€{subtotal.toLocaleString()}</p>
              </div>
              <div>
                <p className="lux-label text-lux-gold mb-1 opacity-60">Tax Amount</p>
                <p className="text-xl font-serif text-white/90">€{taxAmount.toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="lux-label text-lux-gold mb-1">Total Amount</p>
                <p className="text-3xl font-serif text-white">€{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Client Details Form */}
        <div className="w-2/3 p-12 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-2xl font-serif mb-1">Billing Details</h3>
              <p className="text-gray-400 text-sm">Provide recipient information and branding options.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="flex-1 space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 lux-label text-lux-black opacity-40">
                  <User size={12} />
                  <span>Client Name</span>
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. Acme Architecture"
                  className="w-full border-b border-lux-border py-2 focus:border-lux-black outline-none transition-all placeholder:text-gray-200"
                  value={customer.name}
                  onChange={e => setCustomer({ ...customer, name: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 lux-label text-lux-black opacity-40">
                  <Hash size={12} />
                  <span>Invoice Number</span>
                </div>
                <input 
                  type="text" 
                  className="w-full border-b border-lux-border py-2 focus:border-lux-black outline-none transition-all"
                  value={customer.invoiceNumber}
                  onChange={e => setCustomer({ ...customer, invoiceNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 lux-label text-lux-black opacity-40">
                <MapPin size={12} />
                <span>Billing Address</span>
              </div>
              <textarea 
                placeholder="Full operational address..."
                className="w-full border-b border-lux-border py-2 focus:border-lux-black outline-none transition-all placeholder:text-gray-200 resize-none h-20"
                value={customer.address}
                onChange={e => setCustomer({ ...customer, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 lux-label text-lux-black opacity-40">
                  <span className="text-[10px] uppercase">@</span>
                  <span>Client Email</span>
                </div>
                <input 
                  type="email" 
                  placeholder="billing@client.com"
                  className="w-full border-b border-lux-border py-2 focus:border-lux-black outline-none transition-all placeholder:text-gray-200"
                  value={customer.email}
                  onChange={e => setCustomer({ ...customer, email: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 lux-label text-lux-black opacity-40">
                  <FileText size={12} />
                  <span>Due Date</span>
                </div>
                <input 
                  type="date" 
                  className="w-full border-b border-lux-border py-2 focus:border-lux-black outline-none transition-all"
                  value={customer.dueDate}
                  onChange={e => setCustomer({ ...customer, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 lux-label text-lux-black opacity-40">
                  <Tag size={12} />
                  <span>VAT Rate (%)</span>
                </div>
                <input 
                  type="number" 
                  className="w-full border-b border-lux-border py-2 focus:border-lux-black outline-none transition-all"
                  value={customer.taxRate}
                  onChange={e => setCustomer({ ...customer, taxRate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 lux-label text-lux-black opacity-40">
                  <Tag size={12} />
                  <span>Invoice Status</span>
                </div>
                <div className="flex gap-2">
                  {(['draft', 'sent', 'paid'] as InvoiceStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setCustomer({ ...customer, status: s })}
                      className={cn(
                        "flex-1 py-2 rounded-lg border text-[10px] uppercase font-mono tracking-widest transition-all",
                        customer.status === s 
                          ? "bg-lux-black text-white border-lux-black shadow-lg shadow-lux-black/10" 
                          : "bg-white text-gray-400 border-lux-border hover:border-lux-black"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Entries Section */}
            <div className="space-y-6 pt-6 border-t border-lux-border">
              <div>
                <h4 className="text-lg font-serif mb-1">Additional Figures</h4>
                <p className="text-gray-400 text-xs">Manually add line items, modifiers, or additional service fees.</p>
              </div>

              <div className="space-y-4">
                {manualItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 bg-lux-gray/30 p-4 rounded-xl group">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.description}</p>
                    </div>
                    <p className="font-mono text-sm font-semibold">€{item.amount.toFixed(2)}</p>
                    <button 
                      onClick={() => removeManualItem(item.id)}
                      className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <div className="grid grid-cols-[1fr_120px_auto] gap-4 items-end bg-lux-gray/10 p-4 rounded-xl border border-dashed border-lux-border">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-mono text-gray-400">Description</p>
                    <input 
                      type="text" 
                      placeholder="e.g. Consultation Fee"
                      className="w-full bg-transparent border-b border-lux-border py-1 text-sm outline-none focus:border-lux-black transition-all"
                      value={newItem.description}
                      onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-mono text-gray-400">Amount (€)</p>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-transparent border-b border-lux-border py-1 text-sm outline-none focus:border-lux-black transition-all font-mono"
                      value={newItem.amount}
                      onChange={e => setNewItem({ ...newItem, amount: e.target.value })}
                    />
                  </div>
                  <button 
                    onClick={addManualItem}
                    className="p-2 bg-lux-black text-white rounded-lg hover:scale-105 transition-transform"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-10 flex flex-col gap-4">
            {mailError && (
              <div className="text-[10px] uppercase font-mono text-red-500 flex items-center gap-2">
                <span className="w-1 h-1 bg-red-500 rounded-full" />
                {mailError}
              </div>
            )}
            {mailSent && (
              <div className="text-[10px] uppercase font-mono text-green-500 flex items-center gap-2">
                <CheckCircle2 size={12} />
                Invoice dispatched successfully via Gmail
              </div>
            )}
            
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="px-8 py-3 rounded-full font-sans text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleEmailInvoice}
                disabled={isMailing}
                className={cn(
                  "px-8 py-3 rounded-full font-sans text-sm font-medium border border-lux-black flex items-center justify-center gap-2 transition-all",
                  isMailing ? "opacity-50" : "hover:bg-gray-50"
                )}
              >
                {isMailing ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {isMailing ? "Dispatched..." : "Email to Client"}
              </button>
              <button 
                onClick={generatePDF}
                className="flex-1 bg-lux-black text-white px-8 py-3 rounded-full font-sans text-sm font-medium flex items-center justify-center gap-2 hover:bg-lux-black/90 transition-all shadow-xl shadow-lux-black/10"
              >
                <Download size={16} />
                Generate Luxival Invoice
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
