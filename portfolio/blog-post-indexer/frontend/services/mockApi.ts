import { GapQuestion, PublishedPost, DraftContent } from '../types.ts';

export const mockIngestion = async (url: string, keywords: string[]): Promise<GapQuestion[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 'q1',
                    type: 'table_stakes',
                    text: `These topics MUST be in your post (70%+ of competitors): [AI Ethics, Data Privacy, Model Training]. Expertise?`
                },
                {
                    id: 'q2',
                    type: 'gap',
                    text: `Competitors mention '[RAG Implementation]' but you don't. Insights?`
                },
                {
                    id: 'q3',
                    type: 'paa',
                    text: `Google question: 'How much does Vertex AI cost?'. How would you answer?`
                },
                {
                    id: 'q4',
                    type: 'unique',
                    text: `What unique data/perspective do YOU have on this topic?`
                }
            ]);
        }, 2000);
    });
};

export const mockSynthesis = async (answers: Record<string, string>, originalUrl: string): Promise<DraftContent> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let domain = "yourdomain.com";
            try {
                domain = new URL(originalUrl).hostname;
            } catch (e) {
                // fallback if invalid url
            }

            resolve({
                title: "The Ultimate Guide to Vertex AI Implementation in 2026",
                contentSEO: `
                    <div class="space-y-4">
                        <div class="bg-blue-900/20 border border-blue-800 p-4 rounded-lg mb-6">
                            <h4 class="font-bold text-blue-400 mb-2">Bottom Line Up Front (BLUF)</h4>
                            <p class="text-slate-300">Implementing Vertex AI requires a strategic balance of robust data privacy, ethical AI frameworks, and advanced RAG (Retrieval-Augmented Generation) architectures. Organizations that integrate these elements see a 40% faster time-to-market for enterprise AI solutions.</p>
                        </div>
                        
                        <h2 class="text-2xl font-bold text-white mt-8 mb-4">1. The Table Stakes: Ethics, Privacy, and Training</h2>
                        <p class="text-slate-300 leading-relaxed">When deploying models on Vertex AI, data privacy cannot be an afterthought. Competitors across the board agree that establishing a secure perimeter around your training data is step one. Furthermore, AI ethics must be baked into the model evaluation phase to prevent bias amplification.</p>
                        
                        <h2 class="text-2xl font-bold text-white mt-8 mb-4">2. Bridging the Gap: RAG Implementation</h2>
                        <p class="text-slate-300 leading-relaxed">While many focus solely on fine-tuning, the real differentiator is Retrieval-Augmented Generation (RAG). Based on our internal data at ${domain}, integrating RAG with Vertex AI's Vector Search reduces hallucination rates by up to 85% while keeping the model grounded in your proprietary enterprise data.</p>
                        
                        <h2 class="text-2xl font-bold text-white mt-8 mb-4">3. Understanding Vertex AI Costs</h2>
                        <p class="text-slate-300 leading-relaxed">A common question is: <em>How much does Vertex AI cost?</em> The answer depends on your workload. Vertex AI uses a pay-as-you-go model. Training custom models incurs compute-hour costs, while prediction costs are based on node hours and the amount of data processed. Optimizing your endpoint scaling is crucial for cost management.</p>
                        
                        <h2 class="text-2xl font-bold text-white mt-8 mb-4">4. Our Unique Perspective</h2>
                        <p class="text-slate-300 leading-relaxed">What sets successful deployments apart is the human-in-the-loop quality gate. Automated pipelines are powerful, but injecting domain-specific human expertise before final synthesis ensures the output isn't just accurate, but deeply resonant with your target audience.</p>
                    </div>
                `,
                contentGEO: `
                    <div class="space-y-6">
                        <p class="text-slate-300">Global deployments of Vertex AI require regional awareness, particularly concerning data residency laws like GDPR in Europe and CCPA in California.</p>
                        
                        <h3 class="text-xl font-bold text-white mt-6 mb-3">Platform Comparison</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-slate-800 border-b border-slate-700">
                                        <th class="p-3 text-slate-200">Feature</th>
                                        <th class="p-3 text-slate-200">Vertex AI</th>
                                        <th class="p-3 text-slate-200">Standard Cloud AI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="border-b border-slate-800">
                                        <td class="p-3 text-slate-400">Data Residency</td>
                                        <td class="p-3 text-vertex-success">Multi-region support</td>
                                        <td class="p-3 text-slate-400">Limited</td>
                                    </tr>
                                    <tr class="border-b border-slate-800">
                                        <td class="p-3 text-slate-400">RAG Integration</td>
                                        <td class="p-3 text-vertex-success">Native Vector Search</td>
                                        <td class="p-3 text-slate-400">Requires 3rd party</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="bg-slate-800/50 p-6 rounded-xl mt-8 border border-slate-700">
                            <h3 class="text-xl font-bold text-white mb-4">Frequently Asked Questions</h3>
                            <details class="mb-4 group">
                                <summary class="font-medium cursor-pointer text-vertex-primary">Is Vertex AI GDPR compliant?</summary>
                                <p class="text-slate-400 mt-2 pl-4 border-l-2 border-slate-700">Yes, when configured with the correct regional endpoints, Vertex AI fully supports GDPR compliance requirements.</p>
                            </details>
                            <details class="group">
                                <summary class="font-medium cursor-pointer text-vertex-primary">How does RAG improve localization?</summary>
                                <p class="text-slate-400 mt-2 pl-4 border-l-2 border-slate-700">RAG allows you to ground the model in region-specific documents, ensuring outputs respect local nuances and regulations.</p>
                            </details>
                        </div>
                    </div>
                `,
                faqSchema: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Is Vertex AI GDPR compliant?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Yes, when configured with the correct regional endpoints, Vertex AI fully supports GDPR compliance requirements."
    }
  }]
}`
            });
        }, 4000); // Simulate drafting time
    });
};

export const mockPublishing = async (originalUrl: string): Promise<PublishedPost> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let baseUrl = originalUrl.endsWith('/') ? originalUrl.slice(0, -1) : originalUrl;
            // If the user just entered a domain, append /blog
            if (!baseUrl.includes('/')) {
                baseUrl = `https://${baseUrl}/blog`;
            }
            
            resolve({
                originalUrl: originalUrl,
                publishedUrl: `${baseUrl}/vertex-ai-implementation-guide-2026`,
                indexingStatus: {
                    google: true,
                    bing: true,
                    yandex: true,
                    brave: true,
                    mojeek: true
                },
                deployedAt: new Date().toISOString()
            });
        }, 3000);
    });
};
