import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Receipt, 
  FileText, 
  LayoutDashboard, 
  History, 
  LogOut, 
  Upload, 
  ChevronRight, 
  Camera,
  Search,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Mail,
  Cloud,
  Pencil,
  Trash2,
  RefreshCw,
  Filter,
  ArrowUpDown,
  CalendarDays,
  ListFilter,
  Check,
  Loader2,
  Settings,
  Building2,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { extractExpenseFromImage, ExtractedExpense } from './services/geminiService';
import axios from 'axios';
import ExpenseReview from './components/ExpenseReview';
import InvoiceModal from './components/InvoiceModal';
import DrivePicker from './components/DrivePicker';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Types ---
interface Expense extends ExtractedExpense {
  id: string;
  status: 'pending' | 'verified';
  imageUrl?: string;
  createdAt: string;
}

interface UserProfile {
  businessName: string;
  email: string;
  taxId?: string;
}

type InvoiceStatus = 'draft' | 'sent' | 'paid';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  amount: number;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  expenseIds: string[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'invoices' | 'settings'>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<UserProfile>({
    businessName: 'Luxival Ltd',
    email: 'sarakuvam@gmail.com',
    taxId: 'GB123456789'
  });
  const [driveConnected, setDriveConnected] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Advanced Filtering & Sorting State
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'merchantName'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);

  useEffect(() => {
    checkDriveStatus();
    
    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  const checkDriveStatus = async () => {
    try {
      const { data } = await axios.get('/api/auth/google/status');
      setDriveConnected(data.isConnected);
    } catch {
      setDriveConnected(false);
    }
  };

  const handleAuthMessage = (event: MessageEvent) => {
    if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
      checkDriveStatus();
    }
  };

  const handleConnectDrive = async () => {
    if (driveConnected) return;
    try {
      const { data } = await axios.get('/api/auth/google/url');
      const width = 600, height = 700;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      window.open(data.url, 'google-auth', `width=${width},height=${height},left=${left},top=${top}`);
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    const processFile = (file: File): Promise<void> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            const extracted = await extractExpenseFromImage(base64, file.type);
            
            const newExpense: Expense = {
              ...extracted,
              id: Math.random().toString(36).substr(2, 9),
              status: 'pending',
              imageUrl: reader.result as string,
              createdAt: new Date().toISOString()
            };
            
            setExpenses(prev => [newExpense, ...prev]);
            resolve();
          } catch (err) {
            console.error(`Failed to process ${file.name}:`, err);
            resolve(); // Continue with other files even if one fails
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      const fileList = Array.from(files) as File[];
      for (let i = 0; i < fileList.length; i++) {
        setUploadProgress(prev => ({ ...prev, current: i + 1 }));
        await processFile(fileList[i]);
      }
    } catch (error) {
      console.error('Batch upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0 });
      // Reset input
      e.target.value = '';
    }
  };

  const verifyExpense = (id: string) => {
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, status: 'verified' } : exp));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const handleUpdateExpense = (updatedData: ExtractedExpense) => {
    if (!editingExpense) return;
    setExpenses(prev => prev.map(exp => 
      exp.id === editingExpense.id ? { ...exp, ...updatedData, status: 'verified' } : exp
    ));
    setEditingExpense(null);
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    setSelectedExpenseIds([]);
    setShowInvoiceModal(false);
  };

  const handleDriveFilesSelect = async (fileIds: string[]) => {
    setIsUploading(true);
    setUploadProgress({ current: 0, total: fileIds.length });
    try {
      for (let i = 0; i < fileIds.length; i++) {
        setUploadProgress(prev => ({ ...prev, current: i + 1 }));
        const { data } = await axios.get(`/api/drive/file/${fileIds[i]}`);
        const extracted = await extractExpenseFromImage(data.data, data.mimeType);
        
        const newExpense: Expense = {
          ...extracted,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending',
          imageUrl: `data:${data.mimeType};base64,${data.data}`,
          createdAt: new Date().toISOString()
        };
        
        setExpenses(prev => [newExpense, ...prev]);
      }
      setShowDrivePicker(false);
    } catch (err) {
      console.error("Cloud extraction failed:", err);
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  const generateFinancialStatement = () => {
    const doc = new jsPDF();
    // When generating a full statement, we might want to include EVERYTHING
    const verifiedExpenses = expenses.filter(e => e.status === 'verified');
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(user.businessName, 20, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Master Financial Statement", 20, 38);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 44);
    if (user.taxId) doc.text(`Tax ID: ${user.taxId}`, 20, 50);

    // Summary Section
    const totalExpenses = verifiedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
    const totalVatPaid = verifiedExpenses.reduce((sum, e) => sum + (e.taxAmount || 0), 0);
    const totalVatCollected = paidInvoices.reduce((sum, i) => sum + (i.taxAmount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Executive Summary", 20, 65);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Revenue (Paid Invoices): €${totalRevenue.toLocaleString()}`, 20, 75);
    doc.text(`Total Verified Expenses: €${totalExpenses.toLocaleString()}`, 20, 81);
    doc.text(`Total VAT Collected: €${totalVatCollected.toLocaleString()}`, 110, 75);
    doc.text(`Total VAT Paid: €${totalVatPaid.toLocaleString()}`, 110, 81);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Net Operational Balance (Incl Tax): €${netProfit.toLocaleString()}`, 20, 90);
    doc.setDrawColor(200);
    doc.line(20, 95, 190, 95);

    // Expenses Table
    doc.setFontSize(12);
    doc.text("Verified Expense Ledger", 20, 105);
    autoTable(doc, {
      startY: 110,
      head: [['Date', 'Merchant', 'Category', 'VAT', 'Total']],
      body: verifiedExpenses.map(e => [
        new Date(e.date).toLocaleDateString(), 
        e.merchantName, 
        e.category.toUpperCase(), 
        `€${(e.taxAmount || 0).toFixed(2)}`,
        `€${e.amount.toFixed(2)}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [40, 40, 40] }
    });

    // Invoices Table
    const invoiceStartY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text("Invoice Repository", 20, invoiceStartY);
    autoTable(doc, {
      startY: invoiceStartY + 5,
      head: [['Inv #', 'Customer', 'Due Date', 'VAT', 'Total']],
      body: invoices.map(i => [
        i.invoiceNumber, 
        i.customerName, 
        new Date(i.dueDate).toLocaleDateString(), 
        `€${(i.taxAmount || 0).toFixed(2)}`,
        `€${i.amount.toFixed(2)}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [184, 158, 100] } // Gold-ish
    });

    doc.save(`${user.businessName}_Master_Statement.pdf`);
  };

  const generateFilteredExpenseReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(user.businessName, 20, 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Filtered Expense Report", 20, 38);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 44);
    
    // Active Filters Summary
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Applied Filters: Status: ${statusFilter}, Category: ${categoryFilter}, Search: ${searchQuery || 'None'}`, 20, 52);
    doc.setTextColor(0);

    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    autoTable(doc, {
      startY: 60,
      head: [['Date', 'Merchant', 'Category', 'Status', 'Amount']],
      body: filteredExpenses.map(e => [
        new Date(e.date).toLocaleDateString(), 
        e.merchantName, 
        e.category.toUpperCase(), 
        e.status.toUpperCase(),
        `€${e.amount.toFixed(2)}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [10, 10, 10] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Report Total: €${total.toFixed(2)}`, 140, finalY);

    doc.save(`${user.businessName}_Expense_Report.pdf`);
  };

  const filteredExpenses = expenses
    .filter(exp => {
      // Search Box
      const matchesSearch = exp.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           exp.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status Filter
      const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
      
      // Category Filter
      const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;
      
      // Date Range Filter
      const expDate = new Date(exp.date);
      const matchesStartDate = !dateRange.start || expDate >= new Date(dateRange.start);
      const matchesEndDate = !dateRange.end || expDate <= new Date(dateRange.end);
      
      return matchesSearch && matchesStatus && matchesCategory && matchesStartDate && matchesEndDate;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'merchantName') {
        comparison = a.merchantName.localeCompare(b.merchantName);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const categories = [
    "transport", "fuel", "software", "subscriptions", 
    "office_supplies", "food", "maintenance", 
    "marketing", "utilities", "miscellaneous"
  ];

  const toggleExpenseSelection = (id: string) => {
    setSelectedExpenseIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-lux-gray flex flex-col lg:flex-row">
      {/* Sidebar - Luxival Style */}
      <aside className="w-full lg:w-72 bg-white border-r border-lux-border flex flex-col p-8 lg:h-screen sticky top-0 z-50">
        <div className="mb-12">
          <h1 className="text-3xl font-serif tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 bg-lux-black rounded-sm flex items-center justify-center">
              <div className="w-4 h-0.5 bg-white rotate-45" />
              <div className="w-4 h-0.5 bg-white -rotate-45 absolute" />
            </span>
            Vault Ledger
          </h1>
          <p className="lux-label mt-2">Luxival Extension</p>
        </div>

        <nav className="flex-1 space-y-6">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex items-center gap-4 w-full text-left transition-all group",
              activeTab === 'dashboard' ? "text-lux-black font-semibold" : "text-gray-400 hover:text-lux-black"
            )}
          >
            <div className={cn(
              "w-1 h-8 rounded-full transition-all",
              activeTab === 'dashboard' ? "bg-lux-black" : "bg-transparent group-hover:bg-gray-200"
            )} />
            <LayoutDashboard size={20} />
            <span className="text-sm tracking-wide">Overview</span>
          </button>

          <button 
            onClick={() => setActiveTab('expenses')}
            className={cn(
              "flex items-center gap-4 w-full text-left transition-all group",
              activeTab === 'expenses' ? "text-lux-black font-semibold" : "text-gray-400 hover:text-lux-black"
            )}
          >
            <div className={cn(
              "w-1 h-8 rounded-full transition-all",
              activeTab === 'expenses' ? "bg-lux-black" : "bg-transparent group-hover:bg-gray-200"
            )} />
            <History size={20} />
            <span className="text-sm tracking-wide">Expense Ledger</span>
          </button>

          <button 
            onClick={() => setActiveTab('invoices')}
            className={cn(
              "flex items-center gap-4 w-full text-left transition-all group",
              activeTab === 'invoices' ? "text-lux-black font-semibold" : "text-gray-400 hover:text-lux-black"
            )}
          >
            <div className={cn(
              "w-1 h-8 rounded-full transition-all",
              activeTab === 'invoices' ? "bg-lux-black" : "bg-transparent group-hover:bg-gray-200"
            )} />
            <FileText size={20} />
            <span className="text-sm tracking-wide">Invoice Gen</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex items-center gap-4 w-full text-left transition-all group",
              activeTab === 'settings' ? "text-lux-black font-semibold" : "text-gray-400 hover:text-lux-black"
            )}
          >
            <div className={cn(
              "w-1 h-8 rounded-full transition-all",
              activeTab === 'settings' ? "bg-lux-black" : "bg-transparent group-hover:bg-gray-200"
            )} />
            <Settings size={20} />
            <span className="text-sm tracking-wide">Business Profile</span>
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-lux-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lux-black flex items-center justify-center text-white font-serif">
              L
            </div>
            <div>
              <p className="text-xs font-semibold">{user.businessName}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Helsinki HQ</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:max-h-screen overflow-y-auto p-8 lg:p-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-serif">
              {activeTab === 'dashboard' && "Strategic Outlook"}
              {activeTab === 'expenses' && "Expense Repository"}
              {activeTab === 'invoices' && "Invoice Architect"}
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} — Precise Data Orchestration
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={generateFinancialStatement}
              className="flex items-center gap-2 px-6 py-3 border border-lux-border rounded-full text-xs font-mono uppercase tracking-widest hover:border-lux-black transition-all"
            >
              <FileText size={18} /> Download Statement
            </button>
            <label className={cn(
              "lux-button-primary cursor-pointer flex items-center gap-2 w-full md:w-auto justify-center transition-all",
              isUploading && "opacity-70 pointer-events-none"
            )}>
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {isUploading ? `Extracting (${uploadProgress.current}/${uploadProgress.total})` : "Ingest Document"}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,application/pdf" 
                multiple 
                disabled={isUploading}
                onChange={handleFileUpload} 
              />
            </label>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="lux-card p-8">
                  <p className="lux-label mb-4">Account Balance</p>
                  <p className="text-3xl font-serif">€{expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-mono">
                    <History size={12} />
                    MTD Expenditure
                  </div>
                </div>

                <div className="lux-card p-8 bg-lux-black text-white">
                  <p className="lux-label text-gray-400 mb-4">Action Pipeline</p>
                  <p className="text-3xl font-serif">{expenses.filter(e => e.status === 'pending').length}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-lux-gold font-mono uppercase tracking-widest">
                    Verification Required
                  </div>
                </div>

                <div className="lux-card p-8">
                  <p className="lux-label mb-4">Cloud Integrations</p>
                  <div className="flex gap-4 mt-2">
                    <Cloud className={cn("transition-colors", driveConnected ? "text-lux-gold" : "text-gray-300")} />
                    <Mail className="text-gray-300" />
                    <button 
                      onClick={handleConnectDrive}
                      className="text-lux-black hover:scale-110 transition-transform flex items-center justify-center"
                    >
                      {driveConnected ? <CheckCircle2 size={18} className="text-lux-gold" /> : <Plus size={18} />}
                    </button>
                  </div>
                  <p className="mt-4 text-[10px] text-gray-400 uppercase font-mono">
                    {driveConnected ? "Google Drive Linked" : "Connect Gmail / Drive"}
                  </p>
                  {driveConnected && (
                    <button 
                      onClick={() => setShowDrivePicker(true)}
                      className="mt-6 w-full py-2 border border-lux-black rounded-lg text-[10px] uppercase font-mono tracking-widest hover:bg-lux-black hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Cloud size={12} /> Browse Cloud Vault
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <h3 className="text-xl font-serif">Recent Operations</h3>
                  <button onClick={() => setActiveTab('expenses')} className="text-xs uppercase tracking-widest text-lux-gold hover:underline">View All</button>
                </div>
                
                <div className="lux-card divide-y divide-lux-border overflow-hidden">
                  {expenses.slice(0, 5).map(exp => (
                    <div key={exp.id} className="lux-data-row !bg-white hover:!bg-lux-black group">
                      <div className="flex items-center gap-4 col-span-2">
                        <div className="w-10 h-10 rounded-full bg-lux-gray flex items-center justify-center text-lux-black group-hover:bg-white group-hover:text-lux-black transition-colors">
                          <Receipt size={18} />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{exp.merchantName}</p>
                            {exp.isRecurring && <RefreshCw size={10} className="text-lux-gold animate-spin-slow" />}
                          </div>
                          <p className="text-[10px] uppercase font-mono text-gray-500 group-hover:text-gray-400">{exp.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <p className="font-mono text-sm">€{exp.amount}</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] uppercase font-mono tracking-tighter",
                          exp.status === 'verified' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        )}>
                          {exp.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-end pr-4 text-gray-400 group-hover:text-white">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  ))}
                  {expenses.length === 0 && (
                    <div className="p-12 text-center text-gray-400 italic font-serif">
                      The ledger is currently clear.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'expenses' && (
            <motion.div 
              key="expenses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search by merchant or category..."
                      className="w-full bg-white border border-lux-border rounded-full py-3 pl-12 pr-6 outline-none focus:border-lux-black transition-all text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className={cn(
                        "px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest flex items-center gap-2 transition-all font-bold border",
                        showFilters ? "bg-lux-black text-white border-lux-black" : "bg-white text-lux-black border-lux-border hover:border-lux-black"
                      )}
                    >
                      <Filter size={16} /> Filters
                    </button>
                    <button 
                      onClick={() => setShowInvoiceModal(true)}
                      className={cn(
                        "px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest flex items-center gap-2 transition-all font-bold",
                        selectedExpenseIds.length > 0 
                          ? "bg-lux-gold text-lux-black hover:bg-lux-gold/90" 
                          : "bg-lux-black text-white hover:bg-lux-black/90"
                      )}
                    >
                      <FileText size={16} /> 
                      {selectedExpenseIds.length > 0 
                        ? `Create Invoice (${selectedExpenseIds.length})` 
                        : "Manual Invoice"}
                    </button>
                    <button 
                      onClick={generateFilteredExpenseReport}
                      className="lux-button-primary flex items-center justify-center gap-2"
                    >
                      <FileDown size={18} /> Export PDF Report
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white border border-lux-border rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6 mb-2">
                        <div className="space-y-2">
                          <label className="lux-label flex items-center gap-2">
                            <CalendarDays size={12} /> Date Range
                          </label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="date" 
                              className="flex-1 bg-lux-gray rounded-lg px-3 py-2 text-xs border border-transparent focus:border-lux-gold outline-none"
                              value={dateRange.start}
                              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            />
                            <span className="text-gray-300">-</span>
                            <input 
                              type="date" 
                              className="flex-1 bg-lux-gray rounded-lg px-3 py-2 text-xs border border-transparent focus:border-lux-gold outline-none"
                              value={dateRange.end}
                              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="lux-label flex items-center gap-2">
                            <ListFilter size={12} /> Category
                          </label>
                          <select 
                            className="w-full bg-lux-gray rounded-lg px-3 py-2 text-xs border border-transparent focus:border-lux-gold outline-none appearance-none"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                          >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="lux-label flex items-center gap-2">
                            <CheckCircle2 size={12} /> Status
                          </label>
                          <div className="flex gap-2">
                            {(['all', 'pending', 'verified'] as const).map(s => (
                              <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={cn(
                                  "flex-1 py-2 rounded-lg text-[10px] uppercase font-mono transition-all border",
                                  statusFilter === s ? "bg-lux-black text-white border-lux-black" : "bg-white text-gray-400 border-lux-border hover:border-lux-black"
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-end">
                          <button 
                            onClick={() => {
                              setDateRange({ start: '', end: '' });
                              setStatusFilter('all');
                              setCategoryFilter('all');
                              setSearchQuery('');
                            }}
                            className="w-full py-2 text-[10px] uppercase font-mono text-gray-400 hover:text-lux-black transition-colors"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="lux-card overflow-hidden">
                <div className="grid grid-cols-[50px_1fr_1.5fr_1fr_1fr_1fr] p-4 border-b border-lux-border bg-lux-gray/50 items-center">
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded-sm border-lux-border accent-lux-black"
                      checked={selectedExpenseIds.length === filteredExpenses.length && filteredExpenses.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedExpenseIds(filteredExpenses.map(exp => exp.id));
                        } else {
                          setSelectedExpenseIds([]);
                        }
                      }}
                    />
                  </div>
                  <div 
                    className="lux-label pl-4 flex items-center gap-2 cursor-pointer hover:text-lux-black group"
                    onClick={() => {
                      if (sortBy === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('date'); setSortOrder('desc'); }
                    }}
                  >
                    Date
                    <ArrowUpDown size={12} className={cn("transition-opacity", sortBy === 'date' ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
                  </div>
                  <div 
                    className="lux-label pl-4 flex items-center gap-2 cursor-pointer hover:text-lux-black group"
                    onClick={() => {
                      if (sortBy === 'merchantName') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('merchantName'); setSortOrder('asc'); }
                    }}
                  >
                    Merchant
                    <ArrowUpDown size={12} className={cn("transition-opacity", sortBy === 'merchantName' ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
                  </div>
                  <div 
                    className="lux-label text-center flex items-center justify-center gap-2 cursor-pointer hover:text-lux-black group"
                    onClick={() => {
                      if (sortBy === 'amount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('amount'); setSortOrder('desc'); }
                    }}
                  >
                    Amount
                    <ArrowUpDown size={12} className={cn("transition-opacity", sortBy === 'amount' ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
                  </div>
                  <div className="text-center lux-label flex items-center justify-center gap-2 cursor-pointer hover:text-lux-black group">
                    Status
                  </div>
                  <div className="text-right pr-8 lux-label">Actions</div>
                </div>
                <div className="divide-y divide-lux-border">
                  {filteredExpenses.map(exp => (
                    <div key={exp.id} className="grid grid-cols-[50px_1fr_1.5fr_1fr_1fr_1fr] p-6 items-center hover:bg-lux-gray/30 transition-all group">
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded-sm border-lux-border accent-lux-black"
                          checked={selectedExpenseIds.includes(exp.id)}
                          onChange={() => toggleExpenseSelection(exp.id)}
                        />
                      </div>
                      <div className="pl-4">
                        <p className="text-[10px] uppercase font-mono text-gray-500">{new Date(exp.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4 pl-4">
                        <div className="w-12 h-12 bg-lux-gray rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                          {exp.imageUrl ? (
                            <img src={exp.imageUrl} className="w-full h-full object-cover" />
                          ) : (
                            <Camera size={20} className="text-gray-300" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{exp.merchantName}</p>
                            {exp.isRecurring && (
                              <div className="flex items-center gap-1 bg-lux-gold/10 text-lux-gold px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold border border-lux-gold/20">
                                <RefreshCw size={8} className="animate-spin-slow" />
                                {exp.frequency}
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] uppercase font-mono text-gray-400">{exp.category}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-mono text-sm font-semibold">€{exp.amount}</p>
                        {exp.taxAmount !== undefined && (
                          <p className="text-[9px] text-gray-400 font-mono">Tax: €{exp.taxAmount}</p>
                        )}
                      </div>
                      <div className="flex justify-center">
                        <button 
                          onClick={() => verifyExpense(exp.id)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase font-mono tracking-widest transition-all",
                            exp.status === 'verified' 
                              ? "bg-green-50 text-green-700 opacity-60 pointer-events-none" 
                              : "bg-lux-black text-white hover:bg-lux-black/80"
                          )}
                        >
                          {exp.status === 'verified' ? <CheckCircle2 size={12} /> : <Plus size={12} />}
                          {exp.status === 'verified' ? "Verified" : "Approve"}
                        </button>
                      </div>
                      <div className="flex justify-end pr-8 gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingExpense(exp)} 
                          className="text-gray-400 hover:text-lux-black transition-colors"
                          title="Edit Expense"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => deleteExpense(exp.id)} 
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-12">
                <h3 className="text-3xl font-serif">Business Settings</h3>
                <p className="text-gray-400 text-sm mt-2">Manage your clinical branding and fiscal identity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-lux-black rounded-3xl flex items-center justify-center text-white text-4xl font-serif">
                    {user.businessName.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{user.businessName}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">{user.taxId || 'No Tax ID'}</p>
                  </div>
                  <div className="pt-6 border-t border-lux-border space-y-4">
                    <div className="flex items-center gap-3 text-gray-400">
                      <Mail size={16} />
                      <span className="text-xs">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <Globe size={16} />
                      <span className="text-xs">helsinki-node-1.luxival.net</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-10">
                  <div className="bg-white border border-lux-border rounded-3xl p-10 space-y-8 shadow-sm">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="lux-label flex items-center gap-2">
                          <Building2 size={12} /> Legal Business Name
                        </label>
                        <input 
                          type="text" 
                          className="w-full bg-lux-gray border border-transparent focus:border-lux-black rounded-xl px-4 py-3 outline-none transition-all text-sm font-serif"
                          value={user.businessName}
                          onChange={(e) => setUser({ ...user, businessName: e.target.value })}
                          placeholder="e.g. Luxival Dynamics Ltd"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="lux-label flex items-center gap-2">
                          <Mail size={12} /> Professional Email
                        </label>
                        <input 
                          type="email" 
                          className="w-full bg-lux-gray border border-transparent focus:border-lux-black rounded-xl px-4 py-3 outline-none transition-all text-sm"
                          value={user.email}
                          onChange={(e) => setUser({ ...user, email: e.target.value })}
                          placeholder="billing@yourfirm.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="lux-label flex items-center gap-2">
                          <CreditCard size={12} /> Tax / Business ID
                        </label>
                        <input 
                          type="text" 
                          className="w-full bg-lux-gray border border-transparent focus:border-lux-black rounded-xl px-4 py-3 outline-none transition-all text-sm font-mono"
                          value={user.taxId}
                          onChange={(e) => setUser({ ...user, taxId: e.target.value })}
                          placeholder="VAT / GST / Registration #"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-lux-border flex items-center justify-between">
                      <p className="text-[10px] uppercase font-mono text-gray-400 tracking-tighter max-w-[200px]">
                        Changes are synchronized across all issued invoices and statements.
                      </p>
                      <button 
                        onClick={() => setActiveTab('dashboard')}
                        className="bg-lux-black text-white px-8 py-2 rounded-full text-xs font-mono uppercase tracking-widest hover:bg-lux-black/90 transition-all font-bold"
                      >
                        Save Strategy
                      </button>
                    </div>
                  </div>

                  <div className="lux-card p-8 bg-lux-gray/30 border-dashed border-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-lux-border">
                        <Globe size={24} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Multi-Entity Support</p>
                        <p className="text-xs text-gray-500">Upgrade to Luxival Enterprise to manage multiple legal entities from a single terminal.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'invoices' && (
            <motion.div 
              key="invoices"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-2xl font-serif">Invoice Repository</h3>
                  <p className="text-gray-400 text-sm mt-1">Manage issued billing and payment statuses.</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedExpenseIds([]);
                    setShowInvoiceModal(true);
                  }}
                  className="lux-button-primary flex items-center gap-2"
                >
                  <Plus size={16} /> Manual Invoice
                </button>
              </div>

              <div className="lux-card overflow-hidden">
                <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr] p-4 border-b border-lux-border bg-lux-gray/50">
                  <div className="lux-label pl-4">Invoice #</div>
                  <div className="lux-label">Customer</div>
                  <div className="lux-label text-center">Amount</div>
                  <div className="lux-label text-center">Due Date</div>
                  <div className="lux-label text-right pr-8">Status</div>
                </div>
                <div className="divide-y divide-lux-border">
                  {invoices.map(inv => (
                    <div key={inv.id} className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr] p-6 items-center hover:bg-lux-gray/30 transition-all group">
                      <div className="pl-4">
                        <p className="font-mono text-sm font-semibold">{inv.invoiceNumber}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{new Date(inv.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{inv.customerName}</p>
                        <p className="text-[10px] text-gray-400">{inv.customerEmail}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-mono text-sm font-semibold">€{inv.amount.toLocaleString()}</p>
                        <p className="text-[9px] text-gray-400 font-mono">
                          Sub: €{inv.subtotal.toLocaleString()} | Tax ({inv.taxRate}%): €{inv.taxAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-mono text-gray-500 uppercase">{new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex justify-end pr-8 gap-3 items-center">
                        <select
                          value={inv.status}
                          onChange={(e) => updateInvoiceStatus(inv.id, e.target.value as InvoiceStatus)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] uppercase font-mono tracking-tighter outline-none cursor-pointer transition-colors",
                            inv.status === 'paid' && "bg-green-100 text-green-700",
                            inv.status === 'sent' && "bg-blue-100 text-blue-700",
                            inv.status === 'draft' && "bg-gray-100 text-gray-500"
                          )}
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {invoices.length === 0 && (
                    <div className="p-20 text-center text-gray-400 group">
                      <div className="w-16 h-16 bg-lux-gray rounded-full flex items-center justify-center mx-auto mb-6 opacity-40 group-hover:scale-110 transition-transform">
                        <FileText size={32} />
                      </div>
                      <p className="font-serif italic text-lg mb-2">No invoices generated yet.</p>
                      <p className="text-sm font-sans">Select verified expenses from your ledger to start billing.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Loading Overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-lux-black/40 backdrop-blur-md z-[100] flex items-center justify-center"
            >
              <div className="bg-white p-12 rounded-2xl text-center space-y-6 max-w-xs shadow-2xl">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 border-2 border-lux-gray rounded-full" />
                  <div className="absolute inset-0 border-2 border-lux-black border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="font-serif text-xl">Architecting Data...</p>
                <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Gemini is analyzing your document for precision.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingExpense && (
            <ExpenseReview
              data={editingExpense}
              previewUrl={editingExpense.imageUrl}
              documentName={editingExpense.merchantName}
              onSave={handleUpdateExpense}
              onCancel={() => setEditingExpense(null)}
            />
          )}
        </AnimatePresence>

        {/* Invoice Modal */}
        <AnimatePresence>
          {showInvoiceModal && (
            <InvoiceModal
              selectedExpenses={expenses.filter(e => selectedExpenseIds.includes(e.id))}
              onClose={() => setShowInvoiceModal(false)}
              onSave={handleSaveInvoice}
              userProfile={user}
            />
          )}
        </AnimatePresence>

        {/* Drive Picker */}
        <AnimatePresence>
          {showDrivePicker && (
            <DrivePicker 
              onClose={() => setShowDrivePicker(false)}
              onFilesSelect={handleDriveFilesSelect}
              isProcessing={isUploading}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

