import React, { useState } from 'react';
import { Plug, CheckCircle2, ArrowRight } from 'lucide-react';
import { MOCK_INTEGRATIONS } from '../constants';

export const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState(MOCK_INTEGRATIONS);

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === id ? { ...int, connected: !int.connected } : int
    ));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Plug className="text-vortex-500" size={32} />
          Integrations
        </h1>
        <p className="text-gray-500 mt-2">Connect your AI agent to your existing CRM, support, and communication tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 font-bold text-xl">
                {integration.name.charAt(0)}
              </div>
              {integration.connected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  <CheckCircle2 size={12} /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  Not Connected
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1">{integration.name}</h3>
            <p className="text-sm text-vortex-600 font-medium mb-3">{integration.category}</p>
            <p className="text-gray-500 text-sm flex-grow mb-6">{integration.description}</p>
            
            <button
              onClick={() => toggleConnection(integration.id)}
              className={`w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                integration.connected 
                  ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {integration.connected ? 'Configure Settings' : 'Connect Account'}
              {!integration.connected && <ArrowRight size={16} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};