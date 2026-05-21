import { AgentConfig, AnalyticsData, KnowledgeDocument, Integration } from './types';

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  name: "Vortex Assistant",
  primaryColor: "#14b8a6",
  greeting: "Hi there! I'm your Vortex AI assistant. How can I help you today?",
  systemInstruction: `You are an advanced AI assistant for a SaaS company. 
You have two primary modes: Sales and Support.
- If the user asks about pricing, features, or buying, act as a Sales Agent: Be persuasive, highlight benefits, and try to capture their email to "send more info".
- If the user asks about bugs, how-to, or issues, act as a Support Agent: Be empathetic, provide clear steps, and offer to "create a ticket" if you can't resolve it.
Always be polite, concise, and professional. Format responses with markdown for readability.`
};

export const MOCK_ANALYTICS: AnalyticsData[] = [
  { date: 'Mon', conversations: 120, leads: 15, csat: 4.2 },
  { date: 'Tue', conversations: 150, leads: 22, csat: 4.5 },
  { date: 'Wed', conversations: 180, leads: 30, csat: 4.6 },
  { date: 'Thu', conversations: 140, leads: 18, csat: 4.3 },
  { date: 'Fri', conversations: 200, leads: 45, csat: 4.8 },
  { date: 'Sat', conversations: 90, leads: 10, csat: 4.1 },
  { date: 'Sun', conversations: 110, leads: 12, csat: 4.4 },
];

export const MOCK_KNOWLEDGE_BASE: KnowledgeDocument[] = [
  { id: '1', url: 'https://example.com/pricing', status: 'indexed', chunks: 24, lastUpdated: '2 hours ago' },
  { id: '2', url: 'https://example.com/docs/api', status: 'indexed', chunks: 156, lastUpdated: '1 day ago' },
  { id: '3', url: 'https://example.com/blog/new-features', status: 'indexed', chunks: 42, lastUpdated: '3 days ago' },
  { id: '4', url: 'https://example.com/support/faq', status: 'crawling', chunks: 0, lastUpdated: 'Just now' },
];

export const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'salesforce', name: 'Salesforce', category: 'CRM', connected: true, icon: 'Cloud', description: 'Sync leads and contacts automatically.' },
  { id: 'hubspot', name: 'HubSpot', category: 'CRM', connected: false, icon: 'Hubspot', description: 'Inbound marketing and sales software.' },
  { id: 'zendesk', name: 'Zendesk', category: 'Support', connected: true, icon: 'Headphones', description: 'Create support tickets from chats.' },
  { id: 'slack', name: 'Slack', category: 'Communication', connected: false, icon: 'MessageSquare', description: 'Get notified of hot leads and escalations.' },
  { id: 'stripe', name: 'Stripe', category: 'Billing', connected: false, icon: 'CreditCard', description: 'Handle billing queries and subscription status.' },
];