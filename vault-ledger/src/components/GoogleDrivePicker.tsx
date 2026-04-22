import { useState, useEffect } from 'react';
import { Cloud, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import axios from 'axios';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
}

interface GoogleDrivePickerProps {
  onFileSelected: (fileData: { name: string; mimeType: string; data: string }) => void;
}

export default function GoogleDrivePicker({ onFileSelected }: GoogleDrivePickerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/drive/list');
      setFiles(response.data.files);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      // If 401, we are not connected
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();

    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        fetchFiles();
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  const handleConnect = async () => {
    try {
      const { data } = await axios.get('/api/auth/google/url');
      const width = 600, height = 700;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      window.open(data.url, 'google-auth', `width=${width},height=${height},left=${left},top=${top}`);
    } catch (err) {
      setError("Failed to initialize Google Authentication");
    }
  };

  const selectFile = async (fileId: string) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/api/drive/file/${fileId}`);
      onFileSelected(data);
    } catch (err) {
      setError("Failed to download file from Google Drive");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-lux-border rounded-2xl bg-white space-y-4">
        <div className="w-16 h-16 bg-lux-gray rounded-full flex items-center justify-center">
          <Cloud className="w-8 h-8 text-lux-black opacity-30" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-serif mb-1">Google Drive</h3>
          <p className="text-sm text-gray-500">Connect your account to import receipts directly.</p>
        </div>
        <button 
          onClick={handleConnect}
          className="lux-button-primary w-full max-w-[200px]"
        >
          Connect Account
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-lux-border rounded-2xl overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b border-lux-border flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <Cloud size={16} className="text-lux-gold" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-lux-black">Google Drive Files</span>
        </div>
        <button onClick={fetchFiles} className="text-[10px] uppercase font-bold text-gray-400 hover:text-lux-black transition-colors">
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading && files.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-lux-gold" />
          </div>
        ) : files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 italic font-serif">
            <p>No valid receipts found in your Drive.</p>
            <p className="text-[10px] mt-2 font-mono uppercase">Images or PDFs only</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {files.map(file => (
              <button 
                key={file.id}
                onClick={() => selectFile(file.id)}
                className="flex flex-col items-start p-3 border border-lux-border rounded-xl hover:bg-lux-black hover:text-white transition-all group text-left relative"
              >
                {file.thumbnailLink ? (
                  <img src={file.thumbnailLink} className="w-full h-24 object-cover rounded-lg mb-2 opacity-80 group-hover:opacity-100" />
                ) : (
                  <div className="w-full h-24 bg-gray-100 flex items-center justify-center rounded-lg mb-2 group-hover:bg-white/10">
                    <FileText size={24} className="text-gray-300" />
                  </div>
                )}
                <p className="text-xs font-medium truncate w-full">{file.name}</p>
                <p className="text-[8px] uppercase tracking-tighter opacity-40">{file.mimeType.split('/')[1]}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-[10px] font-mono border-t border-red-100 uppercase tracking-tighter text-center">
          {error}
        </div>
      )}

      {isLoading && files.length > 0 && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
          <Loader2 className="animate-spin text-lux-black" />
        </div>
      )}
    </div>
  );
}
