import React, { useState, useEffect, useRef } from 'react';
import { Search, Building, MapPin } from 'lucide-react';

interface CollegeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export interface University {
  name: string;
  country: string;
  alpha_two_code: string;
  domains?: string[];
}

export const CUSTOM_COLLEGES: University[] = [
  { name: 'Srinivasa Ramanujan Institute of Technology (SRIT)', country: 'India', alpha_two_code: 'IN', domains: ['srit.ac.in'] },
  { name: 'SRIT Anantapur', country: 'India', alpha_two_code: 'IN', domains: ['srit.ac.in'] },
  { name: 'SRIT', country: 'India', alpha_two_code: 'IN', domains: ['srit.ac.in'] },
  { name: 'PVKK Institute of Technology', country: 'India', alpha_two_code: 'IN', domains: ['pvkkit.ac.in'] },
  { name: 'Jawaharlal Nehru Technological University (JNTU)', country: 'India', alpha_two_code: 'IN', domains: ['jntua.ac.in'] },
  { name: 'Anantha Lakshmi Institute of Technology and Sciences', country: 'India', alpha_two_code: 'IN', domains: ['alts.ac.in'] },
  { name: 'Sri Venkateswara Institute of Technology (SVIT)', country: 'India', alpha_two_code: 'IN', domains: ['svit.ac.in'] },
];

const CollegeLogo = ({ uni }: { uni: University }) => {
  const initialSrc = uni.domains && uni.domains.length > 0 ? `https://logo.clearbit.com/${uni.domains[0]}` : null;
  const [imgSrc, setImgSrc] = useState<string | null>(initialSrc);
  const [triedFallback, setTriedFallback] = useState(false);
  
  if (!imgSrc) {
    return <Building size={16} />;
  }
  
  return (
    <img 
      src={imgSrc} 
      alt={uni.name}
      className="w-full h-full object-contain p-1 rounded-md"
      onError={() => {
        if (!triedFallback && uni.domains && uni.domains.length > 0) {
          setImgSrc(`https://www.google.com/s2/favicons?domain=${uni.domains[0]}&sz=128`);
          setTriedFallback(true);
        } else {
          setImgSrc(null);
        }
      }}
    />
  );
};

export function CollegeAutocomplete({ value, onChange, hasError }: CollegeAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        const localMatches = CUSTOM_COLLEGES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
        const combined = [...localMatches, ...data];

        // Remove duplicates by name
        const uniqueData = Array.from(new Map(combined.map((item: University) => [item.name, item])).values()) as University[];
        
        setResults(uniqueData.slice(0, 10)); // Limit to 10 results
      } catch (error) {
        console.error("Error fetching universities:", error);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (universityName: string) => {
    setQuery(universityName);
    onChange(universityName);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value); // Keep parent updated even if they don't select from dropdown
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 3) setIsOpen(true);
          }}
          placeholder="Start typing your college name..."
          className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm font-medium outline-none transition-all focus:ring-1 ${
            hasError && !query?.trim() 
              ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
              : 'border-slate-200 focus:border-brand-primary focus:ring-brand-primary'
          }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
          ) : (
            <Search size={16} className="text-slate-400" />
          )}
        </div>
      </div>

      {isOpen && (results.length > 0 || query.length >= 3) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
          {results.length > 0 ? (
            <ul className="py-2">
              {results.map((uni, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(uni.name)}
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary/5 flex items-center justify-center text-brand-primary shrink-0 overflow-hidden">
                      <CollegeLogo uni={uni} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-slate-800 truncate">{uni.name}</h5>
                      <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={10} /> {uni.country} ({uni.alpha_two_code})
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : !loading && query.length >= 3 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              No colleges found for "{query}". You can still save it!
              <button 
                onClick={() => handleSelect(query)}
                className="block w-full mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                Use "{query}" anyway
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
