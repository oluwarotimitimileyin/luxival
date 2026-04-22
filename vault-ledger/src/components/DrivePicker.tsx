import React, { useState, useEffect } from 'react';
import { X, Cloud, FileText, Image as ImageIcon, Loader2, Search, ExternalLink, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { cn } from '../lib/utils';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
}

interface DrivePickerProps {
  onClose: () => void;
  onFilesSelect: (fileIds: string[]) => void;
  isProcessing: boolean;
}

export default function DrivePicker({ onClose, onFilesSelect, isProcessing }: DrivePickerProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/drive/files');
      setFiles(response.data.files || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch drive files:', err);
      setError('Could not access your Google Drive. Ensure you are connected.');
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    if (isProcessing) return;
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-lux-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-4xl h-[70vh] flex flex-col overflow-hidden shadow-2xl shadow-lux-black/20"
      >
        <div className="p-8 border-b border-lux-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-lux-gold/10 rounded-2xl flex items-center justify-center text-lux-gold">
              <Cloud size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif">Cloud Vault</h2>
              <p className="text-gray-400 text-sm">Select a receipt from your Linked Drive</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-lux-gray rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 bg-lux-gray/30 border-b border-lux-border">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search across your cloud storage..."
              className="w-full bg-white border border-lux-border rounded-xl py-3 pl-12 pr-6 outline-none focus:border-lux-black transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-serif italic">Synchronizing with Google Drive...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-red-500">
              <Cloud className="w-12 h-12 opacity-50" />
              <p className="font-serif italic">{error}</p>
              <button 
                onClick={fetchFiles}
                className="text-xs uppercase tracking-widest font-mono font-bold mt-2 hover:underline"
              >
                Retry Connection
              </button>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400">
              <Search className="w-12 h-12 opacity-50" />
              <p className="font-serif italic font-medium">No suitable financial documents found.</p>
              <p className="text-xs font-mono max-w-xs text-center">We only index PDF and common image formats for security.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredFiles.map(file => {
                const isSelected = selectedIds.includes(file.id);
                return (
                  <button
                    key={file.id}
                    disabled={isProcessing}
                    onClick={() => toggleSelection(file.id)}
                    className={cn(
                      "group flex flex-col items-center p-4 rounded-2xl border transition-all hover:bg-lux-gray/50 text-center relative",
                      isSelected ? "border-lux-gold bg-lux-gold/5" : "border-lux-border bg-white",
                      isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 bg-lux-gold text-lux-black rounded-full p-1 shadow-lg scale-110">
                        <Check size={14} strokeWidth={4} />
                      </div>
                    )}
                    <div className="w-full aspect-square bg-lux-gray rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-lux-border relative">
                      {file.thumbnailLink ? (
                        <img src={file.thumbnailLink.replace('=s220', '=s400')} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        file.mimeType === 'application/pdf' ? <FileText size={40} className="text-lux-gold" /> : <ImageIcon size={40} className="text-gray-300" />
                      )}
                      <div className="absolute inset-0 bg-lux-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] uppercase font-mono tracking-widest font-bold">
                        {isSelected ? "Unselect" : "Select Item"}
                      </div>
                    </div>
                    <p className="text-xs font-mono font-semibold truncate w-full px-1">{file.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-1">{file.mimeType.split('/')[1]}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-8 py-6 border-t border-lux-border bg-lux-gray/20 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-serif">{selectedIds.length} Items Staged</p>
            <p className="text-[10px] text-gray-400 font-mono uppercase">Ready for AI Ingestion</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest border border-lux-border hover:bg-white transition-all"
            >
              Cancel
            </button>
            <button 
              disabled={selectedIds.length === 0 || isProcessing}
              onClick={() => onFilesSelect(selectedIds)}
              className={cn(
                "px-8 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all",
                selectedIds.length > 0 
                  ? "bg-lux-black text-white hover:bg-lux-black/90 shadow-lg shadow-lux-black/10" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              Process Vault Items
            </button>
          </div>
        </div>

        {isProcessing && (
          <div className="p-8 bg-lux-black text-white flex items-center justify-between animate-in slide-in-from-bottom-full duration-500">
            <div className="flex items-center gap-4">
              <Loader2 className="animate-spin text-lux-gold" size={24} />
              <div>
                <p className="text-sm font-serif">Vault Insight Engine Active</p>
                <p className="text-[10px] text-gray-400 font-mono">Running OCR and Classification...</p>
              </div>
            </div>
            <div className="h-1 w-48 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 10, repeat: Infinity }}
                className="h-full bg-lux-gold"
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
