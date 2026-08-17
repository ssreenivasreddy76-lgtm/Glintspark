import React, { useState, useEffect } from 'react';
import { supabaseDB } from '../services/supabaseService';
import { FileText, Plus, Pencil, Trash2, Search, Save, X, GripVertical, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminSheets() {
  const [sheets, setSheets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState<any>(null);
  
  const fetchSheets = async () => {
    setIsLoading(true);
    const data = await supabaseDB.getPracticeSheets();
    setSheets(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  const handleAdd = () => {
    setEditingSheet({
      id: '',
      title: '',
      description: '',
      icon: 'FileText',
      estimated_time: '',
      color: 'from-blue-600 to-indigo-600',
      is_premium: false,
      steps: []
    });
    setIsModalOpen(true);
  };

  const handleEdit = (sheet: any) => {
    setEditingSheet(JSON.parse(JSON.stringify(sheet)));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this sheet?')) {
      await supabaseDB.deletePracticeSheet(id);
      fetchSheets();
    }
  };

  const handleSave = async () => {
    if (!editingSheet.id || !editingSheet.title) {
      alert("ID and Title are required");
      return;
    }
    
    // Auto-calculate total questions from steps
    const total_questions = editingSheet.steps.reduce((sum: number, step: any) => sum + (Number(step.questions) || 0), 0);
    const sheetToSave = { ...editingSheet, total_questions };
    
    await supabaseDB.savePracticeSheet(sheetToSave);
    setIsModalOpen(false);
    fetchSheets();
  };

  const addStep = () => {
    setEditingSheet({
      ...editingSheet,
      steps: [...(editingSheet.steps || []), { id: `s${Date.now()}`, title: '', description: '', tags: [], questions: 0 }]
    });
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...editingSheet.steps];
    if (field === 'tags') {
      newSteps[index][field] = value.split(',').map((t: string) => t.trim()).filter((t: string) => t);
    } else {
      newSteps[index][field] = value;
    }
    setEditingSheet({ ...editingSheet, steps: newSteps });
  };

  const removeStep = (index: number) => {
    const newSteps = [...editingSheet.steps];
    newSteps.splice(index, 1);
    setEditingSheet({ ...editingSheet, steps: newSteps });
  };

  const filteredSheets = sheets.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-8 h-full overflow-hidden bg-slate-50/50">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Practice Sheets</h2>
          <p className="text-slate-500 font-medium">Create and manage curated collections of practice problems.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search sheets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-medium focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary w-64 transition-all"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/40 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} />
            Create Sheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pb-10">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20 text-slate-400">Loading...</div>
        ) : filteredSheets.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed">
            <FileText size={48} className="mb-4 opacity-20" />
            <p className="font-medium text-lg">No sheets found.</p>
            <p className="text-sm mt-1">Click "Create Sheet" to get started.</p>
          </div>
        ) : (
          filteredSheets.map(sheet => (
            <div key={sheet.id} className="bg-white rounded-2xl shadow-md border border-slate-200/60 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`h-24 bg-gradient-to-r ${sheet.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                {sheet.is_premium && (
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                    Premium
                  </div>
                )}
                <div className="absolute -bottom-6 left-6 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-brand-primary transform group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
              </div>
              <div className="pt-10 p-6">
                <h3 className="font-black text-lg text-slate-900 mb-2">{sheet.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{sheet.description}</p>
                
                <div className="flex items-center gap-4 text-xs font-bold text-slate-600 mb-6">
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500"/> {sheet.total_questions || 0} Questions</div>
                  <div className="flex items-center gap-1.5"><FileText size={14} className="text-brand-primary"/> {(sheet.steps || []).length} Steps</div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button onClick={() => handleEdit(sheet)} className="flex-1 py-2 bg-slate-50 text-slate-700 font-bold rounded-lg hover:bg-brand-primary hover:text-white transition-colors text-sm">
                    Edit Sheet
                  </button>
                  <button onClick={() => handleDelete(sheet.id)} className="px-4 py-2 bg-slate-50 text-rose-500 rounded-lg hover:bg-rose-50 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && editingSheet && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-black text-slate-900">
                {editingSheet.id && sheets.find(s => s.id === editingSheet.id) ? 'Edit Practice Sheet' : 'Create Practice Sheet'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-lg p-1 shadow-sm border border-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <div className="grid grid-cols-2 gap-6 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                <div className="col-span-2 md:col-span-1 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Sheet ID (Unique URL)</label>
                    <input type="text" value={editingSheet.id} onChange={e => setEditingSheet({...editingSheet, id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-slate-50 focus:bg-white" placeholder="e.g. tcs-nqt-2026" disabled={!!sheets.find(s => s.id === editingSheet.id) && editingSheet.id !== ''} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Title</label>
                    <input type="text" value={editingSheet.title} onChange={e => setEditingSheet({...editingSheet, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-slate-50 focus:bg-white" placeholder="e.g. TCS NQT 2026 Sheet" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Estimated Time</label>
                    <input type="text" value={editingSheet.estimated_time} onChange={e => setEditingSheet({...editingSheet, estimated_time: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-slate-50 focus:bg-white" placeholder="e.g. 4 Weeks" />
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Description</label>
                    <textarea value={editingSheet.description} onChange={e => setEditingSheet({...editingSheet, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-slate-50 focus:bg-white custom-scrollbar resize-none" placeholder="Brief description of the sheet..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Gradient Color</label>
                      <select value={editingSheet.color} onChange={e => setEditingSheet({...editingSheet, color: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-primary/20">
                        <option value="from-blue-600 to-indigo-600">Blue-Indigo</option>
                        <option value="from-rose-600 to-orange-600">Rose-Orange</option>
                        <option value="from-emerald-600 to-teal-600">Emerald-Teal</option>
                        <option value="from-purple-600 to-pink-600">Purple-Pink</option>
                        <option value="from-slate-800 to-slate-900">Dark Slate</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={editingSheet.is_premium} onChange={e => setEditingSheet({...editingSheet, is_premium: e.target.checked})} className="w-4 h-4 text-brand-primary rounded border-slate-300 focus:ring-brand-primary" />
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Premium Sheet</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black text-slate-900">Steps / Sections</h3>
                  <button onClick={addStep} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-slate-800 transition-colors">
                    <Plus size={14} /> Add Step
                  </button>
                </div>
                
                <div className="space-y-4">
                  {(editingSheet.steps || []).map((step: any, index: number) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative group">
                      <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center text-slate-300 border-r border-slate-100 cursor-move hover:text-slate-500">
                        <GripVertical size={16} />
                      </div>
                      <button onClick={() => removeStep(index)} className="absolute right-4 top-4 text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="pl-8 pr-8 grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Step Title</label>
                            <input type="text" value={step.title} onChange={e => updateStep(index, 'title', e.target.value)} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20" placeholder="e.g. Arrays & Hashing" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Description</label>
                            <input type="text" value={step.description} onChange={e => updateStep(index, 'description', e.target.value)} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20" placeholder="Foundation of DSA..." />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Tags (comma separated)</label>
                            <input type="text" value={(step.tags || []).join(', ')} onChange={e => updateStep(index, 'tags', e.target.value)} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20" placeholder="Arrays, Hash Table" />
                            <p className="text-[10px] text-slate-400 mt-1">Questions with these tags will appear in this step.</p>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-wider">Question Count</label>
                            <input type="number" value={step.questions || 0} onChange={e => updateStep(index, 'questions', parseInt(e.target.value))} className="w-32 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(editingSheet.steps || []).length === 0 && (
                    <div className="text-center py-8 text-slate-400 border border-slate-200 border-dashed rounded-xl bg-white">
                      No steps added. Click "Add Step" to create sections.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:bg-brand-secondary transition-all">
                <Save size={18} />
                Save Sheet
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
