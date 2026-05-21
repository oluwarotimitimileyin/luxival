import React, { useState } from 'react';
import { Layout, ViewType } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AgentConfig } from './components/AgentConfig';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Integrations } from './components/Integrations';
import { ChatWidget } from './components/ChatWidget';
import { DEFAULT_AGENT_CONFIG } from './constants';
import { AgentConfig as AgentConfigType } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [agentConfig, setAgentConfig] = useState<AgentConfigType>(DEFAULT_AGENT_CONFIG);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'integrations':
        return <Integrations />;
      case 'config':
        return <AgentConfig config={agentConfig} onSave={setAgentConfig} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
      
      {/* The Chat Widget is always rendered to simulate the embedded experience */}
      <ChatWidget config={agentConfig} />
    </Layout>
  );
};

export default App;