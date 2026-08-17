import React, { useState } from 'react';
import { X, Upload, AlertCircle, Info, Settings, Terminal, Database, Code2 } from 'lucide-react';
import type { Challenge, Difficulty } from '../contexts/ChallengesContext';

interface ChallengeModalProps {
  initial?: Partial<Challenge> | null;
  isPracticeMode: boolean; // True if opened from Practice Questions, False if from Challenges
  onSave: (challenge: Omit<Challenge, 'id'>) => void;
  onClose: () => void;
  onBulkUpload?: (file: File) => void;
}

export function ChallengeModal({ initial, isPracticeMode, onSave, onClose, onBulkUpload }: ChallengeModalProps) {
  const [formData, setFormData] = useState({
    title: initial?.title || '',
    difficulty: (initial?.difficulty || 'Easy') as Difficulty,
    category: initial?.category || 'Basic',
    points: initial?.points || ((initial?.difficulty || 'Easy') === 'Easy' ? 2 : (initial?.difficulty || 'Easy') === 'Hard' ? 10 : 5),
    successRate: initial?.successRate || '0%',
    track: initial?.track || 'custom',
    description: initial?.description || '',
    inputFormat: initial?.inputFormat || '',
    outputFormat: initial?.outputFormat || '',
    constraints: initial?.constraints || '',
    timeLimit: initial?.timeLimit || 2,
    memoryLimit: initial?.memoryLimit || 256,
    sampleInput1: initial?.sampleInput1 || '',
    sampleOutput1: initial?.sampleOutput1 || '',
    explanation1: initial?.explanation1 || '',
    sampleInput2: initial?.sampleInput2 || '',
    sampleOutput2: initial?.sampleOutput2 || '',
    explanation2: initial?.explanation2 || '',
    hiddenTestCases: initial?.hiddenTestCases || '',
    allowedLanguages: initial?.allowedLanguages || ['python', 'javascript', 'cpp', 'java', 'c'],
    companiesText: initial?.companies?.join(', ') || '',
  });

  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('manual');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { companiesText, hiddenTestCases, ...restData } = formData;
    
    let parsedTestCases: any[] = [];
    if (hiddenTestCases) {
      try {
        parsedTestCases = JSON.parse(hiddenTestCases);
      } catch (e) {
        console.warn('Could not parse hidden test cases as JSON', e);
      }
    }

    onSave({
      ...restData,
      hiddenTestCases: hiddenTestCases,
      hiddenTestCasesList: parsedTestCases,
      companies: companiesText.split(',').map(s => s.trim()).filter(Boolean),
      isPractice: isPracticeMode
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onBulkUpload) {
      onBulkUpload(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/20 ring-1 ring-slate-900/5">
        
        {/* Header */}
        <div className="flex justify-between items-start px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
          <div>
            <h3 className="text-2xl font-black bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {initial ? 'Edit Challenge' : 'Create New Challenge'}
            </h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              {isPracticeMode ? 'Configure a standalone practice question for users.' : 'Configure a track-specific challenge.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tabs for Add mode (Pill shaped) */}
        {!initial && (
          <div className="px-8 pt-6 pb-2 shrink-0 bg-slate-50/30">
            <div className="flex bg-slate-100/80 p-1.5 rounded-xl w-fit shadow-sm border border-slate-200/50">
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'manual' ? 'bg-white text-brand-primary shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === 'bulk' ? 'bg-white text-brand-primary shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload size={16} />
                Bulk Upload (Excel/CSV)
              </button>
            </div>
          </div>
        )}

        <div className="p-8 overflow-y-auto flex-1 min-h-0 bg-slate-50/30 custom-scrollbar">
          {activeTab === 'bulk' ? (
            <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-brand-primary/20 bg-brand-primary/5 rounded-3xl">
              <div className="w-20 h-20 bg-white text-brand-primary rounded-full shadow-sm border border-brand-primary/10 flex items-center justify-center mb-6">
                <Upload size={36} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Upload Questions File</h4>
              <p className="text-slate-500 text-center max-w-md mb-8">
                Upload your Excel (.xlsx) or CSV file containing bulk mock questions. Make sure your columns match the expected format (Title, Difficulty, Topic, etc.)
              </p>
              
              <input type="file" accept=".csv,.xlsx,.xls" id="csv-upload" className="hidden" onChange={handleFileChange} />
              <label 
                htmlFor="csv-upload"
                className="px-8 py-3.5 bg-brand-primary text-white font-bold rounded-xl cursor-pointer hover:bg-brand-secondary shadow-lg shadow-brand-primary/30 transition-all hover:-translate-y-0.5"
              >
                Select Excel/CSV File
              </label>

              <div className="mt-8 flex items-start gap-3 text-sm text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-200/50 max-w-md">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="font-medium">Ensure your file has columns like: Title, Difficulty, Topic, Time Limit, Problem Statement, Constraints, etc.</p>
              </div>
            </div>
          ) : (
            <form id="challenge-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 1: General Info */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={18} className="text-brand-primary" />
                  <h4 className="font-bold text-slate-800">General Information</h4>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Problem Name (Title)</label>
                  <input
                    required
                    type="text"
                    className="w-full px-5 py-3 text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all placeholder:font-normal"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Two Sum"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Problem Description</label>
                  <textarea
                    required
                    rows={6}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary resize-y font-mono text-sm transition-all leading-relaxed"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Write the full problem description here (Markdown supported)..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column: Metadata & Settings */}
                <div className="space-y-8">
                  
                  {/* Basic Settings */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings size={18} className="text-brand-primary" />
                      <h4 className="font-bold text-slate-800">Metadata & Configuration</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category / Topic</label>
                        <input
                          required
                          type="text"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          placeholder="e.g. Arrays"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Difficulty</label>
                        <select
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all cursor-pointer"
                          value={formData.difficulty}
                          onChange={e => {
                            const diff = e.target.value as Difficulty;
                            const autoPoints = diff === 'Easy' ? 2 : diff === 'Hard' ? 10 : 5;
                            setFormData({ ...formData, difficulty: diff, points: autoPoints });
                          }}
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Points</label>
                        <input
                          required
                          type="number"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                          value={formData.points}
                          onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      {!isPracticeMode && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Track ID</label>
                          <input
                            required
                            type="text"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                            value={formData.track}
                            onChange={e => setFormData({ ...formData, track: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Companies (Comma-separated)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                        value={formData.companiesText}
                        onChange={e => setFormData({ ...formData, companiesText: e.target.value })}
                        placeholder="e.g. Google, Amazon, TCS"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time Limit (s)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                          value={formData.timeLimit}
                          onChange={e => setFormData({ ...formData, timeLimit: parseFloat(e.target.value) || 2 })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Memory Limit (MB)</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                          value={formData.memoryLimit}
                          onChange={e => setFormData({ ...formData, memoryLimit: parseInt(e.target.value) || 256 })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Formatting constraints */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal size={18} className="text-brand-primary" />
                      <h4 className="font-bold text-slate-800">Formatting & Constraints</h4>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Input Format</label>
                      <textarea
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-y font-mono transition-all"
                        value={formData.inputFormat}
                        onChange={e => setFormData({ ...formData, inputFormat: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Output Format</label>
                      <textarea
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-y font-mono transition-all"
                        value={formData.outputFormat}
                        onChange={e => setFormData({ ...formData, outputFormat: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Constraints</label>
                      <textarea
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-y font-mono transition-all"
                        value={formData.constraints}
                        onChange={e => setFormData({ ...formData, constraints: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Test Cases */}
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6 h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Code2 size={18} className="text-brand-primary" />
                      <h4 className="font-bold text-slate-800">Test Cases</h4>
                    </div>
                  
                    <div className="space-y-5">
                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <h5 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Sample Case 1</h5>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Input</label>
                            <textarea rows={2} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-brand-primary/20" value={formData.sampleInput1} onChange={e => setFormData({ ...formData, sampleInput1: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Output</label>
                            <textarea rows={2} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-brand-primary/20" value={formData.sampleOutput1} onChange={e => setFormData({ ...formData, sampleOutput1: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Explanation</label>
                          <textarea rows={1} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary/20" value={formData.explanation1} onChange={e => setFormData({ ...formData, explanation1: e.target.value })} />
                        </div>
                      </div>

                      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <h5 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Sample Case 2 (Optional)</h5>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Input</label>
                            <textarea rows={2} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-brand-primary/20" value={formData.sampleInput2} onChange={e => setFormData({ ...formData, sampleInput2: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Output</label>
                            <textarea rows={2} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-brand-primary/20" value={formData.sampleOutput2} onChange={e => setFormData({ ...formData, sampleOutput2: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Explanation</label>
                          <textarea rows={1} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary/20" value={formData.explanation2} onChange={e => setFormData({ ...formData, explanation2: e.target.value })} />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Database size={16} className="text-brand-primary" />
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Hidden Test Cases (JSON format)</label>
                        </div>
                        <textarea
                          rows={4}
                          className="w-full px-4 py-3 bg-slate-900 text-green-400 border border-slate-800 rounded-xl text-xs font-mono focus:ring-2 focus:ring-brand-primary shadow-inner"
                          value={formData.hiddenTestCases}
                          onChange={e => setFormData({ ...formData, hiddenTestCases: e.target.value })}
                          placeholder='[
  { "input": "5", "output": "120" },
  { "input": "0", "output": "1" }
]'
                        />
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Provide hidden test cases as a valid JSON array of objects with "input" and "output" strings.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-8 py-5 border-t border-slate-200 bg-white rounded-b-3xl shrink-0 items-center shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          {activeTab === 'manual' && (
            <button
              type="submit"
              form="challenge-form"
              className="px-8 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/40 hover:-translate-y-0.5 transition-all"
            >
              {initial ? 'Save Changes' : 'Create Question'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
