import React, { useState } from 'react';
import { AgentConfig as AgentConfigType } from '../types';
import { Save, Code, CheckCircle2 } from 'lucide-react';

interface AgentConfigProps {
  config: AgentConfigType;
  onSave: (newConfig: AgentConfigType) => void;
}

export const AgentConfig: React.FC<AgentConfigProps> = ({ config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<AgentConfigType>(config);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalConfig(prev => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    onSave(localConfig);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const embedCode = `<script src="https://cdn.vortex-ai.com/widget.js"></script>
<script>
  VortexAI.init({
    agentId: "ag_123456789",
    theme: "${localConfig.primaryColor}"
  });
</script>`;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Configuration</h1>
        <p className="text-gray-500 mt-1">Customize your AI agent's behavior and appearance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input
                  type="text"
                  name="name"
                  value={localConfig.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vortex-500 focus:border-vortex-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Greeting Message</label>
                <input
                  type="text"
                  name="greeting"
                  value={localConfig.greeting}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vortex-500 focus:border-vortex-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color (Hex)</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    name="primaryColor"
                    value={localConfig.primaryColor}
                    onChange={handleChange}
                    className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={localConfig.primaryColor}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vortex-500 focus:border-vortex-500 outline-none transition-all uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Brain & Routing (System Instruction)</h2>
            <p className="text-sm text-gray-500 mb-4">
              Define how the agent behaves, handles sales vs support, and its overall persona.
            </p>
            <textarea
              name="systemInstruction"
              value={localConfig.systemInstruction}
              onChange={handleChange}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vortex-500 focus:border-vortex-500 outline-none transition-all font-mono text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-vortex-600 hover:bg-vortex-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} />}
              <span>{isSaved ? 'Saved!' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Code size={20} className="text-vortex-400" />
              <h3 className="text-lg font-semibold">Embed Code</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Copy and paste this snippet into your website's <code className="bg-gray-800 px-1 rounded">&lt;head&gt;</code> tag to deploy the widget.
            </p>
            <div className="bg-gray-950 p-4 rounded-xl overflow-x-auto">
              <pre className="text-xs text-gray-300 font-mono">
                {embedCode}
              </pre>
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(embedCode)}
              className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Copy to Clipboard
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h3 className="text-blue-800 font-semibold mb-2">Test Your Agent</h3>
            <p className="text-blue-600 text-sm">
              Use the chat widget in the bottom right corner of this screen to test your configuration changes in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};