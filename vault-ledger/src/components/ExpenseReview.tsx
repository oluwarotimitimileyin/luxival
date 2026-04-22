import React, { useState } from 'react';
import { Save, AlertTriangle, Building2, Calendar, CreditCard, Tag, Landmark, FileCheck, RefreshCw, MapPin, Phone, Hash, ShieldCheck, Fingerprint } from 'lucide-react';
import { ExtractedExpense } from '../services/geminiService';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ExpenseReviewProps {
  data: ExtractedExpense;
  file?: File;
  previewUrl?: string;
  documentName?: string;
  onSave: (finalData: ExtractedExpense) => void;
  onCancel: () => void;
}

export default function ExpenseReview({ data, file, previewUrl, documentName, onSave, onCancel }: ExpenseReviewProps) {
  const [editedData, setEditedData] = useState<ExtractedExpense>(data);
  const displayUrl = previewUrl || (file?.type?.startsWith('image/') ? URL.createObjectURL(file) : null);
  const displayName = documentName || file?.name || 'Document';

  const categories = [
    "transport", "fuel", "software", "subscriptions", 
    "office_supplies", "food", "maintenance", 
    "marketing", "utilities", "miscellaneous"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-lux-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl shadow-lux-black/20"
      >
        {/* Left: Receipt Preview */}
        <div className="w-1/2 bg-lux-gray p-8 flex flex-col items-center justify-center border-r border-lux-border overflow-hidden">
          <div className="flex items-center gap-2 mb-6 self-start">
            <span className="lux-label">Receipt Document</span>
            <span className="text-[10px] bg-white px-2 py-0.5 border border-lux-border rounded text-gray-500">{displayName}</span>
          </div>
          
          {displayUrl ? (
            <div className="flex-1 w-full relative group">
              <img 
                src={displayUrl} 
                alt="Receipt Preview" 
                className="w-full h-full object-contain drop-shadow-xl rounded-lg"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
              <FileCheck className="w-16 h-16" />
              <p className="font-serif italic">PDF Preview not available</p>
            </div>
          )}
        </div>

        {/* Right: Extracted Data Review */}
        <div className="w-1/2 p-12 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-serif">Review Extraction</h2>
              <p className="text-gray-500 text-sm mt-1">Confirm and approve the extracted details.</p>
            </div>
            <div className={editedData.isBusiness ? "bg-lux-gold/10 text-lux-gold border border-lux-gold/20 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-tighter" : "bg-gray-100 text-gray-400 border border-gray-200 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-tighter"}>
              {editedData.isBusiness ? "Business Purchase" : "Personal / Mixed"}
            </div>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto pr-4">
            {/* Merchant */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lux-black opacity-40">
                <Building2 size={14} />
                <label className="lux-label">Merchant Name</label>
              </div>
              <input
                type="text"
                value={editedData.merchantName}
                onChange={(e) => setEditedData({ ...editedData, merchantName: e.target.value })}
                className="text-xl font-serif w-full border-b border-lux-border py-1 focus:border-lux-black outline-none transition-all"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lux-black opacity-40">
                <MapPin size={14} />
                <label className="lux-label">Merchant Address</label>
              </div>
              <input
                type="text"
                value={editedData.merchantAddress || ''}
                onChange={(e) => setEditedData({ ...editedData, merchantAddress: e.target.value })}
                className="text-lg font-serif w-full border-b border-lux-border py-1 focus:border-lux-black outline-none transition-all placeholder:text-gray-200"
                placeholder="Street, City, Postcode"
              />
            </div>

            {/* VAT Number & Business ID */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lux-black opacity-40">
                  <ShieldCheck size={14} />
                  <label className="lux-label">VAT / Tax Number</label>
                </div>
                <input
                  type="text"
                  value={editedData.merchantVatNumber || ''}
                  onChange={(e) => setEditedData({ ...editedData, merchantVatNumber: e.target.value })}
                  className="text-lg font-serif w-full border-b border-lux-border py-1 focus:border-lux-black outline-none transition-all placeholder:text-gray-200"
                  placeholder="Not found"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lux-black opacity-40">
                  <Fingerprint size={14} />
                  <label className="lux-label">Business / Company ID</label>
                </div>
                <input
                  type="text"
                  value={editedData.merchantBusinessId || ''}
                  onChange={(e) => setEditedData({ ...editedData, merchantBusinessId: e.target.value })}
                  className="text-lg font-serif w-full border-b border-lux-border py-1 focus:border-lux-black outline-none transition-all placeholder:text-gray-200"
                  placeholder="Not found"
                />
              </div>
            </div>

            {/* Phone & Receipt Number */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lux-black opacity-40">
                  <Phone size={14} />
                  <label className="lux-label">Merchant Phone</label>
                </div>
                <input
                  type="text"
                  value={editedData.merchantPhone || ''}
                  onChange={(e) => setEditedData({ ...editedData, merchantPhone: e.target.value })}
                  className="text-lg font-serif w-full border-b border-lux-border py-1 focus:border-lux-black outline-none transition-all placeholder:text-gray-200"
                  placeholder="Not found"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lux-black opacity-40">
                  <Hash size={14} />
                  <label className="lux-label">Receipt Number</label>
                </div>
                <input
                  type="text"
                  value={editedData.receiptNumber || ''}
                  onChange={(e) => setEditedData({ ...editedData, receiptNumber: e.target.value })}
                  className="text-lg font-serif w-full border-b border-lux-border py-1 focus:border-lux-black outline-none transition-all placeholder:text-gray-200"
                  placeholder="Not found"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Amount */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lux-black opacity-40">
                  <CreditCard size={14} />
                  <label className="lux-label">Total Amount</label>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-serif">{editedData.currency}</span>
                  <input 
                    type="number" 
                    value={editedData.amount}
                    onChange={(e) => setEditedData({ ...editedData, amount: parseFloat(e.target.value) })}
                    className="text-2xl font-serif font-medium w-full border-b border-lux-border py-1 focus:border-lux-black outline-none transition-all"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lux-black opacity-40">
                  <Calendar size={14} />
                  <label className="lux-label">Transaction Date</label>
                </div>
                <input 
                  type="date" 
                  value={editedData.date}
                  onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
                  className="text-xl font-serif w-full border-b border-lux-border py-1 focus:border-lux-black outline-none transition-all"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lux-black opacity-40">
                <Tag size={14} />
                <label className="lux-label">Expense Category</label>
              </div>
              <select 
                value={editedData.category}
                onChange={(e) => setEditedData({ ...editedData, category: e.target.value })}
                className="text-lg font-serif w-full border-b border-lux-border py-1 focus:border-lux-black outline-none bg-transparent appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Reference & Tax */}
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-2">
                <div className="flex items-center gap-2 text-lux-black opacity-40">
                  <Landmark size={14} />
                  <label className="lux-label">Tax Rate (%)</label>
                </div>
                <input 
                  type="number" 
                  value={editedData.taxRate || 0}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) || 0;
                    // Formula to extract tax from total: Total * (Rate / (100 + Rate))
                    const amount = (editedData.amount * rate) / (100 + rate);
                    setEditedData({ ...editedData, taxRate: rate, taxAmount: parseFloat(amount.toFixed(2)) });
                  }}
                  className="text-lg font-serif w-full border-b border-lux-border py-1 focus:border-lux-black outline-none transition-all placeholder:text-gray-200"
                  placeholder="0%"
                />
              </div>
               <div className="space-y-2">
                <div className="flex items-center gap-2 text-lux-black opacity-40">
                  <AlertTriangle size={14} />
                  <label className="lux-label">Tax Amount</label>
                </div>
                <input 
                  type="number" 
                  value={editedData.taxAmount || 0}
                  onChange={(e) => {
                    const amount = parseFloat(e.target.value) || 0;
                    const rate = editedData.amount > 0 ? (amount / editedData.amount) * 100 : 0;
                    setEditedData({ ...editedData, taxAmount: amount, taxRate: parseFloat(rate.toFixed(1)) });
                  }}
                  className="text-lg font-serif w-full border-b border-lux-border py-1 focus:border-lux-black outline-none transition-all"
                />
              </div>
            </div>

            {/* Reference */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lux-black opacity-40">
                <Landmark size={14} />
                <label className="lux-label">Reference / Receipt #</label>
              </div>
              <input 
                type="text" 
                value={editedData.reference || ''}
                onChange={(e) => setEditedData({ ...editedData, reference: e.target.value })}
                className="text-lg font-serif w-full border-b border-lux-border py-1 focus:border-lux-black outline-none transition-all placeholder:text-gray-200"
                placeholder="Optional"
              />
            </div>

            {/* Business & Recurring Toggles */}
            <div className="pt-6 border-t border-lux-border mt-10 space-y-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                  onClick={() => setEditedData({ ...editedData, isBusiness: !editedData.isBusiness })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all flex items-center p-1",
                    editedData.isBusiness ? "bg-lux-black" : "bg-gray-200"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                    editedData.isBusiness ? "translate-x-6" : "translate-x-0"
                  )} />
                </div>
                <span className="text-sm font-sans font-medium">Classify as Business Expense</span>
              </label>

              <div className={cn(
                "p-4 rounded-2xl border transition-all duration-500",
                editedData.isRecurring ? "bg-lux-gold/5 border-lux-gold/20" : "bg-white border-lux-border"
              )}>
                <label className="flex items-center gap-3 cursor-pointer group mb-4">
                  <div 
                    onClick={() => setEditedData({ 
                      ...editedData, 
                      isRecurring: !editedData.isRecurring,
                      frequency: !editedData.isRecurring ? 'monthly' : undefined 
                    })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all flex items-center p-1",
                      editedData.isRecurring ? "bg-lux-gold" : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                      editedData.isRecurring ? "translate-x-6" : "translate-x-0"
                    )} />
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw size={14} className={cn("transition-colors", editedData.isRecurring ? "text-lux-gold" : "text-gray-400")} />
                    <span className="text-sm font-sans font-medium">Set as Recurring Expense</span>
                  </div>
                </label>

                {editedData.isRecurring && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2">
                      {['weekly', 'monthly', 'yearly'].map(freq => (
                        <button
                          key={freq}
                          onClick={() => setEditedData({ ...editedData, frequency: freq as any })}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-[10px] uppercase font-mono tracking-widest transition-all",
                            editedData.frequency === freq
                              ? "bg-lux-gold text-lux-black font-bold"
                              : "bg-white border border-lux-border text-gray-400 hover:border-lux-gold hover:text-lux-gold"
                          )}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <button 
              onClick={onCancel}
              className="px-8 py-3 rounded-full font-sans text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all"
            >
              Discard
            </button>
            <button 
              onClick={() => onSave(editedData)}
              className="flex-1 bg-lux-black text-white px-8 py-3 rounded-full font-sans text-sm font-medium flex items-center justify-center gap-2 hover:bg-lux-black/90 transition-all shadow-lg shadow-lux-black/10"
            >
              <Save size={16} />
              Approve & Store Receipt
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
