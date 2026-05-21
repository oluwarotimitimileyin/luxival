import React, { useState, useEffect, useCallback, useRef } from 'react';

// ==========================================
// CONSTANTS & DATA
// ==========================================

const COUNTRIES = [
  "Select country", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh",
  "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
  "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
  "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Czechia", "Denmark",
  "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
  "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste",
  "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const PALETTES = [
  { id: 'professional', name: 'Professional', primary: '#1a3a52', secondary: '#e3f2fd', text: '#333333', bg: '#ffffff' },
  { id: 'modern', name: 'Modern', primary: '#008080', secondary: '#f0fff0', text: '#1a1a1a', bg: '#ffffff' },
  { id: 'warm', name: 'Warm', primary: '#d35400', secondary: '#fff8dc', text: '#4a2311', bg: '#fafafa' },
  { id: 'elegant', name: 'Elegant', primary: '#4b0082', secondary: '#fdf5e6', text: '#2e004f', bg: '#ffffff' },
  { id: 'tech', name: 'Tech', primary: '#0055ff', secondary: '#e6f0ff', text: '#000033', bg: '#f5f7fa' },
  { id: 'natural', name: 'Natural', primary: '#2e7d32', secondary: '#e8f5e9', text: '#1b5e20', bg: '#ffffff' },
];

