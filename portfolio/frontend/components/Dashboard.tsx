import React from 'react';
import { AuditReport } from '../types';
import { ScoreCard } from './ScoreCard';

interface DashboardProps {
  report: AuditReport;
}

export const Dashboard: React.FC<DashboardProps> = ({ report }) => {
  return (
    <div className="w-full font-sans text-black dark:text-white">
      
      {/* Top Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-black dark:border-white mb-12">
        <div className="p-6 border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white col-span-1 md:col-span-2 flex flex-col justify-center">
          <div className="font-mono text-xs uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400">Target URL</div>
          <h2 className="text-2xl md:text-4xl font-bold truncate">{report.target_url}</h2>
        </div>
        
        <div className="grid grid-rows-2 col-span-1">
          <div className="p-6 border-b-2 border-black dark:border-white flex flex-col justify-center items-center bg-black text-white dark:bg-white dark:text-black">
            <div className="font-mono text-xs uppercase tracking-widest mb-1">Overall Score</div>
            <div className="text-5xl font-mono font-black">{report.overall_score.toFixed(1)}</div>
          </div>
          <div className="p-6 flex flex-col justify-center items-center">
            <div className="font-mono text-xs uppercase tracking-widest mb-2">Status</div>
            <div className="text-xl font-bold uppercase tracking-widest border-2 border-black dark:border-white px-4 py-2">
              {report.pass_status.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t-2 border-l-2 border-black dark:border-white mb-12">
        <div className="border-r-2 border-b-2 border-black dark:border-white">
          <ScoreCard title="SEO" score={report.dashboard_metrics.seo} />
        </div>
        <div className="border-r-2 border-b-2 border-black dark:border-white">
          <ScoreCard title="Performance" score={report.dashboard_metrics.performance} />
        </div>
        <div className="border-r-2 border-b-2 border-black dark:border-white">
          <ScoreCard title="Accessibility" score={report.dashboard_metrics.accessibility} />
        </div>
        <div className="border-r-2 border-b-2 border-black dark:border-white">
          <ScoreCard title="Security" score={report.dashboard_metrics.security} />
        </div>
      </div>

      {/* Web Builder Agent Prompt */}
      <div className="mb-12">
        <h3 className="text-3xl font-bold uppercase tracking-tighter mb-6 border-b-4 border-black dark:border-white pb-2 inline-block">
          Web Builder Agent Prompt
        </h3>
        <div className="border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black p-6 relative group">
          <button 
            onClick={() => navigator.clipboard.writeText(report.web_builder_agent_prompt)}
            className="absolute top-4 right-4 font-mono text-xs font-bold uppercase border-2 border-white dark:border-black px-3 py-1 hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors"
          >
            [COPY PROMPT]
          </button>
          <div className="font-mono text-xs uppercase tracking-widest mb-4 text-gray-400 dark:text-gray-500">System Instruction</div>
          <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
            {report.web_builder_agent_prompt}
          </pre>
        </div>
      </div>

      {/* Competitor Analysis Matrix */}
      <div className="mb-12">
        <h3 className="text-3xl font-bold uppercase tracking-tighter mb-6 border-b-4 border-black dark:border-white pb-2 inline-block">
          Competitor Analysis Matrix
        </h3>
        <div className="border-2 border-black dark:border-white mb-6 p-6 bg-gray-100 dark:bg-neutral-900">
          <div className="font-mono text-xs uppercase tracking-widest mb-2 font-bold">Market Position</div>
          <p className="text-lg font-medium">{report.competitor_analysis.market_position}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-black dark:border-white font-mono text-xs font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black hidden md:grid">
          <div className="p-4 border-r-2 border-black dark:border-white">Competitor Name</div>
          <div className="p-4 border-r-2 border-black dark:border-white">Advantage Over Target</div>
          <div className="p-4">Target Remediation Opportunity</div>
        </div>
        
        <div className="flex flex-col border-2 border-t-0 border-black dark:border-white">
          {report.competitor_analysis.competitor_gaps.map((gap, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b-2 last:border-b-0 border-black dark:border-white">
              <div className="p-4 md:p-6 border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white bg-gray-50 dark:bg-neutral-900">
                <div className="font-mono text-[10px] uppercase mb-1 md:hidden">Competitor Name</div>
                <div className="font-bold text-lg">{gap.competitor_name}</div>
              </div>
              <div className="p-4 md:p-6 border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white">
                <div className="font-mono text-[10px] uppercase mb-2 md:hidden">Advantage Over Target</div>
                <p className="text-sm">{gap.advantage_over_target}</p>
              </div>
              <div className="p-4 md:p-6">
                <div className="font-mono text-[10px] uppercase mb-2 md:hidden">Target Remediation Opportunity</div>
                <p className="text-sm font-medium">{gap.target_remediation_opportunity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gaps & Remediation */}
      <div className="mb-12">
        <h3 className="text-3xl font-bold uppercase tracking-tighter mb-6 border-b-4 border-black dark:border-white pb-2 inline-block">
          Developer Action Plan
        </h3>
        
        <div className="hidden lg:grid grid-cols-12 gap-0 border-2 border-b-0 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold uppercase tracking-widest">
          <div className="col-span-3 p-4 border-r-2 border-black dark:border-white">Metric / Status</div>
          <div className="col-span-4 p-4 border-r-2 border-black dark:border-white">Description & Strategy</div>
          <div className="col-span-5 p-4">Execution Pipeline</div>
        </div>

        <div className="flex flex-col gap-0 border-2 border-black dark:border-white">
          {report.identified_gaps.map((gap, idx) => (
            <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b-2 last:border-b-0 border-black dark:border-white bg-white dark:bg-black">
              
              <div className="col-span-3 p-4 md:p-6 border-b-2 lg:border-b-0 lg:border-r-2 border-black dark:border-white bg-gray-100 dark:bg-neutral-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="font-mono text-xs font-bold bg-black text-white dark:bg-white dark:text-black px-2 py-1 uppercase">
                      {gap.status}
                    </span>
                    <span className="font-mono text-xs border border-black dark:border-white px-2 py-1 uppercase bg-white dark:bg-black">
                      {gap.category}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{gap.metric_name}</h4>
                </div>
                <div className="mt-4">
                  <div className="font-mono text-[10px] text-gray-500 dark:text-gray-400 uppercase">Clause Ref</div>
                  <div className="font-mono text-xs font-bold">{gap.clause_reference}</div>
                </div>
              </div>

              <div className="col-span-4 p-4 md:p-6 border-b-2 lg:border-b-0 lg:border-r-2 border-black dark:border-white">
                <div className="mb-6">
                  <div className="font-mono text-[10px] font-bold uppercase mb-2 border-b border-black dark:border-white pb-1">Description</div>
                  <p className="text-sm leading-relaxed">{gap.description}</p>
                </div>
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase mb-2 border-b border-black dark:border-white pb-1">Strategy</div>
                  <p className="text-sm leading-relaxed font-medium">{gap.recommended_remediation}</p>
                </div>
              </div>

              <div className="col-span-5 p-4 md:p-6">
                <div className="font-mono text-[10px] font-bold uppercase mb-4 border-b border-black dark:border-white pb-1 lg:hidden">Remediation Steps</div>
                <div className="pl-2">
                  {gap.remediation_steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="relative border-l-2 border-black dark:border-white pl-6 pb-6 last:pb-0 ml-2">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white dark:bg-black border-2 border-black dark:border-white"></div>
                      
                      <div className="font-mono text-xs font-bold mb-2 uppercase">
                        STEP {step.step_number}: {step.action_title}
                      </div>
                      
                      <div className="bg-black text-white dark:bg-white dark:text-black p-3 font-mono text-xs mb-2 overflow-x-auto whitespace-pre-wrap">
                        {step.technical_instructions}
                      </div>
                      
                      <div className="flex items-start gap-2 text-xs">
                        <span className="font-mono font-bold uppercase mt-0.5">Verify:</span>
                        <span className="text-gray-700 dark:text-gray-300">{step.verification_method}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {report.identified_gaps.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-4xl font-mono font-black mb-4">0 GAPS FOUND</div>
              <p className="font-mono uppercase tracking-widest">Target URL is fully compliant.</p>
            </div>
          )}
        </div>
      </div>

      {/* Marketing Growth */}
      <div className="mb-12">
        <h3 className="text-3xl font-bold uppercase tracking-tighter mb-6 border-b-4 border-black dark:border-white pb-2 inline-block">
          Marketing Growth & Social
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.marketing_growth.social_post_ideas.map((post, idx) => (
            <div key={idx} className="border-2 border-black dark:border-white flex flex-col bg-white dark:bg-black">
              <div className="border-b-2 border-black dark:border-white p-4 bg-gray-100 dark:bg-neutral-900 flex justify-between items-center">
                <span className="font-mono text-xs font-bold uppercase bg-black text-white dark:bg-white dark:text-black px-2 py-1">
                  {post.platform}
                </span>
                <span className="font-mono text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                  Angle: {post.angle}
                </span>
              </div>
              <div className="p-6 flex-grow">
                <p className="text-sm leading-relaxed italic">"{post.copy_template}"</p>
              </div>
              <div className="border-t-2 border-black dark:border-white p-3 bg-gray-50 dark:bg-neutral-900">
                <button 
                  onClick={() => navigator.clipboard.writeText(post.copy_template)}
                  className="w-full font-mono text-xs font-bold uppercase border-2 border-black dark:border-white py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                >
                  [COPY TO CLIPBOARD]
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
