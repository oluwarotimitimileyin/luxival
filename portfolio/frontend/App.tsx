import React, { useState } from 'react';
import { checkseo } from './api';
import { AuditReport } from './types';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'json'>('dashboard');

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      const result = await checkseo(url);
      setReport(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!report) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "dominance_brief.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Header */}
      <header className="border-b-4 border-black dark:border-white sticky top-0 z-10 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-black dark:bg-white"></div>
            <h1 className="font-black text-2xl tracking-tighter uppercase">GROWTH_ARCHITECT</h1>
          </div>
          {report && (
            <div className="flex border-2 border-black dark:border-white">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-4 py-1 font-mono text-sm font-bold uppercase transition-colors ${
                  viewMode === 'dashboard' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-gray-200 dark:hover:bg-neutral-800'
                }`}
              >
                UI_View
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-4 py-1 font-mono text-sm font-bold uppercase border-l-2 border-black dark:border-white transition-colors ${
                  viewMode === 'json' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-gray-200 dark:hover:bg-neutral-800'
                }`}
              >
                Raw_JSON
              </button>
              <button
                onClick={downloadJson}
                className="px-4 py-1 font-mono text-sm font-bold uppercase border-l-2 border-black dark:border-white hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
                title="Download JSON Block"
              >
                [DL]
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero / Input Section */}
        {!report && !loading && (
          <div className="max-w-3xl mx-auto mt-20">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
              Chief Search <br/> Strategist
            </h2>
            <p className="text-xl font-mono mb-12 border-l-4 border-black dark:border-white pl-4">
              Parse raw website health telemetry. Compile a comprehensive digital dominance brief and structure the data footprint into an interactive layout.
            </p>
            <form onSubmit={handleAudit} className="flex flex-col md:flex-row gap-0 border-2 border-black dark:border-white">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="TARGET_URL (e.g., example.com)"
                className="flex-grow px-6 py-4 bg-transparent font-mono text-lg focus:outline-none placeholder-gray-400 dark:placeholder-gray-600"
                required
              />
              <button
                type="submit"
                className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 font-mono font-bold uppercase text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors border-t-2 md:border-t-0 md:border-l-2 border-black dark:border-white"
              >
                Execute
              </button>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-black dark:border-white border-t-transparent dark:border-t-transparent animate-spin mb-8"></div>
            <h3 className="text-3xl font-black uppercase tracking-widest mb-4">Compiling Dominance Brief</h3>
            <p className="font-mono text-center max-w-md">
              Ingesting target URL, evaluating performance, generating agent prompts, and drafting competitor analysis...
            </p>
          </div>
        )}

        {/* Results Section */}
        {report && !loading && (
          <div className="animate-in fade-in duration-500">
            {/* Re-run form */}
            <form onSubmit={handleAudit} className="flex mb-12 border-2 border-black dark:border-white max-w-2xl">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-grow px-4 py-2 bg-transparent font-mono focus:outline-none"
                required
              />
              <button type="submit" className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 font-mono font-bold uppercase border-l-2 border-black dark:border-white hover:bg-gray-800 dark:hover:bg-gray-200">
                Re-Execute
              </button>
            </form>

            {viewMode === 'json' ? (
              <div className="border-2 border-black dark:border-white bg-white dark:bg-black">
                <div className="border-b-2 border-black dark:border-white px-4 py-2 flex justify-between items-center bg-gray-100 dark:bg-neutral-900">
                  <span className="font-mono text-xs font-bold uppercase">Strict Output JSON Target Format</span>
                  <div className="flex gap-4">
                    <button
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(report, null, 2))}
                      className="font-mono text-xs font-bold uppercase hover:underline"
                    >
                      [COPY]
                    </button>
                    <button
                      onClick={downloadJson}
                      className="font-mono text-xs font-bold uppercase hover:underline"
                    >
                      [DOWNLOAD]
                    </button>
                  </div>
                </div>
                <pre className="p-6 overflow-auto font-mono text-sm max-h-[70vh]">
                  {JSON.stringify(report, null, 2)}
                </pre>
              </div>
            ) : (
              <Dashboard report={report} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