const TYPOGRAPHY = [
  { id: 'modern', name: 'Modern', font: "'Poppins', sans-serif" },
  { id: 'classic', name: 'Classic', font: "'Georgia', serif" },
  { id: 'minimal', name: 'Minimal', font: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { id: 'tech', name: 'Tech', font: "'Courier New', Courier, monospace" },
];

const TEMPLATES = [
  { id: 't1', name: 'Brooklyn', provider: 'Shopify', type: 'E-Commerce', rating: 4.8, desc: 'Minimalist, product showcase' },
  { id: 't2', name: 'Debut', provider: 'Shopify', type: 'E-Commerce', rating: 4.5, desc: 'Clean, professional, conversion-focused' },
  { id: 't3', name: 'Narrative', provider: 'Shopify', type: 'Blog', rating: 4.2, desc: 'Article-heavy, editorial style' },
  { id: 't4', name: 'Impulse', provider: 'Shopify', type: 'E-Commerce', rating: 4.9, desc: 'Vibrant, sales-focused' },
  { id: 't5', name: 'Empire', provider: 'Shopify', type: 'E-Commerce', rating: 4.7, desc: 'High-end, premium feel' },
  { id: 't6', name: 'Prestige', provider: 'Shopify', type: 'Agency', rating: 4.6, desc: 'Professional, trust-building' },
  { id: 't7', name: 'Motion', provider: 'Shopify', type: 'Creative', rating: 4.4, desc: 'Animated, modern, bold' },
  { id: 't8', name: 'Streamline', provider: 'Shopify', type: 'SaaS', rating: 4.8, desc: 'Tech-focused, feature-heavy' },
  { id: 't9', name: 'Service Pro', provider: 'Google', type: 'Service', rating: 4.3, desc: 'Simple, clean, professional' },
  { id: 't10', name: 'Visual Folio', provider: 'Google', type: 'Portfolio', rating: 4.5, desc: 'Visual showcase, creative' },
  { id: 't11', name: 'Reader', provider: 'Google', type: 'Blog', rating: 4.1, desc: 'Content-focused, readable' },
  { id: 't12', name: 'Corp Site', provider: 'Google', type: 'Business', rating: 4.4, desc: 'Corporate, trust-focused' },
  { id: 't13', name: 'Event Hub', provider: 'Google', type: 'Event', rating: 4.2, desc: 'Event-focused, engaging' },
  { id: 't14', name: 'Basic Store', provider: 'Google', type: 'E-Commerce', rating: 4.0, desc: 'Basic e-commerce setup' },
  { id: 't15', name: 'AI Chatbot', provider: 'Custom', type: 'Interactive', rating: 4.9, desc: 'Interactive chat for customer service' },
  { id: 't16', name: 'Dynamic Form', provider: 'Custom', type: 'Interactive', rating: 4.7, desc: 'Forms adapt based on user input' },
  { id: 't17', name: 'Price Calc', provider: 'Custom', type: 'Interactive', rating: 4.8, desc: 'Pricing calculator/comparison table' },
  { id: 't18', name: 'Live Engage', provider: 'Custom', type: 'Interactive', rating: 4.6, desc: 'Built for customer engagement' },
  { id: 't19', name: 'Configurator', provider: 'Custom', type: 'Interactive', rating: 4.9, desc: 'Users customize products' },
  { id: 't20', name: 'Booker', provider: 'Custom', type: 'Service', rating: 4.8, desc: 'Calendar/booking integration' },
];

// ==========================================
// BUILDER COMPONENTS DEFINITION
// ==========================================
type ComponentType = 'Header' | 'Hero' | 'Text' | 'Features' | 'Pricing' | 'Contact' | 'Footer';

interface BuilderComponent {
  id: string;
  type: ComponentType;
  props: any;
}

const DEFAULT_PROPS: Record<ComponentType, any> = {
  Header: { logoText: 'My Business', navLinks: 'Home, About, Contact', buttonText: 'Get Started' },
  Hero: { headline: 'Welcome to our site', subheadline: 'We provide the best services for you.', buttonText: 'Learn More' },
  Text: { content: 'Enter your text here. Describe your business or mission.', align: 'left' },
  Features: { title: 'Our Features', f1: 'Quality', f2: 'Speed', f3: 'Support' },
  Pricing: { title: 'Simple Pricing', price: '$99', plan: 'Pro Plan', feature: 'All inclusive' },
  Contact: { title: 'Contact Us', buttonText: 'Send Message' },
  Footer: { text: '© 2024 All rights reserved.' }
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function BusinessBuilder() {
  // --- Global State ---
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');

  // --- Stage Data State ---
  const [stageData, setStageData] = useState({
    stage1: { businessDescription: '', targetAudience: '', serviceType: 'Select type', country: 'Select country', email: '' },
    stage2: { selectedBusinessName: '', allSuggestions: [] as any[] },
    stage3: { selectedDomain: '', allDomainOptions: [] as any[] },
    stage4: { complianceReviewed: false, activeTab: 'How to Register Your Business' },
    stage5: { colorPalette: PALETTES[0], layoutStyle: 'Minimalist', typography: TYPOGRAPHY[0] },
    stage6: { selectedTemplate: '' },
    stage7: { customComponents: [] as BuilderComponent[], activeComponentId: null as string | null },
    stage8: { generatedCode: '' },
    stage9: { userEmail: '', marketingPlan: '' }
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // --- Validation ---
  const validateStage1 = () => {
    const s1 = stageData.stage1;
    return (
      s1.businessDescription.trim().length >= 20 &&
      s1.targetAudience.trim().length >= 10 &&
      s1.serviceType !== 'Select type' &&
      s1.country !== 'Select country' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s1.email)
    );
  };

  // --- Navigation ---
  const advanceStage = useCallback((customLoadingText = 'Loading...') => {
    setIsLoading(true);
    setLoadingText(customLoadingText);
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStage(prev => Math.min(prev + 1, 9));
      window.scrollTo(0, 0);
    }, 800);
  }, []);

  const goBack = useCallback(() => {
    setCurrentStage(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  }, []);

  const updateStageData = (stage: string, field: string, value: any) => {
    setStageData(prev => ({
      ...prev,
      [stage]: { ...prev[stage as keyof typeof prev], [field]: value }
    }));
  };

  // ==========================================
  // GENERATORS
  // ==========================================

  const generateBusinessNames = useCallback(() => {
    const desc = stageData.stage1.businessDescription.toLowerCase();
    const words = desc.split(/[\s,]+/).filter(w => w.length > 4);
    const keyword = words.length > 0 ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : 'Global';
    
    const suffixes = ['Pro', 'Hub', 'Studio', 'Labs', 'Co', 'Solutions', 'Group', 'Digital', 'Works', 'Dynamics'];
    const suggestions = suffixes.map(suffix => ({
      name: `${keyword} ${suffix}`,
      desc: `Professional and modern name for a ${stageData.stage1.serviceType} business.`,
      score: Math.floor(Math.random() * 3) + 8
    }));
    
    updateStageData('stage2', 'allSuggestions', suggestions);
  }, [stageData.stage1]);

  const generateDomains = useCallback(() => {
    const name = stageData.stage2.selectedBusinessName;
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const tlds = ['.com', '.co', '.io', '.net', '.app', '.xyz', '.studio', '.ai'];
    
    const options = tlds.map((tld, idx) => {
      const isAvailable = Math.random() > 0.3; // 70% chance available
      return {
        domain: `${base}${tld}`,
        available: isAvailable,
        price: isAvailable ? (idx === 0 ? 12.99 : Math.floor(Math.random() * 40) + 5) : null,
        difficulty: idx === 0 ? 'Hard' : 'Easy',
        recommended: idx === 1 && isAvailable // Recommend .co if available
      };
    });
    
    updateStageData('stage3', 'allDomainOptions', options);
  }, [stageData.stage2.selectedBusinessName]);

  const generateWebsiteCode = useCallback(() => {
    const { stage2, stage3, stage5, stage7 } = stageData;
    const name = stage2.selectedBusinessName;
    const pal = stage5.colorPalette;
    const font = stage5.typography.font;

    let bodyContent = '';
    
    stage7.customComponents.forEach(comp => {
      const p = comp.props;
      switch(comp.type) {
        case 'Header':
          bodyContent += `
  <header style="background: ${pal.primary}; color: white; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
    <h1 style="margin: 0; font-size: 24px;">${p.logoText}</h1>
    <nav>
      ${p.navLinks.split(',').map((l:string) => `<a href="#" style="color: white; text-decoration: none; margin-left: 15px;">${l.trim()}</a>`).join('')}
    </nav>
    <button style="background: white; color: ${pal.primary}; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">${p.buttonText}</button>
  </header>`;
          break;
        case 'Hero':
          bodyContent += `
  <section style="background: linear-gradient(135deg, ${pal.primary}, ${pal.secondary}); color: white; padding: 100px 20px; text-align: center;">
    <h2 style="font-size: 48px; margin-bottom: 20px;">${p.headline}</h2>
    <p style="font-size: 20px; margin-bottom: 30px; max-width: 600px; margin-left: auto; margin-right: auto;">${p.subheadline}</p>
    <button style="background: white; color: ${pal.primary}; border: none; padding: 15px 30px; border-radius: 8px; font-size: 18px; font-weight: bold; cursor: pointer;">${p.buttonText}</button>
  </section>`;
          break;
        case 'Text':
          bodyContent += `
  <section style="padding: 60px 20px; text-align: ${p.align}; max-width: 800px; margin: 0 auto;">
    <p style="font-size: 18px; line-height: 1.8;">${p.content}</p>
  </section>`;
          break;
        case 'Features':
          bodyContent += `
  <section style="padding: 80px 20px; background: ${pal.bg};">
    <h2 style="text-align: center; font-size: 36px; color: ${pal.primary}; margin-bottom: 40px;">${p.title}</h2>
    <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
      ${[p.f1, p.f2, p.f3].map(f => `
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); width: 300px; text-align: center; border-top: 4px solid ${pal.primary};">
        <h3 style="font-size: 20px; margin-bottom: 15px;">${f}</h3>
        <p style="color: #666;">High quality feature designed to help your business grow.</p>
      </div>`).join('')}
    </div>
  </section>`;
          break;
        case 'Pricing':
          bodyContent += `
  <section style="padding: 80px 20px;">
    <h2 style="text-align: center; font-size: 36px; color: ${pal.primary}; margin-bottom: 40px;">${p.title}</h2>
    <div style="max-width: 400px; margin: 0 auto; background: white; border: 2px solid ${pal.primary}; border-radius: 12px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
      <h3 style="font-size: 24px; margin-bottom: 10px;">${p.plan}</h3>
      <div style="font-size: 48px; font-weight: bold; color: ${pal.primary}; margin-bottom: 20px;">${p.price}</div>
      <p style="margin-bottom: 30px; color: #666;">✓ ${p.feature}</p>
      <button style="background: ${pal.primary}; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%;">Choose Plan</button>
    </div>
  </section>`;
          break;
        case 'Contact':
          bodyContent += `
  <section style="padding: 80px 20px; background: ${pal.bg};">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <h2 style="font-size: 32px; color: ${pal.primary}; margin-bottom: 30px; text-align: center;">${p.title}</h2>
      <form onsubmit="event.preventDefault(); alert('Message sent!');">
        <input type="text" placeholder="Name" style="width: 100%; padding: 15px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; font-family: inherit;" required>
        <input type="email" placeholder="Email" style="width: 100%; padding: 15px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; font-family: inherit;" required>
        <textarea placeholder="Message" style="width: 100%; padding: 15px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; height: 120px; font-family: inherit;" required></textarea>
        <button type="submit" style="background: ${pal.primary}; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%;">${p.buttonText}</button>
      </form>
    </div>
  </section>`;
          break;
        case 'Footer':
          bodyContent += `
  <footer style="background: #222; color: #aaa; padding: 40px 20px; text-align: center;">
    <p>${p.text}</p>
    <p style="margin-top: 10px; font-size: 12px;">Built with BusinessBuilder</p>
  </footer>`;
          break;
      }
    });

    if (stage7.customComponents.length === 0) {
      bodyContent = `<div style="padding: 100px; text-align: center;"><h2>Welcome to ${name}</h2><p>Please add components in the builder.</p></div>`;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${font}; color: ${pal.text}; background: ${pal.bg}; line-height: 1.6; }
    button { transition: opacity 0.2s, transform 0.2s; }
    button:hover { opacity: 0.9; transform: translateY(-1px); }
  </style>
</head>
<body>
${bodyContent}
  <script>
    // Interactive functionality
    console.log('${name} website loaded successfully.');
  </script>
</body>
</html>`;
    
    updateStageData('stage8', 'generatedCode', html);
  }, [stageData]);

  const generateMarketingPlan = useCallback(() => {
    const { stage1, stage2 } = stageData;
    const plan = `${stage2.selectedBusinessName} - 30-Day Launch Plan

Target Audience: ${stage1.targetAudience}
Business Type: ${stage1.serviceType}

WEEK 1: Foundation
- Set up social media profiles (LinkedIn, Instagram)
- Create email list using Mailchimp or ConvertKit
- Write your 'About' page and mission statement
- Action: Reach out to 10 friends/family for initial feedback

WEEK 2: Content Creation
- Create 5 core content pieces addressing your audience's pain points
- Share behind-the-scenes of building your business
- Post daily on your primary social channel
- Action: Join 3 relevant Facebook/LinkedIn groups

WEEK 3: Engagement & Outreach
- Run a small giveaway or introductory offer
- Reach out to 50 potential customers via DM or email
- Engage with 20 posts from your target audience daily
- Action: Secure your first 3 beta testers or clients

WEEK 4: Sales & Launch
- Officially announce your website launch
- Offer an early-bird discount (e.g., 20% off)
- Collect testimonials from beta testers
- Action: Close 5 paid customers

Recommended AI Agents:
- Email automation agent (nurture leads)
- Social media scheduler (Buffer/Later)
- Customer chat bot (Intercom/Drift)`;
    
    updateStageData('stage9', 'marketingPlan', plan);
  }, [stageData]);

  // --- Effects for Generators ---
  useEffect(() => {
    if (currentStage === 2 && stageData.stage2.allSuggestions.length === 0) {
      generateBusinessNames();
    }
    if (currentStage === 3 && stageData.stage3.allDomainOptions.length === 0) {
      generateDomains();
    }
    if (currentStage === 8 && stageData.stage8.generatedCode === '') {
      generateWebsiteCode();
    }
    if (currentStage === 9 && stageData.stage9.marketingPlan === '') {
      generateMarketingPlan();
    }
  }, [currentStage, generateBusinessNames, generateDomains, generateWebsiteCode, generateMarketingPlan, stageData]);

  // ==========================================
  // DRAG AND DROP BUILDER LOGIC (STAGE 7)
  // ==========================================
  
  const handleDragStart = (e: React.DragEvent, type: ComponentType, index?: number) => {
    e.dataTransfer.setData('componentType', type);
    if (index !== undefined) {
      e.dataTransfer.setData('dragIndex', index.toString());
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex?: number) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType') as ComponentType;
    const dragIndexStr = e.dataTransfer.getData('dragIndex');
    
    if (!type) return;

    const newComponents = [...stageData.stage7.customComponents];

    if (dragIndexStr) {
      // Reordering
      const dragIndex = parseInt(dragIndexStr, 10);
      if (dropIndex !== undefined && dragIndex !== dropIndex) {
        const [draggedItem] = newComponents.splice(dragIndex, 1);
        newComponents.splice(dropIndex, 0, draggedItem);
      }
    } else {
      // Adding new
      const newComp: BuilderComponent = {
        id: `comp_${Date.now()}`,
        type,
        props: { ...DEFAULT_PROPS[type] }
      };
      if (dropIndex !== undefined) {
        newComponents.splice(dropIndex, 0, newComp);
      } else {
        newComponents.push(newComp);
      }
    }
    updateStageData('stage7', 'customComponents', newComponents);
  };

  const removeComponent = (id: string) => {
    const newComps = stageData.stage7.customComponents.filter(c => c.id !== id);
    updateStageData('stage7', 'customComponents', newComps);
    if (stageData.stage7.activeComponentId === id) {
      updateStageData('stage7', 'activeComponentId', null);
    }
  };

  const updateComponentProp = (id: string, propName: string, value: any) => {
    const newComps = stageData.stage7.customComponents.map(c => {
      if (c.id === id) {
        return { ...c, props: { ...c.props, [propName]: value } };
      }
      return c;
    });
    updateStageData('stage7', 'customComponents', newComps);
  };

  // ==========================================
  // DOWNLOAD & EMAIL LOGIC
  // ==========================================

  const downloadFile = (filename: string, content: string, type = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const { stage8, stage9 } = stageData;
    downloadFile('index.html', stage8.generatedCode, 'text/html');
    setTimeout(() => downloadFile('marketing-plan.txt', stage9.marketingPlan), 300);
    setTimeout(() => downloadFile('README.md', '# Website Setup\n\n1. Open index.html in your browser.\n2. Upload to Vercel or Netlify to go live.'), 600);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stageData.stage9.userEmail)) {
      setIsLoading(true);
      setLoadingText('Sending files to email...');
      setTimeout(() => {
        setIsLoading(false);
        updateStageData('stage9', 'isEmailSent', true);
      }, 1500);
    }
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  const renderProgressBar = () => {
    const progress = (currentStage / 9) * 100;
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-[#eee]">
        <div className="h-[6px] bg-[#e0e0e0] w-full">
          <div 
            className="h-full bg-[#1a3a52] transition-all duration-500 ease-in-out relative"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex justify-between items-center">
          <div className="font-bold text-[#1a3a52] text-[18px] flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
            BusinessBuilder
          </div>
          <div className="text-[14px] font-medium text-[#666] bg-[#f5f5f5] px-3 py-1 rounded-full">Stage {currentStage} of 9</div>
        </div>
      </div>
    );
  };

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-sans text-[#333] pt-[70px] pb-[100px]">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(1000px) rotate(720deg); opacity: 0; } }
        .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-spin-slow { animation: spin 1.5s linear infinite; }
        .glass-card { background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #aaa; }
        .builder-canvas { min-height: 500px; }
        .builder-canvas:empty::before { content: 'Drag components here'; display: block; text-align: center; padding: 100px 20px; color: #aaa; font-size: 18px; border: 2px dashed #ddd; border-radius: 8px; margin: 20px; }
      `}</style>

      {renderProgressBar()}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-[#e3f2fd] border-t-[#1a3a52] rounded-full animate-spin-slow mb-4 shadow-lg"></div>
          <div className="text-[#1a3a52] font-bold text-[18px] animate-pulse">{loadingText}</div>
        </div>
      )}

      <main className="max-w-[1200px] mx-auto px-4 mt-8">
        
        {/* ========================================== */}
        {/* STAGE 1: INTERVIEW */}
        {/* ========================================== */}
        {currentStage === 1 && (
          <div className="animate-fade-in max-w-[700px] mx-auto glass-card rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#eee] p-6 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a3a52] mb-3 tracking-tight">Tell Us About Your Business</h2>
              <p className="text-[16px] text-[#666]">Answer basic business information to get started</p>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="businessDescription" className="block text-[15px] font-bold text-[#333] mb-2">What is your business idea?</label>
                <textarea
                  id="businessDescription"
                  value={stageData.stage1.businessDescription}
                  onChange={(e) => updateStageData('stage1', 'businessDescription', e.target.value)}
                  onBlur={() => setTouched(p => ({ ...p, s1_desc: true }))}
                  placeholder="e.g., eco-friendly fashion coaching for busy professionals"
                  className={`w-full h-[100px] p-4 border rounded-[10px] resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a52] transition-all ${touched.s1_desc && stageData.stage1.businessDescription.length < 20 ? 'border-[#f44336] bg-[#fff5f5]' : 'border-[#ddd] bg-[#fafafa] hover:bg-white'}`}
                />
                {touched.s1_desc && stageData.stage1.businessDescription.length < 20 && <p className="text-[#f44336] text-[13px] mt-1 font-medium">Please provide more detail (min 20 characters)</p>}
              </div>

              <div>
                <label htmlFor="targetAudience" className="block text-[15px] font-bold text-[#333] mb-2">Who is your target audience?</label>
                <textarea
                  id="targetAudience"
                  value={stageData.stage1.targetAudience}
                  onChange={(e) => updateStageData('stage1', 'targetAudience', e.target.value)}
                  onBlur={() => setTouched(p => ({ ...p, s1_aud: true }))}
                  placeholder="e.g., entrepreneurs, startups, freelancers, small business owners"
                  className={`w-full h-[80px] p-4 border rounded-[10px] resize-none focus:outline-none focus:ring-2 focus:ring-[#1a3a52] transition-all ${touched.s1_aud && stageData.stage1.targetAudience.length < 10 ? 'border-[#f44336] bg-[#fff5f5]' : 'border-[#ddd] bg-[#fafafa] hover:bg-white'}`}
                />
                {touched.s1_aud && stageData.stage1.targetAudience.length < 10 && <p className="text-[#f44336] text-[13px] mt-1 font-medium">Please provide more detail (min 10 characters)</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="serviceType" className="block text-[15px] font-bold text-[#333] mb-2">What type of business?</label>
                  <select
                    id="serviceType"
                    value={stageData.stage1.serviceType}
                    onChange={(e) => updateStageData('stage1', 'serviceType', e.target.value)}
                    onBlur={() => setTouched(p => ({ ...p, s1_type: true }))}
                    className={`w-full h-[50px] px-4 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#1a3a52] transition-all appearance-none ${touched.s1_type && stageData.stage1.serviceType === 'Select type' ? 'border-[#f44336] bg-[#fff5f5]' : 'border-[#ddd] bg-[#fafafa] hover:bg-white'}`}
                  >
                    <option value="Select type" disabled>Select type</option>
                    <option value="Service/Consulting">Service/Consulting</option>
                    <option value="E-Commerce/Products">E-Commerce/Products</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Coaching/Education">Coaching/Education</option>
                    <option value="Agency">Agency</option>
                    <option value="Information Product">Information Product</option>
                    <option value="Membership/Subscription">Membership/Subscription</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="country" className="block text-[15px] font-bold text-[#333] mb-2">Where are you based?</label>
                  <select
                    id="country"
                    value={stageData.stage1.country}
                    onChange={(e) => updateStageData('stage1', 'country', e.target.value)}
                    onBlur={() => setTouched(p => ({ ...p, s1_country: true }))}
                    className={`w-full h-[50px] px-4 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#1a3a52] transition-all appearance-none ${touched.s1_country && stageData.stage1.country === 'Select country' ? 'border-[#f44336] bg-[#fff5f5]' : 'border-[#ddd] bg-[#fafafa] hover:bg-white'}`}
                  >
                    {COUNTRIES.map(c => <option key={c} value={c} disabled={c === 'Select country'}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-[15px] font-bold text-[#333] mb-2">Your email</label>
                <input
                  id="email" type="email"
                  value={stageData.stage1.email}
                  onChange={(e) => updateStageData('stage1', 'email', e.target.value)}
                  onBlur={() => setTouched(p => ({ ...p, s1_email: true }))}
                  placeholder="you@example.com"
                  className={`w-full h-[50px] px-4 border rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#1a3a52] transition-all ${touched.s1_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stageData.stage1.email) ? 'border-[#f44336] bg-[#fff5f5]' : 'border-[#ddd] bg-[#fafafa] hover:bg-white'}`}
                />
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[#eee] flex justify-end">
              <button
                onClick={() => {
                  setTouched({ s1_desc: true, s1_aud: true, s1_type: true, s1_country: true, s1_email: true });
                  if (validateStage1()) advanceStage('Analyzing business profile...');
                }}
                className="bg-[#1a3a52] text-white px-10 py-4 rounded-[10px] font-bold text-[16px] hover:bg-[#112a3c] transition-colors shadow-md focus:outline-none focus:ring-4 focus:ring-[#1a3a52]/30"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STAGE 2: NAMING */}
        {/* ========================================== */}
        {currentStage === 2 && (
          <div className="animate-fade-in max-w-[900px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a3a52] mb-3">Generate Your Business Name</h2>
              <p className="text-[16px] text-[#666]">We've created 10 professional name options based on your niche</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5 mb-10">
              {stageData.stage2.allSuggestions.map((sug, idx) => {
                const isSelected = stageData.stage2.selectedBusinessName === sug.name;
                return (
                  <div 
                    key={idx}
                    onClick={() => updateStageData('stage2', 'selectedBusinessName', sug.name)}
                    className={`p-6 rounded-[12px] border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between
                      ${isSelected ? 'border-[#1a3a52] bg-[#f8fbff] shadow-md transform scale-[1.02]' : 'border-[#eee] bg-white hover:border-[#1a3a52]/50 hover:shadow-sm'}`}
                    role="button"
                    tabIndex={0}
                  >
                    <div>
                      <h3 className="text-[22px] font-bold text-[#1a3a52] mb-2">{sug.name}</h3>
                      <p className="text-[14px] text-[#666] mb-4">{sug.desc}</p>
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#eee]">
                      <span className="text-[13px] font-bold text-[#888] bg-[#f5f5f5] px-2 py-1 rounded">Score: {sug.score}/10</span>
                      <button className={`px-4 py-2 rounded-[6px] font-bold text-[14px] transition-colors ${isSelected ? 'bg-[#1a3a52] text-white' : 'bg-transparent border border-[#1a3a52] text-[#1a3a52]'}`}>
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white p-8 rounded-[12px] border border-[#eee] shadow-sm mb-10">
              <label htmlFor="customName" className="block text-[16px] font-bold text-[#333] mb-3">Or enter your own business name</label>
              <input
                id="customName" type="text"
                value={stageData.stage2.selectedBusinessName}
                onChange={(e) => updateStageData('stage2', 'selectedBusinessName', e.target.value)}
                placeholder="Type custom name here..."
                className="w-full h-[50px] px-4 border border-[#ddd] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#1a3a52] bg-[#fafafa] hover:bg-white transition-colors"
              />
            </div>

            <div className="flex justify-between items-center">
              <button onClick={goBack} className="text-[#666] font-bold hover:text-[#333] px-6 py-3">Back</button>
              <button
                onClick={() => advanceStage('Searching domains...')}
                disabled={stageData.stage2.selectedBusinessName.trim().length < 3}
                className="bg-[#1a3a52] text-white px-10 py-4 rounded-[10px] font-bold text-[16px] hover:bg-[#112a3c] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STAGE 3: DOMAIN */}
        {/* ========================================== */}
        {currentStage === 3 && (
          <div className="animate-fade-in max-w-[900px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a3a52] mb-3">Search Domain Availability</h2>
              <p className="text-[16px] text-[#666]">Find the perfect domain name for <strong>{stageData.stage2.selectedBusinessName}</strong></p>
            </div>

            <div className="space-y-4 mb-10">
              {stageData.stage3.allDomainOptions.map((opt, idx) => {
                const isSelected = stageData.stage3.selectedDomain === opt.domain;
                return (
                  <div 
                    key={idx}
                    className={`bg-white p-5 rounded-[12px] border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4
                      ${isSelected ? 'border-[#1a3a52] shadow-md bg-[#f8fbff]' : opt.recommended ? 'border-[#4caf50]/50 shadow-sm' : 'border-[#eee]'}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-[20px] font-bold ${opt.available ? 'text-[#333]' : 'text-[#aaa] line-through'}`}>{opt.domain}</h3>
                        {opt.recommended && <span className="bg-[#e8f5e9] text-[#2e7d32] text-[11px] font-bold px-2 py-1 rounded uppercase tracking-wide">Easiest to buy</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        {opt.available ? (
                          <span className="text-[#4caf50] text-[14px] font-bold flex items-center gap-1">✓ AVAILABLE</span>
                        ) : (
                          <span className="text-[#f44336] text-[14px] font-bold flex items-center gap-1">✗ TAKEN</span>
                        )}
                        {opt.price && <span className="text-[#666] text-[14px] font-medium">${opt.price}/year</span>}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      {opt.available && (
                        <button 
                          onClick={() => window.open(`https://domains.google.com/registrar/search?searchTerm=${opt.domain}`, '_blank')}
                          className="px-4 py-2 rounded-[8px] font-bold text-[14px] bg-[#f5f5f5] text-[#333] hover:bg-[#e0e0e0] transition-colors"
                        >
                          Buy Domain ↗
                        </button>
                      )}
                      <button 
                        onClick={() => opt.available && updateStageData('stage3', 'selectedDomain', opt.domain)}
                        disabled={!opt.available}
                        className={`px-6 py-2 rounded-[8px] font-bold text-[14px] transition-colors
                          ${isSelected ? 'bg-[#1a3a52] text-white' : opt.available ? 'bg-transparent border border-[#1a3a52] text-[#1a3a52] hover:bg-[#f8fbff]' : 'bg-[#f5f5f5] text-[#aaa] cursor-not-allowed'}`}
                      >
                        {isSelected ? 'Selected' : 'Select This Domain'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center">
              <button onClick={goBack} className="text-[#666] font-bold hover:text-[#333] px-6 py-3">Back</button>
              <button
                onClick={() => advanceStage('Preparing compliance guide...')}
                disabled={!stageData.stage3.selectedDomain}
                className="bg-[#1a3a52] text-white px-10 py-4 rounded-[10px] font-bold text-[16px] hover:bg-[#112a3c] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STAGE 4: COMPLIANCE */}
        {/* ========================================== */}
        {currentStage === 4 && (
          <div className="animate-fade-in max-w-[1000px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a3a52] mb-3">Business Setup & Compliance</h2>
              <p className="text-[16px] text-[#666]"><strong>{stageData.stage1.country}</strong> Registration Requirements</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 mb-10">
              {/* Sidebar */}
              <div className="w-full md:w-[300px] shrink-0 space-y-2">
                {['How to Register Your Business', 'Tax Information & IDs', 'Business License Requirements', 'Legal Entity Types', 'Banking & Accounts', 'Insurance Recommendations'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => updateStageData('stage4', 'activeTab', tab)}
                    className={`w-full text-left px-5 py-4 rounded-[10px] font-bold text-[15px] transition-all
                      ${stageData.stage4.activeTab === tab ? 'bg-[#1a3a52] text-white shadow-md' : 'bg-white text-[#666] hover:bg-[#f5f5f5] border border-[#eee]'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 bg-white rounded-[16px] border border-[#eee] shadow-sm p-8">
                <h3 className="text-[24px] font-bold text-[#333] mb-6 border-b border-[#eee] pb-4">{stageData.stage4.activeTab}</h3>
                
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-[10px] hover:bg-[#fafafa] transition-colors border border-transparent hover:border-[#eee]">
                      <div className="pt-1">
                        <input type="checkbox" className="w-6 h-6 accent-[#1a3a52] cursor-pointer rounded" />
                      </div>
                      <div>
                        <h4 className="text-[16px] font-bold text-[#333] mb-1">
                          {stageData.stage4.activeTab === 'How to Register Your Business' && `Step ${i}: Registration Requirement`}
                          {stageData.stage4.activeTab === 'Tax Information & IDs' && `Tax Requirement ${i}`}
                          {stageData.stage4.activeTab === 'Business License Requirements' && `License Type ${i}`}
                          {stageData.stage4.activeTab === 'Legal Entity Types' && `Entity Option ${i}`}
                          {stageData.stage4.activeTab === 'Banking & Accounts' && `Banking Step ${i}`}
                          {stageData.stage4.activeTab === 'Insurance Recommendations' && `Insurance Type ${i}`}
                        </h4>
                        <p className="text-[14px] text-[#666] leading-relaxed">
                          This is a simulated compliance step for {stageData.stage1.country}. In a real application, this would fetch specific legal requirements from an API based on the selected country and business type ({stageData.stage1.serviceType}).
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={goBack} className="text-[#666] font-bold hover:text-[#333] px-6 py-3">Back</button>
              <button
                onClick={() => advanceStage('Loading design studio...')}
                className="bg-[#1a3a52] text-white px-10 py-4 rounded-[10px] font-bold text-[16px] hover:bg-[#112a3c] transition-colors shadow-md"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STAGE 5: DESIGN */}
        {/* ========================================== */}
        {currentStage === 5 && (
          <div className="animate-fade-in max-w-[1200px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a3a52] mb-3">Choose Your Website Style</h2>
              <p className="text-[16px] text-[#666]">Pick colors, fonts, and layout direction</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 mb-10">
              {/* Controls */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Colors */}
                <div className="bg-white p-6 rounded-[16px] border border-[#eee] shadow-sm">
                  <h3 className="text-[18px] font-bold text-[#333] mb-4 flex items-center gap-2">🎨 Color Schemes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {PALETTES.map(pal => (
                      <div 
                        key={pal.id} onClick={() => updateStageData('stage5', 'colorPalette', pal)}
                        className={`p-3 rounded-[10px] border-2 cursor-pointer transition-all ${stageData.stage5.colorPalette.id === pal.id ? 'border-[#1a3a52] bg-[#f8fbff]' : 'border-[#eee] hover:border-[#ccc]'}`}
                      >
                        <div className="font-bold text-[13px] mb-2">{pal.name}</div>
                        <div className="flex h-6 rounded overflow-hidden">
                          <div className="flex-1" style={{ background: pal.primary }}></div>
                          <div className="flex-1" style={{ background: pal.secondary }}></div>
                          <div className="flex-1" style={{ background: pal.text }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="bg-white p-6 rounded-[16px] border border-[#eee] shadow-sm">
                  <h3 className="text-[18px] font-bold text-[#333] mb-4 flex items-center gap-2">Aa Typography</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {TYPOGRAPHY.map(typ => (
                      <div 
                        key={typ.id} onClick={() => updateStageData('stage5', 'typography', typ)}
                        className={`p-3 rounded-[10px] border-2 cursor-pointer transition-all ${stageData.stage5.typography.id === typ.id ? 'border-[#1a3a52] bg-[#f8fbff]' : 'border-[#eee] hover:border-[#ccc]'}`}
                        style={{ fontFamily: typ.font }}
                      >
                        <div className="font-bold text-[16px]">{typ.name}</div>
                        <div className="text-[12px] opacity-70">Ag</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layout */}
                <div className="bg-white p-6 rounded-[16px] border border-[#eee] shadow-sm">
                  <h3 className="text-[18px] font-bold text-[#333] mb-4 flex items-center gap-2">📐 Layout Style</h3>
                  <div className="space-y-2">
                    {['Minimalist', 'Professional', 'Modern', 'E-Commerce', 'Creative', 'Corporate'].map(layout => (
                      <label key={layout} className="flex items-center gap-3 p-3 rounded-[8px] hover:bg-[#fafafa] cursor-pointer border border-transparent hover:border-[#eee]">
                        <input 
                          type="radio" name="layout" value={layout}
                          checked={stageData.stage5.layoutStyle === layout}
                          onChange={(e) => updateStageData('stage5', 'layoutStyle', e.target.value)}
                          className="w-5 h-5 accent-[#1a3a52]"
                        />
                        <span className="font-bold text-[14px] text-[#333]">{layout}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* Live Preview */}
              <div className="lg:col-span-7">
                <div className="sticky top-[100px] bg-white rounded-[16px] border border-[#eee] shadow-lg overflow-hidden flex flex-col h-[700px]">
                  <div className="bg-[#f5f5f5] p-3 border-b border-[#eee] flex items-center gap-2">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div><div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div><div className="w-3 h-3 rounded-full bg-[#27c93f]"></div></div>
                    <div className="mx-auto bg-white px-4 py-1 rounded-full text-[12px] text-[#888] font-mono">{stageData.stage3.selectedDomain || 'yourwebsite.com'}</div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ fontFamily: stageData.stage5.typography.font, backgroundColor: stageData.stage5.colorPalette.bg, color: stageData.stage5.colorPalette.text }}>
                    {/* Mock Header */}
                    <header style={{ background: stageData.stage5.colorPalette.primary, color: 'white', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '20px' }}>{stageData.stage2.selectedBusinessName}</div>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}><span>Home</span><span>Services</span><span>Contact</span></div>
                    </header>
                    
                    {/* Mock Hero */}
                    <section style={{ background: `linear-gradient(135deg, ${stageData.stage5.colorPalette.primary}, ${stageData.stage5.colorPalette.secondary})`, color: 'white', padding: '80px 30px', textAlign: 'center' }}>
                      <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '20px' }}>Welcome to {stageData.stage2.selectedBusinessName}</h1>
                      <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px' }}>{stageData.stage1.businessDescription}</p>
                      <button style={{ background: 'white', color: stageData.stage5.colorPalette.primary, padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', border: 'none' }}>Get Started</button>
                    </section>

                    {/* Mock Features */}
                    <section style={{ padding: '60px 30px' }}>
                      <h2 style={{ textAlign: 'center', fontSize: '28px', color: stageData.stage5.colorPalette.primary, marginBottom: '40px', fontWeight: 'bold' }}>Our Services</h2>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {[1,2,3].map(i => (
                          <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: `4px solid ${stageData.stage5.colorPalette.primary}` }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: stageData.stage5.colorPalette.secondary, marginBottom: '15px' }}></div>
                            <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Feature {i}</h3>
                            <p style={{ fontSize: '13px', opacity: 0.7 }}>High quality service tailored for {stageData.stage1.targetAudience}.</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={goBack} className="text-[#666] font-bold hover:text-[#333] px-6 py-3">Back</button>
              <button
                onClick={() => advanceStage('Loading template library...')}
                className="bg-[#1a3a52] text-white px-10 py-4 rounded-[10px] font-bold text-[16px] hover:bg-[#112a3c] transition-colors shadow-md"
              >
                Continue to Templates
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STAGE 6: TEMPLATES */}
        {/* ========================================== */}
        {currentStage === 6 && (
          <div className="animate-fade-in max-w-[1200px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a3a52] mb-3">Choose Your Website Template</h2>
              <p className="text-[16px] text-[#666]">Select from 20+ professional templates from Shopify, Google, and Custom builders</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {TEMPLATES.map(tpl => {
                const isSelected = stageData.stage6.selectedTemplate === tpl.id;
                return (
                  <div 
                    key={tpl.id}
                    className={`bg-white rounded-[12px] overflow-hidden border-2 transition-all flex flex-col
                      ${isSelected ? 'border-[#1a3a52] shadow-lg transform scale-[1.02]' : 'border-[#eee] hover:border-[#ccc] hover:shadow-md'}`}
                  >
                    <div className="h-[140px] bg-[#f5f5f5] relative border-b border-[#eee] flex items-center justify-center">
                      <div className="text-[#ccc] text-[40px]">🖼️</div>
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-[#333] shadow-sm">
                        {tpl.provider}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-[16px] text-[#333]">{tpl.name}</h3>
                        <span className="text-[12px] text-[#f59e0b] font-bold">★ {tpl.rating}</span>
                      </div>
                      <div className="text-[11px] font-bold text-[#1a3a52] uppercase tracking-wide mb-2">{tpl.type}</div>
                      <p className="text-[13px] text-[#666] mb-4 flex-1">{tpl.desc}</p>
                      
                      <button 
                        onClick={() => updateStageData('stage6', 'selectedTemplate', tpl.id)}
                        className={`w-full py-2 rounded-[6px] font-bold text-[13px] transition-colors
                          ${isSelected ? 'bg-[#1a3a52] text-white' : 'bg-[#f5f5f5] text-[#333] hover:bg-[#e0e0e0]'}`}
                      >
                        {isSelected ? 'Selected' : 'Select Template'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center">
              <button onClick={goBack} className="text-[#666] font-bold hover:text-[#333] px-6 py-3">Back</button>
              <button
                onClick={() => advanceStage('Initializing form builder...')}
                disabled={!stageData.stage6.selectedTemplate}
                className="bg-[#1a3a52] text-white px-10 py-4 rounded-[10px] font-bold text-[16px] hover:bg-[#112a3c] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Form Builder
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STAGE 7: FORM BUILDER */}
        {/* ========================================== */}
        {currentStage === 7 && (
          <div className="animate-fade-in max-w-[1400px] mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a3a52] mb-2">Customize Your Website</h2>
              <p className="text-[16px] text-[#666]">Build an interactive website using drag-and-drop</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[800px] mb-10">
              
              {/* LEFT PANEL: Toolbox & Settings */}
              <div className="w-full lg:w-[350px] flex flex-col gap-4 h-full">
                
                {/* Components Library */}
                <div className="bg-white rounded-[12px] border border-[#eee] shadow-sm flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-[#eee] bg-[#fafafa]">
                    <h3 className="font-bold text-[#333]">Components Library</h3>
                    <p className="text-[12px] text-[#666]">Drag to canvas to add</p>
                  </div>
                  <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                    {(Object.keys(DEFAULT_PROPS) as ComponentType[]).map(type => (
                      <div 
                        key={type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, type)}
                        className="p-3 bg-white border border-[#ddd] rounded-[8px] cursor-grab hover:border-[#1a3a52] hover:shadow-sm flex items-center gap-3 transition-all"
                      >
                        <div className="w-8 h-8 bg-[#f5f5f5] rounded flex items-center justify-center text-[#1a3a52]">
                          {type === 'Header' && '🔝'}
                          {type === 'Hero' && '🖼️'}
                          {type === 'Text' && '📝'}
                          {type === 'Features' && '✨'}
                          {type === 'Pricing' && '💰'}
                          {type === 'Contact' && '✉️'}
                          {type === 'Footer' && '🔚'}
                        </div>
                        <span className="font-bold text-[14px] text-[#333]">{type} Section</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Settings Panel (Active Component) */}
                {stageData.stage7.activeComponentId && (
                  <div className="bg-white rounded-[12px] border border-[#1a3a52] shadow-md flex-1 flex flex-col overflow-hidden animate-fade-in">
                    <div className="p-4 border-b border-[#eee] bg-[#1a3a52] text-white flex justify-between items-center">
                      <h3 className="font-bold">Edit Component</h3>
                      <button onClick={() => updateStageData('stage7', 'activeComponentId', null)} className="text-white/70 hover:text-white">✕</button>
                    </div>
                    <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                      {(() => {
                        const comp = stageData.stage7.customComponents.find(c => c.id === stageData.stage7.activeComponentId);
                        if (!comp) return null;
                        return Object.keys(comp.props).map(propKey => (
                          <div key={propKey}>
                            <label className="block text-[12px] font-bold text-[#666] uppercase tracking-wide mb-1">{propKey}</label>
                            {propKey === 'content' || propKey === 'subheadline' ? (
                              <textarea 
                                value={comp.props[propKey]}
                                onChange={(e) => updateComponentProp(comp.id, propKey, e.target.value)}
                                className="w-full p-2 border border-[#ddd] rounded-[6px] text-[14px] focus:outline-none focus:border-[#1a3a52] h-[80px] resize-none"
                              />
                            ) : (
                              <input 
                                type="text" 
                                value={comp.props[propKey]}
                                onChange={(e) => updateComponentProp(comp.id, propKey, e.target.value)}
                                className="w-full p-2 border border-[#ddd] rounded-[6px] text-[14px] focus:outline-none focus:border-[#1a3a52]"
                              />
                            )}
                          </div>
                        ));
                      })()}
                      <button 
                        onClick={() => removeComponent(stageData.stage7.activeComponentId!)}
                        className="w-full py-2 mt-4 border border-[#f44336] text-[#f44336] rounded-[6px] font-bold text-[13px] hover:bg-[#fff5f5] transition-colors"
                      >
                        Delete Component
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT PANEL: Canvas / Live Preview */}
              <div className="flex-1 bg-white rounded-[12px] border border-[#eee] shadow-sm flex flex-col overflow-hidden">
                <div className="p-3 border-b border-[#eee] bg-[#f5f5f5] flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <div className="text-[12px] font-bold text-[#888] uppercase tracking-widest">Live Canvas</div>
                  <div className="w-16"></div>
                </div>
                
                <div 
                  className="flex-1 overflow-y-auto custom-scrollbar builder-canvas bg-[#fafafa] p-4"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e)}
                  style={{ fontFamily: stageData.stage5.typography.font }}
                >
                  {stageData.stage7.customComponents.map((comp, index) => {
                    const isActive = stageData.stage7.activeComponentId === comp.id;
                    const p = comp.props;
                    const pal = stageData.stage5.colorPalette;
                    
                    return (
                      <div 
                        key={comp.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, comp.type, index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.stopPropagation(); handleDrop(e, index); }}
                        onClick={() => updateStageData('stage7', 'activeComponentId', comp.id)}
                        className={`relative mb-4 cursor-pointer transition-all border-2 rounded-[8px] overflow-hidden
                          ${isActive ? 'border-[#1a3a52] shadow-lg ring-4 ring-[#1a3a52]/20' : 'border-transparent hover:border-[#ddd] shadow-sm'}`}
                      >
                        {/* Render Component Preview */}
                        <div className="pointer-events-none">
                          {comp.type === 'Header' && (
                            <div style={{ background: pal.primary, color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{p.logoText}</div>
                              <div style={{ display: 'flex', gap: '15px', fontSize: '13px' }}>{p.navLinks.split(',').map((l:string, i:number) => <span key={i}>{l.trim()}</span>)}</div>
                              <div style={{ background: 'white', color: pal.primary, padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{p.buttonText}</div>
                            </div>
                          )}
                          {comp.type === 'Hero' && (
                            <div style={{ background: `linear-gradient(135deg, ${pal.primary}, ${pal.secondary})`, color: 'white', padding: '60px 20px', textAlign: 'center' }}>
                              <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '15px' }}>{p.headline}</h2>
                              <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '20px' }}>{p.subheadline}</p>
                              <div style={{ display: 'inline-block', background: 'white', color: pal.primary, padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold' }}>{p.buttonText}</div>
                            </div>
                          )}
                          {comp.type === 'Text' && (
                            <div style={{ padding: '40px 20px', textAlign: p.align, background: pal.bg, color: pal.text }}>
                              <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{p.content}</p>
                            </div>
                          )}
                          {comp.type === 'Features' && (
                            <div style={{ padding: '40px 20px', background: pal.bg }}>
                              <h2 style={{ textAlign: 'center', fontSize: '24px', color: pal.primary, marginBottom: '30px', fontWeight: 'bold' }}>{p.title}</h2>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                {[p.f1, p.f2, p.f3].map((f, i) => (
                                  <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '8px', borderTop: `3px solid ${pal.primary}`, flex: 1, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                    <h3 style={{ fontWeight: 'bold', fontSize: '16px', color: pal.text }}>{f}</h3>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {comp.type === 'Pricing' && (
                            <div style={{ padding: '40px 20px', background: pal.bg }}>
                              <h2 style={{ textAlign: 'center', fontSize: '24px', color: pal.primary, marginBottom: '30px', fontWeight: 'bold' }}>{p.title}</h2>
                              <div style={{ maxWidth: '300px', margin: '0 auto', background: 'white', border: `2px solid ${pal.primary}`, borderRadius: '8px', padding: '30px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '10px', color: pal.text }}>{p.plan}</h3>
                                <div style={{ fontSize: '36px', fontWeight: 'bold', color: pal.primary, marginBottom: '15px' }}>{p.price}</div>
                                <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>✓ {p.feature}</p>
                                <div style={{ background: pal.primary, color: 'white', padding: '10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>Choose Plan</div>
                              </div>
                            </div>
                          )}
                          {comp.type === 'Contact' && (
                            <div style={{ padding: '40px 20px', background: pal.bg }}>
                              <div style={{ maxWidth: '400px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                <h2 style={{ fontSize: '24px', color: pal.primary, marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>{p.title}</h2>
                                <div style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}></div>
                                <div style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}></div>
                                <div style={{ width: '100%', height: '80px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }}></div>
                                <div style={{ background: pal.primary, color: 'white', padding: '10px', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center' }}>{p.buttonText}</div>
                              </div>
                            </div>
                          )}
                          {comp.type === 'Footer' && (
                            <div style={{ background: '#222', color: '#aaa', padding: '30px 20px', textAlign: 'center', fontSize: '14px' }}>
                              <p>{p.text}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Overlay for active state */}
                        {isActive && (
                          <div className="absolute top-2 right-2 bg-[#1a3a52] text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">
                            EDITING
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={goBack} className="text-[#666] font-bold hover:text-[#333] px-6 py-3">Back</button>
              <button
                onClick={() => advanceStage('Generating website code...')}
                disabled={stageData.stage7.customComponents.length === 0}
                className="bg-[#1a3a52] text-white px-10 py-4 rounded-[10px] font-bold text-[16px] hover:bg-[#112a3c] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Website Code
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STAGE 8: CODE GENERATION */}
        {/* ========================================== */}
        {currentStage === 8 && (
          <div className="animate-fade-in max-w-[1200px] mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a3a52] mb-3">Your Website is Ready</h2>
              <p className="text-[16px] text-[#666]">Review your generated code and live preview</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-10">
              {/* Stats & Info */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-[16px] border border-[#eee] shadow-sm">
                  <h3 className="text-[20px] font-bold text-[#333] mb-4 border-b border-[#eee] pb-3">Website Overview</h3>
                  <ul className="space-y-3 text-[15px] text-[#666]">
                    <li><strong className="text-[#333]">Business:</strong> {stageData.stage2.selectedBusinessName}</li>
                    <li><strong className="text-[#333]">Domain:</strong> {stageData.stage3.selectedDomain}</li>
                    <li><strong className="text-[#333]">Template:</strong> {TEMPLATES.find(t => t.id === stageData.stage6.selectedTemplate)?.name}</li>
                    <li><strong className="text-[#333]">Components:</strong> {stageData.stage7.customComponents.length} added</li>
                    <li className="flex items-center gap-2"><span className="text-[#4caf50] font-bold">✓</span> Mobile responsive</li>
                    <li className="flex items-center gap-2"><span className="text-[#4caf50] font-bold">✓</span> SEO optimized</li>
                  </ul>
                </div>

                <div className="bg-[#282c34] p-6 rounded-[16px] shadow-lg overflow-hidden flex flex-col h-[400px]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[16px] font-bold text-white font-mono">index.html</h3>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(stageData.stage8.generatedCode); alert('Code copied!'); }}
                      className="text-[12px] bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded transition-colors"
                    >
                      Copy Code
                    </button>
                  </div>
                  <pre className="flex-1 overflow-auto custom-scrollbar text-[13px] text-[#abb2bf] font-mono leading-relaxed">
                    <code>{stageData.stage8.generatedCode}</code>
                  </pre>
                </div>
              </div>

              {/* Live Iframe Preview */}
              <div className="bg-white rounded-[16px] border border-[#eee] shadow-sm flex flex-col overflow-hidden h-[700px]">
                <div className="bg-[#f5f5f5] p-3 border-b border-[#eee] flex items-center gap-2">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div><div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div><div className="w-3 h-3 rounded-full bg-[#27c93f]"></div></div>
                  <div className="mx-auto bg-white px-4 py-1 rounded-full text-[12px] text-[#888] font-mono">{stageData.stage3.selectedDomain}</div>
                </div>
                <iframe 
                  srcDoc={stageData.stage8.generatedCode} 
                  title="Website Preview"
                  className="w-full flex-1 border-none bg-white"
                  sandbox="allow-scripts"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={goBack} className="text-[#666] font-bold hover:text-[#333] px-6 py-3">Back</button>
              <button
                onClick={() => advanceStage('Finalizing delivery package...')}
                className="bg-[#1a3a52] text-white px-10 py-4 rounded-[10px] font-bold text-[16px] hover:bg-[#112a3c] transition-colors shadow-md"
              >
                Continue to Delivery
              </button>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* STAGE 9: DELIVERY */}
        {/* ========================================== */}
        {currentStage === 9 && (
          <div className="animate-fade-in max-w-[1000px] mx-auto relative">
            {/* Confetti effect simulation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-50">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="absolute w-3 h-3 rounded-sm" style={{
                  left: `${Math.random() * 100}%`, top: `-20px`,
                  backgroundColor: ['#1a3a52', '#4caf50', '#ffbd2e', '#ff5f56'][Math.floor(Math.random() * 4)],
                  animation: `confetti ${2 + Math.random() * 3}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}></div>
              ))}
            </div>

            <div className="text-center mb-10 relative z-10">
              <div className="w-20 h-20 bg-[#4caf50] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg">✓</div>
              <h2 className="text-[32px] md:text-[40px] font-extrabold text-[#1a3a52] mb-3">Marketing Strategy & Delivery</h2>
              <p className="text-[16px] text-[#666]">Get your launch plan and download your website files</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-10 relative z-10">
              
              {/* Marketing Plan */}
              <div className="bg-white p-8 rounded-[16px] border border-[#eee] shadow-sm flex flex-col">
                <h3 className="text-[20px] font-bold text-[#1a3a52] mb-4 border-b border-[#eee] pb-3">Your 30-Day Launch Plan</h3>
                <pre className="flex-1 overflow-auto custom-scrollbar text-[14px] text-[#444] font-sans whitespace-pre-wrap leading-relaxed">
                  {stageData.stage9.marketingPlan}
                </pre>
              </div>

              {/* Delivery & Downloads */}
              <div className="space-y-6">
                <div className="bg-[#e8f5e9] p-6 rounded-[16px] border border-[#c8e6c9]">
                  <h3 className="text-[18px] font-bold text-[#2e7d32] mb-4">Files Ready for Download</h3>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between bg-white/60 p-2 rounded">
                      <span className="text-[14px] font-bold text-[#333]">📄 index.html</span>
                      <span className="text-[12px] text-[#666]">Complete Website</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/60 p-2 rounded">
                      <span className="text-[14px] font-bold text-[#333]">📈 marketing-plan.txt</span>
                      <span className="text-[12px] text-[#666]">Launch Strategy</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/60 p-2 rounded">
                      <span className="text-[14px] font-bold text-[#333]">ℹ️ README.md</span>
                      <span className="text-[12px] text-[#666]">Setup Guide</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleDownloadAll}
                    className="w-full bg-[#2e7d32] text-white py-4 rounded-[10px] font-bold text-[16px] hover:bg-[#1b5e20] transition-colors shadow-md"
                  >
                    Download All Files (ZIP)
                  </button>
                </div>

                <div className="bg-white p-8 rounded-[16px] border border-[#eee] shadow-sm">
                  <h3 className="text-[20px] font-bold text-[#1a3a52] mb-2">Send files to email</h3>
                  <p className="text-[14px] text-[#666] mb-6">Get everything in one email for easy access</p>
                  
                  {stageData.stage9.isEmailSent ? (
                    <div className="bg-[#f8fbff] border border-[#1a3a52]/20 p-6 rounded-[10px] text-center animate-fade-in">
                      <div className="text-[#4caf50] font-bold text-[18px] mb-2">✓ Files sent successfully!</div>
                      <p className="text-[14px] text-[#666]">Check your inbox at <strong>{stageData.stage9.userEmail}</strong></p>
                    </div>
                  ) : (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <input 
                        type="email" 
                        value={stageData.stage9.userEmail}
                        onChange={(e) => updateStageData('stage9', 'userEmail', e.target.value)}
                        placeholder="your@email.com" 
                        required
                        className="w-full h-[50px] px-4 border border-[#ddd] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#1a3a52]"
                      />
                      <button 
                        type="submit"
                        className="w-full bg-transparent border-2 border-[#1a3a52] text-[#1a3a52] py-3 rounded-[10px] font-bold hover:bg-[#f8fbff] transition-colors"
                      >
                        Send Files to Email
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#eee] flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="text-[#1a3a52] font-bold px-8 py-3 border-2 border-[#1a3a52] rounded-[10px] bg-white hover:bg-[#f8fbff] transition-colors"
              >
                Share Website Link
              </button>
              <button 
                onClick={restart} 
                className="text-[#666] font-bold hover:text-[#333] px-8 py-3 border-2 border-[#ddd] rounded-[10px] bg-white hover:bg-[#f5f5f5] transition-colors"
              >
                Start Another Business
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
