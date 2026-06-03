'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface BusinessRecord {
  businessId: string;
  name: string;
  type: 'Osakeyhtiö (Oy)' | 'Yksityinen elinkeinonharjoittaja (Toiminimi)';
  city: string;
  date: string;
  linkedInUrl: string;
  domainUrl: string;
}

export default function BusinessDashboard() {
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // Fetch businesses on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/businesses');
        if (!res.ok) {
          throw new Error(`Failed to load data: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        if (json.success) {
          setBusinesses(json.data || []);
        } else {
          throw new Error(json.error || 'Unknown error fetching data');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while loading business data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute dynamic lists for filters
  const citiesList = useMemo(() => {
    return Array.from(new Set(businesses.map(b => b.city).filter(Boolean))).sort();
  }, [businesses]);

  const typesList = useMemo(() => {
    return Array.from(new Set(businesses.map(b => b.type).filter(Boolean))).sort();
  }, [businesses]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, selectedType, startDate, endDate]);

  // Filtered businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.businessId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCity = !selectedCity || b.city === selectedCity;
      const matchType = !selectedType || b.type === selectedType;
      
      // Handle date filters (YYYY-MM-DD)
      const matchStart = !startDate || b.date >= startDate;
      const matchEnd = !endDate || b.date <= endDate;

      return matchSearch && matchCity && matchType && matchStart && matchEnd;
    });
  }, [businesses, searchQuery, selectedCity, selectedType, startDate, endDate]);

  // Paginated businesses
  const paginatedBusinesses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBusinesses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBusinesses, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredBusinesses.length / itemsPerPage));

  // Compute summary stats
  const stats = useMemo(() => {
    const total = filteredBusinesses.length;
    const oyCount = filteredBusinesses.filter(b => b.type === 'Osakeyhtiö (Oy)').length;
    const tmiCount = filteredBusinesses.filter(b => b.type.includes('Toiminimi')).length;
    const uniqueCities = new Set(filteredBusinesses.map(b => b.city)).size;

    return { total, oyCount, tmiCount, uniqueCities };
  }, [filteredBusinesses]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedType('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = searchQuery || selectedCity || selectedType || startDate || endDate;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mb-4"></div>
        <p className="text-sm tracking-widest uppercase opacity-60">Retrieving business directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-card-bg border border-border-gold rounded-lg">
        <svg className="w-12 h-12 text-red-500 mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-light text-gold mb-2">Error Loading Data</h3>
        <p className="max-w-md text-sm opacity-60 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2 border border-gold text-gold text-xs uppercase tracking-wider hover:bg-gold hover:text-background transition duration-300">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* 1. Statistics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card-bg border border-border-subtle rounded flex flex-col justify-between">
          <span className="text-[10px] tracking-widest uppercase text-gold font-light">Filtered Businesses</span>
          <span className="text-3xl font-light mt-1 text-foreground">{stats.total}</span>
        </div>
        <div className="p-4 bg-card-bg border border-border-subtle rounded flex flex-col justify-between">
          <span className="text-[10px] tracking-widest uppercase text-gold font-light">Limited Companies (Oy)</span>
          <span className="text-3xl font-light mt-1 text-foreground">{stats.oyCount}</span>
        </div>
        <div className="p-4 bg-card-bg border border-border-subtle rounded flex flex-col justify-between">
          <span className="text-[10px] tracking-widest uppercase text-gold font-light">Private Traders (Tmi)</span>
          <span className="text-3xl font-light mt-1 text-foreground">{stats.tmiCount}</span>
        </div>
        <div className="p-4 bg-card-bg border border-border-subtle rounded flex flex-col justify-between">
          <span className="text-[10px] tracking-widest uppercase text-gold font-light">Active Cities</span>
          <span className="text-3xl font-light mt-1 text-foreground">{stats.uniqueCities}</span>
        </div>
      </div>

      {/* 2. Advanced Search & Interactive Filter Controls */}
      <div className="p-5 bg-card-bg border border-border-subtle rounded-lg space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Text Search (5 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-1.5">
            <label className="text-[10px] tracking-wider uppercase opacity-55">Search Name / ID</label>
            <div className="relative">
              <input
                type="text"
                placeholder="E.g. Silver Trade Oy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border-gold rounded px-3 py-2 text-sm text-foreground placeholder:opacity-40 focus:outline-none focus:border-gold transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs opacity-50 hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Domicile Dropdown (2 cols) */}
          <div className="lg:col-span-2 flex flex-col space-y-1.5">
            <label className="text-[10px] tracking-wider uppercase opacity-55">City (Kotipaikka)</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-background border border-border-gold rounded px-2.5 py-2 text-sm text-foreground focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
            >
              <option value="">All Cities</option>
              {citiesList.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Company Type Dropdown (2 cols) */}
          <div className="lg:col-span-2 flex flex-col space-y-1.5">
            <label className="text-[10px] tracking-wider uppercase opacity-55">Company Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-background border border-border-gold rounded px-2.5 py-2 text-sm text-foreground focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
            >
              <option value="">All Types</option>
              {typesList.map(type => (
                <option key={type} value={type}>
                  {type.includes('Osakeyhtiö') ? 'Limited (Oy)' : 'Trader (Tmi)'}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker Start (2 cols) */}
          <div className="lg:col-span-2 flex flex-col space-y-1.5">
            <label className="text-[10px] tracking-wider uppercase opacity-55 font-light">Registered From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-background border border-border-gold rounded px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* Date Picker End (2 cols) */}
          <div className="lg:col-span-2 flex flex-col space-y-1.5">
            <label className="text-[10px] tracking-wider uppercase opacity-55 font-light">Registered To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-background border border-border-gold rounded px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>

        </div>

        {/* Clear Filters bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between border-t border-border-subtle pt-3 text-xs">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="opacity-50">Active Filters:</span>
              {searchQuery && <span className="px-2 py-0.5 bg-background border border-border-gold rounded text-[10px] text-gold">Search: "{searchQuery}"</span>}
              {selectedCity && <span className="px-2 py-0.5 bg-background border border-border-gold rounded text-[10px] text-gold">City: {selectedCity}</span>}
              {selectedType && <span className="px-2 py-0.5 bg-background border border-border-gold rounded text-[10px] text-gold">{selectedType.includes('Osakeyhtiö') ? 'Oy' : 'Toiminimi'}</span>}
              {(startDate || endDate) && <span className="px-2 py-0.5 bg-background border border-border-gold rounded text-[10px] text-gold">Dates: {startDate || '*'} to {endDate || '*'}</span>}
            </div>
            <button
              onClick={handleClearFilters}
              className="text-gold hover:text-gold-hover transition-colors font-medium tracking-wide uppercase text-[10px]"
            >
              Clear All Filters ✕
            </button>
          </div>
        )}
      </div>

      {/* 3. Clean Responsive Table */}
      <div className="bg-card-bg border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-background/50">
                <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase text-gold w-[140px]">Business ID</th>
                <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase text-gold">Company Name</th>
                <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase text-gold w-[180px]">Company Type</th>
                <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase text-gold w-[150px]">Domicile / City</th>
                <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase text-gold w-[140px]">Registered On</th>
                <th className="px-6 py-4 text-[10px] font-medium tracking-wider uppercase text-gold text-right w-[240px]">Action Shortcuts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {paginatedBusinesses.length > 0 ? (
                paginatedBusinesses.map((record) => (
                  <tr key={record.businessId} className="hover:bg-background/25 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs opacity-75">{record.businessId}</td>
                    <td className="px-6 py-4 font-light text-foreground group-hover:text-gold transition-colors">{record.name}</td>
                    <td className="px-6 py-4 text-xs opacity-75">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        record.type === 'Osakeyhtiö (Oy)' 
                          ? 'bg-blue-950/40 border border-blue-900/50 text-blue-300' 
                          : 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-300'
                      }`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-light opacity-75">{record.city || '—'}</td>
                    <td className="px-6 py-4 text-xs opacity-75">{record.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* LinkedIn Finder Button */}
                        <a
                          href={record.linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 border border-border-gold rounded text-[10px] tracking-wider uppercase text-gold hover:bg-gold hover:text-background font-medium transition duration-200 inline-flex items-center gap-1.5"
                          title={`Find founders of ${record.name} on LinkedIn`}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.8v8.37h2.8v-4.67c0-.25.02-.5.1-.68a1.14 1.14 0 0 1 1-.77c.76 0 1 .52 1 1.42v4.7zM7.05 9.38a1.44 1.44 0 1 0 0-2.88 1.44 1.44 0 0 0 0 2.88zm1.4 9.12V10.13H5.66V18.5z"/>
                          </svg>
                          LinkedIn
                        </a>
                        {/* Domain Discovery Button */}
                        <a
                          href={record.domainUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 border border-border-gold rounded text-[10px] tracking-wider uppercase text-gold hover:bg-gold hover:text-background font-medium transition duration-200 inline-flex items-center gap-1.5"
                          title={`Discover domain / website for ${record.name}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Domain
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm opacity-50">
                    No business records matched the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle bg-background/30 text-xs">
            <span className="opacity-60">
              Showing <span className="font-medium text-foreground">{Math.min(filteredBusinesses.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
              <span className="font-medium text-foreground">{Math.min(filteredBusinesses.length, currentPage * itemsPerPage)}</span> of{' '}
              <span className="font-medium text-foreground">{filteredBusinesses.length}</span> businesses
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-border-gold text-gold rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gold hover:bg-gold hover:text-background transition text-[10px] tracking-wider uppercase font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-border-gold text-gold rounded disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gold hover:bg-gold hover:text-background transition text-[10px] tracking-wider uppercase font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
