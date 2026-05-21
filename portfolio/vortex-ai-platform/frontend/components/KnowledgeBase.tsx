import React, { useState } from 'react';
import { Database, Search, Plus, Trash2, RefreshCw, Globe } from 'lucide-react';
import { MOCK_KNOWLEDGE_BASE } from '../constants';
import { KnowledgeDocument } from '../types';

export const KnowledgeBase: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(MOCK_KNOWLEDGE_BASE);
  const [newUrl, setNewUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    
    const newDoc: KnowledgeDocument = {
      id: Date.now().toString(),
      url: newUrl,
      status: 'crawling',
      chunks: 0,
      lastUpdated: 'Just now'
    };
    
    setDocuments([newDoc, ...documents]);
    setNewUrl('');
    setIsScanning(true);
    
    // Simulate crawling process
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => 
        doc.id === newDoc.id 
          ? { ...doc, status: 'indexed', chunks: Math.floor(Math.random() * 50) + 10 } 
          : doc
      ));
      setIsScanning(false);
    }, 3000);
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="text-vortex-500" size={32} />
            Knowledge Base
          </h1>
          <p className="text-gray-500 mt-2">Manage the data your AI agent uses to answer questions.</p>
        </div>
        <div className="bg-vortex-50 text-vortex-700 px-4 py-2 rounded-lg text-sm font-medium border border-vortex-100">
          Total Indexed Chunks: {documents.reduce((acc, doc) => acc + doc.chunks, 0)}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleAddUrl} className="flex gap-4">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/docs"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-vortex-500 focus:border-vortex-500 outline-none transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isScanning || !newUrl.trim()}
              className="bg-vortex-600 hover:bg-vortex-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isScanning ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
              <span>Crawl URL</span>
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-medium">Source URL</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Vector Chunks</th>
                <th className="p-4 font-medium">Last Updated</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Globe size={16} className="text-gray-400" />
                      <a href={doc.url} target="_blank" rel="noreferrer" className="hover:text-vortex-600 truncate max-w-md block">
                        {doc.url}
                      </a>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'indexed' ? 'bg-green-50 text-green-700 border border-green-200' :
                      doc.status === 'crawling' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {doc.status === 'crawling' && <RefreshCw size={12} className="animate-spin" />}
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{doc.chunks}</td>
                  <td className="p-4 text-gray-500 text-sm">{doc.lastUpdated}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="Delete from index"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No documents indexed yet. Add a URL above to start crawling.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};