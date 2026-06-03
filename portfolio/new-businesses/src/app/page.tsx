import BusinessDashboard from '@/components/BusinessDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Finland New Business Harvester & Dashboard | Portfolio',
  description: 'Full-stack Next.js portfolio component harvesting new businesses (Oy & Toiminimi) registered daily in Finland, storing them in Google Sheets, and presenting an enriched filterable dashboard.',
};

export default function HomePage() {
  return (
    <div className="flex-1 bg-background text-foreground flex flex-col font-sans">
      
      {/* Premium Hero Header */}
      <header className="border-b border-border-subtle py-12 md:py-16 bg-gradient-to-b from-card-bg/30 to-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="space-y-4">
            <span className="text-[10px] md:text-xs tracking-[4px] uppercase text-gold font-light block">
              Agentic Ingestion Pipeline
            </span>
            <h1 className="text-3xl md:text-5xl font-extralight tracking-tight leading-none text-foreground">
              Finland New Business Harvester
            </h1>
            <p className="max-w-3xl text-sm md:text-base opacity-60 leading-relaxed font-light">
              A full-stack, serverless pipeline executing every 24 hours. Harvests newly registered corporations (Oy) via the PRH Open Data API and scrapes sole traders (Toiminimi) via the PRH Virre search engine, deduplicates records, stores them in Google Sheets, and enriches listings with LinkedIn and Domain search shortcuts.
            </p>
            
            {/* Tech Stack Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 bg-card-bg border border-border-subtle rounded-full text-xs font-mono text-gold opacity-80">
                Next.js 15 (App Router)
              </span>
              <span className="px-3 py-1 bg-card-bg border border-border-subtle rounded-full text-xs font-mono text-gold opacity-80">
                Google Sheets & Drive APIs
              </span>
              <span className="px-3 py-1 bg-card-bg border border-border-subtle rounded-full text-xs font-mono text-gold opacity-80">
                Playwright Browser Scraping
              </span>
              <span className="px-3 py-1 bg-card-bg border border-border-subtle rounded-full text-xs font-mono text-gold opacity-80">
                PRH Open Data API v3
              </span>
              <span className="px-3 py-1 bg-card-bg border border-border-subtle rounded-full text-xs font-mono text-gold opacity-80">
                Tailwind CSS v4
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex-1 w-full space-y-12">
        
        {/* Project Architecture Walkthrough */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-card-bg border border-border-subtle rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="text-sm tracking-wider uppercase text-gold font-light mb-3">1. Harvesting Routine</h3>
              <p className="text-xs opacity-60 leading-relaxed font-light">
                Running every 24 hours via a Vercel Cron/Scheduled Function, the server-side API queries Oy registrations from the PRH API and spins up Playwright to navigate the Virre service to extract Toiminimi registrations, which are generally omitted from open APIs.
              </p>
            </div>
            <div className="mt-4 border-t border-border-subtle pt-3">
              <span className="text-[10px] font-mono opacity-40">API Endpoint: /api/cron/harvest</span>
            </div>
          </div>

          <div className="p-6 bg-card-bg border border-border-subtle rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="text-sm tracking-wider uppercase text-gold font-light mb-3">2. Google Sheets Database</h3>
              <p className="text-xs opacity-60 leading-relaxed font-light">
                Connects directly to your workspace using secure service account credentials. The pipeline automatically locates or creates a sheet named <strong>"NewBusinesses"</strong>, reads existing keys to prevent duplicates, and appends the cleansed rows.
              </p>
            </div>
            <div className="mt-4 border-t border-border-subtle pt-3">
              <span className="text-[10px] font-mono opacity-40">Spreadsheet Name: NewBusinesses</span>
            </div>
          </div>

          <div className="p-6 bg-card-bg border border-border-subtle rounded-lg flex flex-col justify-between">
            <div>
              <h3 className="text-sm tracking-wider uppercase text-gold font-light mb-3">3. Dynamic Enrichment</h3>
              <p className="text-xs opacity-60 leading-relaxed font-light">
                Every business is automatically mapped to calculate specific search shortcuts: a Google Search for the founders/leadership on LinkedIn, and a search to discover their business domains, making outreach and verification immediate.
              </p>
            </div>
            <div className="mt-4 border-t border-border-subtle pt-3">
              <span className="text-[10px] font-mono opacity-40">Actions: LinkedIn Finder, Domain Discovery</span>
            </div>
          </div>
        </section>

        {/* Live Dashboard Demo */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-light tracking-tight text-foreground">
                Registered Businesses Directory
              </h2>
              <p className="text-xs opacity-60 font-light mt-1">
                Live interactive data table querying rows directly from the Google Sheets database.
              </p>
            </div>
            <div className="text-xs opacity-40 italic">
              Currently displaying records loaded dynamically.
            </div>
          </div>

          {/* Browser Mockup Window Wrapper */}
          <div className="border border-border-gold rounded-lg overflow-hidden shadow-2xl">
            {/* Browser Header Bar */}
            <div className="bg-card-bg-secondary border-b border-border-gold px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
              </div>
              <div className="flex-1 max-w-md mx-auto bg-background/50 rounded border border-border-subtle text-center text-[10px] font-mono py-0.5 text-foreground/50 select-none">
                luxival.com/portfolio/new-businesses/embed
              </div>
            </div>
            
            {/* The Dashboard Component inside Mockup */}
            <div className="p-6 bg-background">
              <BusinessDashboard />
            </div>
          </div>
        </section>

        {/* Embed Instructions */}
        <section className="p-6 bg-card-bg border border-border-subtle rounded-lg space-y-4">
          <h3 className="text-sm tracking-wider uppercase text-gold font-light">Embedding in Luxival Website</h3>
          <p className="text-xs opacity-60 leading-relaxed font-light">
            This Next.js dashboard is built specifically to be embedded anywhere on your portfolio or website as a responsive iframe. The dedicated <code>/embed</code> route strips all navigation elements, offering a seamless grid layout.
          </p>
          <pre className="p-4 bg-background border border-border-subtle text-xs rounded font-mono text-gold overflow-x-auto">
{`<iframe
  src="/portfolio/new-businesses/embed"
  title="Finland New Businesses Harvester"
  style="width: 100%; height: 750px; border: none; background: #0A0B0F;"
  loading="lazy">
</iframe>`}
          </pre>
        </section>
      </main>

      <footer className="border-t border-border-subtle py-8 text-center text-xs opacity-45 font-light">
        Luxival © 2026 · Premium Full-Stack Portfolio Integration
      </footer>
    </div>
  );
}
