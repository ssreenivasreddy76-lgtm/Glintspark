import React, { useState, useEffect } from 'react';
import { Search, User, Trash2, Mail, GraduationCap, Shield, UserX, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabaseDB } from '../services/supabaseService';
import type { User as UserType } from '../types';

export function AdminUsers() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await supabaseDB.getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error("Failed to load users", err);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string, email: string) => {
    if (confirm(`Are you sure you want to permanently delete the user ${email}?`)) {
      await supabaseDB.deleteUser(id);
      loadUsers(); // refresh the list
    }
  };

  const handleToggleBlock = async (id: string, currentStatus: boolean) => {
    // We would need a 'blocked' field in the Supabase users table to fully support this
    // For now, we simulate success or add it to updates
    alert("Blocking functionality would update Supabase here.");
  };

  const filteredUsers = users.filter(u => 
    (u.fullName?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (u.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-8 h-full overflow-hidden bg-slate-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900  flex items-center gap-2">
            <User className="text-brand-primary" size={24} />
            User Management
          </h2>
          <p className="text-slate-500  mt-1 font-medium">View and manage registered developers</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white  border border-slate-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
        </div>
      ) : (
        <div className="bg-white  rounded-2xl shadow-sm border border-slate-200  flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                <tr className="border-b border-slate-200  text-slate-500  text-[11px] font-black uppercase tracking-wider">
                  <th className="px-6 py-4">Developer</th>
                  <th className="px-6 py-4">College & Branch</th>
                  <th className="px-6 py-4 text-center">Graduation Year</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 ">
                      <UserX size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-lg font-bold text-slate-700 ">No users found</p>
                      <p className="text-sm">Try adjusting your search filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={user.id} 
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center font-bold text-brand-primary">
                            {(user.fullName || user.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 ">{user.fullName || 'Unknown Name'}</div>
                            <div className="text-xs text-slate-500  flex items-center gap-1 mt-0.5">
                              <Mail size={12} /> {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700 ">{user.college || '-'}</div>
                        <div className="text-xs text-slate-500  mt-0.5">{user.branch || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-600 ">
                          <GraduationCap size={14} />
                          {user.graduationYear || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.blocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold">
                            <UserX size={12} /> Blocked
                          </span>
                        ) : user.onboarded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                            <Shield size={12} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleToggleBlock(user.id, !!user.blocked)}
                            className={`p-2 rounded-lg transition-colors font-semibold text-xs ${
                              user.blocked 
                                ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                : 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                            }`}
                            title={user.blocked ? 'Unblock User' : 'Block User'}
                          >
                            {user.blocked ? 'Unblock' : 'Block'}
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id, user.email)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
