import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, Loader2, AlertCircle, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { extractExpenseFromImage, ExtractedExpense } from '../services/geminiService';
import { cn } from '../lib/utils';
import GoogleDrivePicker from './GoogleDrivePicker';

export interface ReceiptUploadProps {
  onDataExtracted: (data: ExtractedExpense, file: File) => void;
}

export default function ReceiptUpload({ onDataExtracted }: ReceiptUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'local' | 'drive'>('local');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please upload an image or PDF file.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });

      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const data = await extractExpenseFromImage(base64Data, file.type);
      onDataExtracted(data, file);
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Failed to extract information from this receipt. Please check the file and try again.');
    } finally {
      setIsProcessing(false);
      setIsDragging(false);
    }
  };

  const handleDriveFileSelected = async (fileData: { name: string; mimeType: string; data: string }) => {
    setIsProcessing(true);
    setError(null);

    try {
      // The data is already base64 from the server
      const data = await extractExpenseFromImage(fileData.data, fileData.mimeType);
      
      // Create a dummy File object for the preview in the next step
      const byteCharacters = atob(fileData.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: fileData.mimeType });
      const file = new File([blob], fileData.name, { type: fileData.mimeType });

      onDataExtracted(data, file);
    } catch (err) {
      setError('Failed to process metadata from Google Drive file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  return (
    <div className="w-full space-y-8">
      {/* Method Toggle */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit mx-auto">
        <button 
          onClick={() => setUploadMethod('local')}
          className={cn(
            "px-6 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all",
            uploadMethod === 'local' ? "bg-white text-lux-black shadow-sm" : "text-gray-400 hover:text-lux-black"
          )}
        >
          Local Device
        </button>
        <button 
          onClick={() => setUploadMethod('drive')}
          className={cn(
            "px-6 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all flex items-center gap-2",
            uploadMethod === 'drive' ? "bg-white text-lux-black shadow-sm" : "text-gray-400 hover:text-lux-black"
          )}
        >
          <Cloud size={14} />
          Google Drive
        </button>
      </div>

      <AnimatePresence mode="wait">
        {uploadMethod === 'local' ? (
          <motion.div
            key="local"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[300px]",
              isDragging 
                ? "border-lux-gold bg-lux-gold/5" 
                : "border-lux-border hover:border-lux-black hover:bg-gray-50",
              isProcessing && "pointer-events-none opacity-60"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
              accept="image/*,application/pdf"
            />

            {isProcessing ? (
               <div className="flex flex-col items-center text-center">
                 <Loader2 className="w-12 h-12 text-lux-gold animate-spin mb-4" />
                 <h3 className="text-xl font-serif mb-2">Analyzing Document</h3>
                 <p className="text-gray-500 text-sm italic font-serif">Distilling metadata with neural precision...</p>
               </div>
            ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-lux-gray rounded-full flex items-center justify-center mb-6 ring-1 ring-lux-border">
                    <Upload className="w-8 h-8 text-lux-black" />
                  </div>
                  <h3 className="text-2xl font-serif mb-2 font-medium tracking-tight">Drop receipt here</h3>
                  <p className="text-gray-400 max-w-sm mb-6 text-sm">
                    Images or PDFs. Our system handles extraction and categorization automatically.
                  </p>
                  <div className="flex gap-4 text-[10px] font-mono text-lux-gold opacity-50 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Auto-Tax</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Merchant Audit</span>
                  </div>
                </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="drive"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <GoogleDrivePicker onFileSelected={handleDriveFileSelected} />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
