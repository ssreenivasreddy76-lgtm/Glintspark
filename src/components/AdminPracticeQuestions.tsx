import React from 'react';
import { useChallenges } from '../contexts/ChallengesContext';
import { Plus, Pencil, Trash2, Upload, Search, Code2 } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

import { ChallengeModal } from './ChallengeModal';

export function AdminPracticeQuestionsInner() {
  const { challenges, addChallenge, updateChallenge, addChallengesBulk, deleteChallenge } = useChallenges();
  const practiceQuestions = (challenges || []).filter(c => c && c.isPractice !== false);
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<any>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadLanguages, setUploadLanguages] = React.useState(['python', 'javascript', 'cpp', 'java', 'c']);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleAdd = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleEdit = (q: any) => {
    alert(`Debug: Editing question "${q.title}". Test cases length: ${q.hiddenTestCases?.length || 0}`);
    setEditingQuestion(q);
    setIsModalOpen(true);
  };

  const handleDelete = (q: any) => {
    if (confirm(`Are you sure you want to delete "${q.title}"?`)) {
      deleteChallenge(q.id);
    }
  };

  const handleSave = async (data: any) => {
    if (editingQuestion) {
      await updateChallenge(editingQuestion.id, data);
    } else {
      await addChallenge({ ...data, id: generateSlug(data.title) });
    }
    setIsModalOpen(false);
  };

  const processRows = async (rows: any[], defaultLanguages: string[]) => {
    let imported = 0;
    const newChallengesToImport: any[] = [];
    
    for (const row of rows) {
      // Helper to find a value using multiple possible keys (case-insensitive)
      const getValue = (keys: string[]) => {
        const key = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
        return key ? row[key] : undefined;
      };

      const title = getValue(['title', 'problem name', 'name', 'problem title', 'question', 'question name', 'question title', 'challenge', 'challenge name']);
      if (!title) continue;
      
      // Prevent duplicates by checking if a question with this title already exists in practice questions
      // or if we already queued it up in this batch
      const cleanTitle = title.toString().trim();
      if (
        practiceQuestions.some(q => q.title.trim().toLowerCase() === cleanTitle.toLowerCase()) ||
        newChallengesToImport.some(q => q.title.trim().toLowerCase() === cleanTitle.toLowerCase())
      ) {
        continue;
      }
      
      const hiddenTestCasesList: {input: string, output: string}[] = [];
      // Support up to 200 individual test case columns (Test Case Input 1, Test Case Output 1, etc.)
      for (let i = 1; i <= 200; i++) {
        const tInput = getValue([`test case input ${i}`, `testcase input ${i}`, `hidden input ${i}`]);
        const tOutput = getValue([`test case output ${i}`, `testcase output ${i}`, `hidden output ${i}`]);
        
        if (tInput !== undefined || tOutput !== undefined) {
          hiddenTestCasesList.push({
            input: tInput !== undefined ? String(tInput) : '',
            output: tOutput !== undefined ? String(tOutput) : ''
          });
        }
      }

      const newChallenge = {
        id: generateSlug(cleanTitle),
        title: cleanTitle,
        category: getValue(['topic', 'category']) || 'Basic',
        difficulty: (getValue(['difficulty', 'level']) || 'Medium') as any,
        points: (() => {
          const raw = getValue(['points', 'score']);
          if (raw) return parseInt(raw);
          const diff = (getValue(['difficulty', 'level']) || 'Medium').toLowerCase().trim();
          return diff === 'easy' ? 2 : diff === 'hard' ? 10 : 5;
        })(),
        successRate: '0%',
        track: 'custom',
        description: getValue(['problem statement', 'description', 'problem description']) || '',
        inputFormat: getValue(['input format', 'input']) || '',
        outputFormat: getValue(['output format', 'output']) || '',
        constraints: getValue(['constraints', 'constraint']) || '',
        timeLimit: parseFloat(getValue(['time limit', 'time limit (s)', 'time']) || '2'),
        memoryLimit: parseInt(getValue(['memory limit', 'memory limit (mb)', 'memory']) || '256'),
        sampleInput1: getValue(['sample input 1', 'input 1', 'sample 1 input']) || '',
        sampleOutput1: getValue(['sample output 1', 'output 1', 'sample 1 output']) || '',
        explanation1: getValue(['explanation 1', 'explanation', 'sample explanation 1', 'test case explanation 1', 'testcase explanation 1']) || '',
        sampleInput2: getValue(['sample input 2', 'input 2', 'sample 2 input']) || '',
        sampleOutput2: getValue(['sample output 2', 'output 2', 'sample 2 output']) || '',
        explanation2: getValue(['explanation 2', 'sample explanation 2', 'test case explanation 2', 'testcase explanation 2']) || '',
        hiddenTestCases: getValue(['hidden test cases', 'hidden tests', 'test cases']) || '',
        hiddenTestCasesList: hiddenTestCasesList,
        testCases: hiddenTestCasesList.map(tc => ({
          input: tc.input,
          output: tc.output,
          isHidden: true
        })),
        allowedLanguages: getValue(['allowed languages', 'languages'])
          ? String(getValue(['allowed languages', 'languages'])).toLowerCase().split(',').map((l: string) => l.trim()) 
          : defaultLanguages,
        isPractice: true
      };
      
      newChallengesToImport.push(newChallenge);
      imported++;
    }
    
    if (newChallengesToImport.length > 0) {
      await addChallengesBulk(newChallengesToImport);
    }
    
    if (imported === 0 && rows.length > 0) {
      alert(`Failed to import: We couldn't find a column for the Problem Name. The columns in your file are: ${Object.keys(rows[0]).join(', ')}`);
    } else {
      alert(`Successfully imported ${imported} questions! (from ${rows.length} rows)`);
    }
  };

  const handleBulkUpload = () => {
    if (!selectedUploadFile || isUploading) return;
    setIsUploading(true);

    const isExcel = selectedUploadFile.name.endsWith('.xlsx') || selectedUploadFile.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        
        const text = new TextDecoder().decode(buffer);
        if (text.trim().startsWith('<') && text.toLowerCase().includes('<html')) {
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const tables = doc.querySelectorAll('table');
            if (tables.length > 0) {
              // Find the largest table (most rows)
              let bestTable = tables[0];
              let maxRows = 0;
              tables.forEach(t => {
                const rows = t.querySelectorAll('tr');
                if (rows.length > maxRows) {
                  maxRows = rows.length;
                  bestTable = t;
                }
              });
              
              const workbook = XLSX.utils.table_to_book(bestTable);
              const worksheet = workbook.Sheets[workbook.SheetNames[0]];
              const rows = XLSX.utils.sheet_to_json(worksheet);
              await processRows(rows, uploadLanguages);
              setIsUploadModalOpen(false);
              setSelectedUploadFile(null);
              setIsUploading(false);
              return;
            } else {
              alert("This file appears to be an HTML webpage, but we couldn't find any data tables inside it!");
              setIsUploading(false);
              return;
            }
          } catch (err) {
            console.error("Failed to parse HTML table", err);
          }
        }

        // Normal Excel parsing
        try {
          const data = new Uint8Array(buffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet);
          await processRows(rows, uploadLanguages);
          setIsUploadModalOpen(false);
          setSelectedUploadFile(null);
          setIsUploading(false);
        } catch (err: any) {
          console.error("Error parsing Excel:", err);
          
          // Fallback to CSV parsing in case it's actually a CSV renamed as .xlsx
          Papa.parse(selectedUploadFile, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
              if (results.errors && results.errors.length > 0) {
                alert(`Failed to parse file. It might be corrupted or unsupported.\nError: ${err.message || 'Unknown format'}`);
                setIsUploading(false);
                return;
              }
              await processRows(results.data, uploadLanguages);
              setIsUploadModalOpen(false);
              setSelectedUploadFile(null);
              setIsUploading(false);
            },
            error: (error) => {
              console.error("Error parsing as CSV fallback:", error);
              alert("Failed to parse file. The file format might be unsupported or corrupted.");
              setIsUploading(false);
            }
          });
        }
      };
      reader.readAsArrayBuffer(selectedUploadFile);
    } else {
      Papa.parse(selectedUploadFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await processRows(results.data as any[], uploadLanguages);
          setIsUploadModalOpen(false);
          setSelectedUploadFile(null);
          setIsUploading(false);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          alert("Failed to parse CSV file.");
          setIsUploading(false);
        }
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full overflow-hidden bg-slate-50/50">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Practice Questions</h2>
          <p className="text-slate-500 font-medium">Manage and organize standalone coding questions.</p>
          <div className="flex gap-2 mt-4">
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-brand-primary/10 rounded-full shadow-sm border border-brand-primary/20 text-xs font-bold text-brand-primary transition-all">
              <span>Total Questions:</span>
              <span className="font-black">{practiceQuestions.length}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-medium focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary w-64 transition-all"
            />
          </div>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            id="practice-csv-upload"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedUploadFile(e.target.files[0]);
                setIsUploadModalOpen(true);
              }
              e.target.value = '';
            }}
          />
          <label 
            htmlFor="practice-csv-upload"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
          >
            <Upload size={18} />
            Import
          </label>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/40 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} />
            Add Question
          </button>
          {practiceQuestions.length > 0 && (
            <button 
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete ALL practice questions? This cannot be undone.')) {
                  // Delete all practice questions from Supabase
                  for (const q of practiceQuestions) {
                    await deleteChallenge(q.id);
                  }
                  alert('All practice questions have been cleared!');
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all"
            >
              <Trash2 size={18} />
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200/60 flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
              <tr className="border-b border-slate-200/80 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Topic / Category</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {practiceQuestions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Code2 size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-lg">No practice questions found.</p>
                    <p className="text-sm mt-1">Click "Add Question" to create your first one.</p>
                  </div>
                </td>
              </tr>
            ) : (
              practiceQuestions.map((q, index) => (
                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-400">
                    {index + 1}.
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-800 group-hover:text-brand-primary transition-colors">{q.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100/80 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                      {q.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm border ${
                      q.difficulty === 'Easy' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                      q.difficulty === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                      'bg-rose-50 border-rose-200 text-rose-600'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">{q.points}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(q); }}
                        className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(q); }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <ChallengeModal
          challenge={editingQuestion}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          isPractice={true}
        />
      )}

      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white  rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 ">Import Questions</h2>
              <button 
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedUploadFile(null);
                }}
                className="text-slate-400 hover:text-slate-600  transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm font-bold text-slate-700  mb-2">Selected File</p>
                <div className="bg-brand-primary/10 text-brand-primary font-mono text-sm px-4 py-2 rounded-lg border border-brand-primary/20">
                  {selectedUploadFile?.name}
                </div>
              </div>


            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 mt-auto">
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setSelectedUploadFile(null);
                }}
                className="px-6 py-2.5 text-sm font-bold text-slate-600  hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={isUploading}
                className="px-6 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-secondary rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Importing...
                  </span>
                ) : (
                  <>
                    <Upload size={18} />
                    Import Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-500 bg-red-50 border border-red-200 rounded-xl m-8">
          <h1 className="text-2xl font-bold mb-4">AdminPracticeQuestions Crashed!</h1>
          <pre className="whitespace-pre-wrap font-mono text-sm">{this.state.error?.toString()}</pre>
          <pre className="whitespace-pre-wrap font-mono text-xs mt-4 text-red-400">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AdminPracticeQuestions() {
  return (
    <ErrorBoundary>
      <AdminPracticeQuestionsInner />
    </ErrorBoundary>
  );
}
