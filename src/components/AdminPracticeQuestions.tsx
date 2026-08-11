import React from 'react';
import { useChallenges } from '../contexts/ChallengesContext';
import { Plus, Pencil, Trash2, Upload, Search } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

import { ChallengeModal } from './ChallengeModal';

export function AdminPracticeQuestions() {
  const { challenges, addChallenge, updateChallenge, deleteChallenge } = useChallenges();
  const practiceQuestions = challenges.filter(c => c.isPractice !== false);
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<any>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = React.useState<File | null>(null);
  const [uploadLanguages, setUploadLanguages] = React.useState(['python', 'javascript', 'cpp', 'java', 'c']);

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
      await addChallenge({ ...data, id: Date.now().toString() });
    }
    setIsModalOpen(false);
  };

  const processRows = async (rows: any[], defaultLanguages: string[]) => {
    let imported = 0;
    for (const row of rows) {
      // Helper to find a value using multiple possible keys (case-insensitive)
      const getValue = (keys: string[]) => {
        const key = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
        return key ? row[key] : undefined;
      };

      const title = getValue(['title', 'problem name', 'name', 'problem title', 'question', 'question name', 'question title', 'challenge', 'challenge name']);
      if (!title) continue;
      
      const newChallenge = {
        id: Date.now().toString() + Math.random().toString(36).substring(7),
        title: title,
        category: getValue(['topic', 'category']) || 'Basic',
        difficulty: (getValue(['difficulty', 'level']) || 'Medium') as any,
        points: parseInt(getValue(['points', 'score']) || '10'),
        successRate: '0%',
        track: 'custom',
        description: getValue(['problem statement', 'description', 'problem description']) || '',
        inputFormat: getValue(['input format', 'input']) || '',
        outputFormat: getValue(['output format', 'output']) || '',
        constraints: getValue(['constraints', 'constraint']) || '',
        timeLimit: parseFloat(getValue(['time limit', 'time limit (s)', 'time']) || '2'),
        memoryLimit: parseInt(getValue(['memory limit', 'memory limit (mb)', 'memory']) || '256'),
        sampleInput1: getValue(['sample input 1', 'input 1']) || '',
        sampleOutput1: getValue(['sample output 1', 'output 1']) || '',
        explanation1: getValue(['explanation 1', 'explanation']) || '',
        sampleInput2: getValue(['sample input 2', 'input 2']) || '',
        sampleOutput2: getValue(['sample output 2', 'output 2']) || '',
        explanation2: getValue(['explanation 2']) || '',
        hiddenTestCases: getValue(['hidden test cases', 'hidden tests', 'test cases']) || '',
        allowedLanguages: getValue(['allowed languages', 'languages'])
          ? String(getValue(['allowed languages', 'languages'])).toLowerCase().split(',').map((l: string) => l.trim()) 
          : defaultLanguages,
        isPractice: true
      };
      
      await addChallenge(newChallenge);
      imported++;
    }
    
    if (imported === 0 && rows.length > 0) {
      alert(`Failed to import: We couldn't find a column for the Problem Name. The columns in your file are: ${Object.keys(rows[0]).join(', ')}`);
    } else {
      alert(`Successfully imported ${imported} questions! (from ${rows.length} rows)`);
    }
  };

  const handleBulkUpload = () => {
    if (!selectedUploadFile) return;

    const isExcel = selectedUploadFile.name.endsWith('.xlsx') || selectedUploadFile.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
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
              processRows(rows, uploadLanguages);
              setIsUploadModalOpen(false);
              setSelectedUploadFile(null);
              return;
            } else {
              alert("This file appears to be an HTML webpage, but we couldn't find any data tables inside it!");
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
          processRows(rows, uploadLanguages);
          setIsUploadModalOpen(false);
          setSelectedUploadFile(null);
        } catch (err) {
          console.error("Error parsing Excel:", err);
          alert("Failed to parse Excel file. The file format might be unsupported.");
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
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          alert("Failed to parse CSV file.");
        }
      });
    }
  };

  const languageCounts = practiceQuestions.reduce((acc, q) => {
    (q.allowedLanguages || []).forEach((lang: string) => {
      acc[lang] = (acc[lang] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const languageLabels: Record<string, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    cpp: 'C++',
    java: 'Java',
    c: 'C'
  };

  return (
    <div className="flex-1 flex flex-col p-8 h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 ">Practice Questions Management</h2>
          <p className="text-sm text-slate-500  mb-3">View standalone practice coding questions grouped by topic.</p>
          <div className="flex gap-2">
            {Object.entries(languageLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg text-xs font-bold text-slate-600  border border-slate-200 ">
                <span>{label}:</span>
                <span className="text-brand-primary">{languageCounts[key] || 0}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary w-64"
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
              e.target.value = ''; // Reset to allow uploading same file again
            }}
          />
          <label 
            htmlFor="practice-csv-upload"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700  font-bold rounded-xl shadow-sm hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Upload size={20} />
            Upload File
          </label>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-bold rounded-xl shadow-sm hover:bg-brand-secondary transition-colors"
          >
            <Plus size={20} />
            Add Question
          </button>
        </div>
      </div>

      <div className="bg-white  rounded-2xl shadow-sm border border-slate-200  flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
              <tr className="border-b border-slate-200  text-slate-500  text-[11px] font-black uppercase tracking-wider">
                <th className="px-6 py-4 bg-slate-50">Title</th>
                <th className="px-6 py-4 bg-slate-50">Topic / Category</th>
                <th className="px-6 py-4 bg-slate-50">Difficulty</th>
                <th className="px-6 py-4 bg-slate-50">Languages</th>
                <th className="px-6 py-4 bg-slate-50">Points</th>
                <th className="px-6 py-4 bg-slate-50 text-right">Actions</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {practiceQuestions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 ">
                  No practice questions found. Add some from the Challenges tab.
                </td>
              </tr>
            ) : (
              practiceQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-bold text-slate-900 ">{q.title}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600  px-2.5 py-1 rounded-md text-[12px] font-semibold">
                      {q.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[12px] font-black px-2.5 py-1 rounded uppercase tracking-wider ${
                      q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' :
                      q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(q.allowedLanguages || []).map((lang: string) => (
                        <span key={lang} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500  uppercase">
                          {lang === 'python' ? 'PY' : lang === 'javascript' ? 'JS' : lang === 'cpp' ? 'C++' : lang}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-600 ">{q.points}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(q)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(q)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
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

              <div>
                <p className="text-sm font-bold text-slate-700  mb-3">Allowed Languages (Default)</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'python', label: 'Python' },
                    { id: 'javascript', label: 'JavaScript' },
                    { id: 'cpp', label: 'C++' },
                    { id: 'java', label: 'Java' },
                    { id: 'c', label: 'C' }
                  ].map(lang => (
                    <label 
                      key={lang.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                        uploadLanguages.includes(lang.id) 
                          ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                          : 'border-slate-200  text-slate-500  hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={uploadLanguages.includes(lang.id)}
                        onChange={() => {
                          setUploadLanguages(prev => 
                            prev.includes(lang.id) ? prev.filter(l => l !== lang.id) : [...prev, lang.id]
                          );
                        }}
                        className="hidden"
                      />
                      <span className="text-sm font-bold">{lang.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500  mt-2">
                  This applies if the file doesn't have an "Allowed Languages" column.
                </p>
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
                disabled={uploadLanguages.length === 0}
                className="px-6 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-brand-secondary rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Upload size={18} />
                Import Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
