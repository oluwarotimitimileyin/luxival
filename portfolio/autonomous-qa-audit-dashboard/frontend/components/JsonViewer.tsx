import React, { useState } from 'react';
import { AuditReport } from '../types';
import { Copy, Check } from 'lucide-react';

interface JsonViewerProps {
  data: AuditReport;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2d2d2d] border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-4 text-xs font-mono text-gray-400">audit_report.json</span>
          </div>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 text-xs font-medium text-gray-300 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-md"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
        <div className="p-6 overflow-x-auto">
          <pre className="text-sm font-mono text-gray-300 leading-relaxed">
            <code>{jsonString}</code>
          </pre>
        </div>
      </div>
      <p className="text-center text-sm text-gray-500 mt-6 font-light">
        This JSON object strictly matches the requested schema and is ready for server parsing.
      </p>
    </div>
  );
};
