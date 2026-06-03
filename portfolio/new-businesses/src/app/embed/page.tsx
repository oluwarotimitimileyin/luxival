import BusinessDashboard from '@/components/BusinessDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finland New Business Harvester Embed',
  description: 'Interactive dashboard showing newly registered businesses in Finland.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmbedPage() {
  return (
    <main className="p-4 md:p-6 w-full min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <BusinessDashboard />
      </div>
    </main>
  );
}
