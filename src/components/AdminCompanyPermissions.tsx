import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Search, Building } from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminCompanyPermissions() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('mock_company_permissions');
    if (saved) {
      try {
        setCompanies(JSON.parse(saved));
      } catch {
        setCompanies([]);
      }
    } else {
      const initial = [
        { id: 'c-1', name: 'Google', domain: 'google.com', activeUsers: 1450, permissions: { mockInterviews: true, quizzes: true, contests: true } },
        { id: 'c-2', name: 'Amazon', domain: 'amazon.com', activeUsers: 890, permissions: { mockInterviews: true, quizzes: false, contests: true } },
        { id: 'c-3', name: 'Microsoft', domain: 'microsoft.com', activeUsers: 2100, permissions: { mockInterviews: true, quizzes: true, contests: false } },
        { id: 'c-4', name: 'Startup Inc', domain: 'startup.io', activeUsers: 45, permissions: { mockInterviews: false, quizzes: false, contests: false } },
      ];
      setCompanies(initial);
      localStorage.setItem('mock_company_permissions', JSON.stringify(initial));
    }

    const savedRequests = localStorage.getItem('mock_company_requests');
    if (savedRequests) {
      try {
        setRequests(JSON.parse(savedRequests));
      } catch {
        setRequests([]);
      }
    } else {
      const initialReqs = [
        { id: 'req-1', company: 'Startup Inc', domain: 'startup.io', type: 'mockInterviews', label: 'Mock Interviews', date: '2 hours ago' },
        { id: 'req-2', company: 'Netflix', domain: 'netflix.com', type: 'contests', label: 'Host Contests', date: '1 day ago' },
      ];
      setRequests(initialReqs);
      localStorage.setItem('mock_company_requests', JSON.stringify(initialReqs));
    }
  }, []);

  const saveToStorage = (data: any[]) => {
    localStorage.setItem('mock_company_permissions', JSON.stringify(data));
    setCompanies(data);
  };

  const saveRequests = (data: any[]) => {
    localStorage.setItem('mock_company_requests', JSON.stringify(data));
    setRequests(data);
  };

  const togglePermission = (companyId: string, permissionType: string) => {
    const updated = companies.map(c => {
      if (c.id === companyId) {
        return {
          ...c,
          permissions: {
            ...c.permissions,
            [permissionType]: !c.permissions[permissionType]
          }
        };
      }
      return c;
    });
    saveToStorage(updated);
  };

  const handleApprove = (req: any) => {
    // Make sure company exists in companies array, if not add it
    let currentCompanies = [...companies];
    const existing = currentCompanies.find(c => c.domain === req.domain);
    
    if (existing) {
      currentCompanies = currentCompanies.map(c => 
        c.domain === req.domain ? { ...c, permissions: { ...c.permissions, [req.type]: true } } : c
      );
    } else {
      currentCompanies.push({
        id: `c-${Date.now()}`,
        name: req.company,
        domain: req.domain,
        activeUsers: 0,
        permissions: { mockInterviews: req.type === 'mockInterviews', quizzes: req.type === 'quizzes', contests: req.type === 'contests' }
      });
    }
    
    saveToStorage(currentCompanies);
    saveRequests(requests.filter(r => r.id !== req.id));
  };

  const handleReject = (id: string) => {
    saveRequests(requests.filter(r => r.id !== id));
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || c.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-8 h-full overflow-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900">Company Permissions</h2>
          <p className="text-sm text-slate-500 mt-1">Grant or revoke access for specific domains to create custom content.</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search domains..."
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-brand-primary outline-none"
          />
        </div>
      </div>

      {requests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Pending Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map(req => (
              <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{req.company} <span className="text-slate-400 font-normal">wants to enable</span> {req.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{req.date} • @{req.domain}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleReject(req.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition">
                    <X size={16} />
                  </button>
                  <button onClick={() => handleApprove(req)} className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition">
                    <Check size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">All Companies</h3>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-wider">
              <th className="px-6 py-4">Company & Domain</th>
              <th className="px-6 py-4 text-center">Mock Interviews</th>
              <th className="px-6 py-4 text-center">Custom Quizzes</th>
              <th className="px-6 py-4 text-center">Host Contests</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredCompanies.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Building size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">@{c.domain}</p>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <ToggleSwitch 
                      isOn={c.permissions.mockInterviews} 
                      onToggle={() => togglePermission(c.id, 'mockInterviews')} 
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <ToggleSwitch 
                      isOn={c.permissions.quizzes} 
                      onToggle={() => togglePermission(c.id, 'quizzes')} 
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <ToggleSwitch 
                      isOn={c.permissions.contests} 
                      onToggle={() => togglePermission(c.id, 'contests')} 
                    />
                  </div>
                </td>
              </tr>
            ))}
            {filteredCompanies.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No companies found matching "{search}".</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ToggleSwitch({ isOn, onToggle }: { isOn: boolean, onToggle: () => void }) {
  return (
    <div 
      onClick={onToggle}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isOn ? 'bg-brand-primary' : 'bg-slate-200'}`}
    >
      <motion.div 
        layout
        initial={false}
        animate={{ x: isOn ? 24 : 0 }}
        className={`w-4 h-4 rounded-full shadow-sm flex items-center justify-center ${isOn ? 'bg-white text-brand-primary' : 'bg-white text-slate-300'}`}
      >
        {isOn ? <Check size={10} strokeWidth={4} /> : <X size={10} strokeWidth={4} />}
      </motion.div>
    </div>
  );
}
