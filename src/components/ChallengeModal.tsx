import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
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
    points: initial?.points || 10,
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

  const AVAILABLE_LANGUAGES = [
    { id: 'python', label: 'Python' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
    { id: 'c', label: 'C' }
  ];

  const handleLanguageToggle = (langId: string) => {
    setFormData(prev => {
      const isSelected = prev.allowedLanguages.includes(langId);
      if (isSelected) {
        return { ...prev, allowedLanguages: prev.allowedLanguages.filter(id => id !== langId) };
      } else {
        return { ...prev, allowedLanguages: [...prev.allowedLanguages, langId] };
      }
    });
  };

  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>(initial ? 'manual' : 'manual');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white  rounded-2xl w-full max-w-4xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 ">
              {initial ? 'Edit Question' : 'Add New Question'}
            </h3>
            <p className="text-sm text-slate-500 ">
              {isPracticeMode ? 'Creating a standalone practice question.' : 'Creating a track-based challenge.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs for Add mode */}
        {!initial && (
          <div className="flex border-b border-slate-100 px-6 pt-4 gap-4 shrink-0">
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'manual' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500  hover:text-slate-700 '
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'bulk' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-slate-500  hover:text-slate-700 '
              }`}
            >
              CSV Bulk Upload
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {activeTab === 'bulk' ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200  rounded-xl bg-slate-50">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Upload size={32} />
              </div>
              <h4 className="text-lg font-bold text-slate-900  mb-2">Upload Questions CSV</h4>
              <p className="text-sm text-slate-500  text-center max-w-md mb-6">
                Upload your CSV file containing the 555 mock questions. The columns should match your spreadsheet (Problem ID, Title, Difficulty, Topic, etc.)
              </p>
              
              <input
                type="file"
                accept=".csv"
                id="csv-upload"
                className="hidden"
                onChange={handleFileChange}
              />
              <label 
                htmlFor="csv-upload"
                className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl cursor-pointer hover:bg-brand-secondary transition-colors"
              >
                Select CSV File
              </label>

              <div className="mt-6 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg max-w-md">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>Ensure your CSV has columns like: Title, Difficulty, Topic, Time Limit, Problem Statement, Constraints, etc.</p>
              </div>
            </div>
          ) : (
            <form id="challenge-form" onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-6">
                
                {/* Full Width Top Section: Title & Description */}
                <div className="space-y-4 border-b border-slate-100 pb-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700  mb-1">Problem Name (Title)</label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 text-lg font-bold border border-slate-200  rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Two Sum"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700  mb-1">Problem Description</label>
                    <textarea
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-200  rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-y font-mono text-sm"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Write the full problem description here (Markdown supported)..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left Column: Metadata & Settings */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-slate-900  uppercase tracking-wider mb-2">Basic Settings</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700  mb-1">Category / Topic</label>
                          <input
                            required
                            type="text"
                            className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            placeholder="e.g. Arrays"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700  mb-1">Difficulty</label>
                          <select
                            className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white "
                            value={formData.difficulty}
                            onChange={e => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700  mb-1">Points</label>
                          <input
                            required
                            type="number"
                            className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                            value={formData.points}
                            onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        {!isPracticeMode && (
                          <div>
                            <label className="block text-xs font-bold text-slate-700  mb-1">Track ID</label>
                            <input
                              required
                              type="text"
                              className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                              value={formData.track}
                              onChange={e => setFormData({ ...formData, track: e.target.value })}
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700  mb-1">Companies (Comma-separated)</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                            value={formData.companiesText}
                            onChange={e => setFormData({ ...formData, companiesText: e.target.value })}
                            placeholder="e.g. Google, Amazon, TCS"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700  mb-1">Time Limit (s)</label>
                          <input
                            type="number"
                            step="0.1"
                            className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                            value={formData.timeLimit}
                            onChange={e => setFormData({ ...formData, timeLimit: parseFloat(e.target.value) || 2 })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700  mb-1">Memory Limit (MB)</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                            value={formData.memoryLimit}
                            onChange={e => setFormData({ ...formData, memoryLimit: parseInt(e.target.value) || 256 })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-black text-slate-900  uppercase tracking-wider">Allowed Languages</h4>
                      <p className="text-xs text-slate-500  mb-2">Select the programming languages users can submit code in.</p>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_LANGUAGES.map(lang => (
                          <button
                            key={lang.id}
                            type="button"
                            onClick={() => handleLanguageToggle(lang.id)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors border ${
                              formData.allowedLanguages.includes(lang.id)
                                ? 'bg-brand-primary text-white border-brand-primary'
                                : 'bg-slate-50 text-slate-500  border-slate-200  hover:border-brand-primary/50'
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-black text-slate-900  uppercase tracking-wider mb-2">Formatting</h4>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-700  mb-1">Input Format</label>
                        <textarea
                          rows={2}
                          className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none font-mono"
                          value={formData.inputFormat}
                          onChange={e => setFormData({ ...formData, inputFormat: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700  mb-1">Output Format</label>
                        <textarea
                          rows={2}
                          className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none font-mono"
                          value={formData.outputFormat}
                          onChange={e => setFormData({ ...formData, outputFormat: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-700  mb-1">Constraints</label>
                        <textarea
                          rows={2}
                          className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none font-mono"
                          value={formData.constraints}
                          onChange={e => setFormData({ ...formData, constraints: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Test Cases */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-900  uppercase tracking-wider mb-2">Test Cases</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700  mb-1">Sample Input 1</label>
                      <textarea rows={2} className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm font-mono" value={formData.sampleInput1} onChange={e => setFormData({ ...formData, sampleInput1: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700  mb-1">Sample Output 1</label>
                      <textarea rows={2} className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm font-mono" value={formData.sampleOutput1} onChange={e => setFormData({ ...formData, sampleOutput1: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700  mb-1">Explanation 1</label>
                    <textarea rows={2} className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm" value={formData.explanation1} onChange={e => setFormData({ ...formData, explanation1: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700  mb-1">Sample Input 2</label>
                      <textarea rows={2} className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm font-mono" value={formData.sampleInput2} onChange={e => setFormData({ ...formData, sampleInput2: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700  mb-1">Sample Output 2</label>
                      <textarea rows={2} className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm font-mono" value={formData.sampleOutput2} onChange={e => setFormData({ ...formData, sampleOutput2: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700  mb-1">Explanation 2</label>
                    <textarea rows={2} className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm" value={formData.explanation2} onChange={e => setFormData({ ...formData, explanation2: e.target.value })} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700  mb-1">Hidden Test Cases (JSON format)</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-200  rounded-lg text-sm font-mono"
                      value={formData.hiddenTestCases}
                      onChange={e => setFormData({ ...formData, hiddenTestCases: e.target.value })}
                      placeholder='e.g. [{"input": "5", "output": "120"}]'
                    />
                  </div>
                </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-slate-600  hover:text-slate-900  transition-colors"
          >
            Cancel
          </button>
          {activeTab === 'manual' && (
            <button
              type="submit"
              form="challenge-form"
              className="px-6 py-2 bg-brand-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-brand-secondary transition-colors"
            >
              {initial ? 'Save Changes' : 'Create Question'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
