import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';
import { Key, Upload, LogOut, CheckCircle2, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import Papa from 'papaparse';

export default function MasterAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [newKey, setNewKey] = useState('');
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  useEffect(() => {
    // Basic secondary guard
    const isMasterAdmin = user?.email === 'glintsparkfounder@founder' || user?.email === 'glintsparkfounder@founder.com';
    if (!user || !isMasterAdmin) {
      navigate('/dashboard');
      return;
    }
    
    fetchApiKeys();
  }, [user, navigate]);

  const fetchApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const { data, error } = await supabase
        .from('admin_config')
        .select('gemini_api_keys')
        .eq('id', 'global')
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching keys:", error);
      }
      
      if (data && data.gemini_api_keys) {
        setApiKeys(data.gemini_api_keys);
      } else {
        // Create the global record if it doesn't exist
        await supabase.from('admin_config').insert({ id: 'global', gemini_api_keys: [] });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const handleAddKey = async () => {
    if (!newKey.trim()) return;
    const updatedKeys = [...apiKeys, newKey.trim()];
    
    try {
      const { error } = await supabase
        .from('admin_config')
        .update({ gemini_api_keys: updatedKeys })
        .eq('id', 'global');
        
      if (error) throw error;
      setApiKeys(updatedKeys);
      setNewKey('');
    } catch (error) {
      console.error("Error adding key:", error);
      alert("Failed to save key.");
    }
  };

  const handleRemoveKey = async (indexToRemove: number) => {
    const updatedKeys = apiKeys.filter((_, idx) => idx !== indexToRemove);
    try {
      const { error } = await supabase
        .from('admin_config')
        .update({ gemini_api_keys: updatedKeys })
        .eq('id', 'global');
        
      if (error) throw error;
      setApiKeys(updatedKeys);
    } catch (error) {
      console.error("Error removing key:", error);
      alert("Failed to remove key.");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus({ type: null, message: 'Processing file...' });
    setIsUploading(true);

    // Check if JSON
    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          await uploadToSupabase(Array.isArray(json) ? json : [json]);
        } catch (error) {
          setUploadStatus({ type: 'error', message: 'Failed to parse JSON file.' });
          setIsUploading(false);
        }
      };
      reader.readAsText(file);
    } 
    // Check if CSV
    else if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await uploadToSupabase(results.data);
        },
        error: (error) => {
          setUploadStatus({ type: 'error', message: `CSV Parsing Error: ${error.message}` });
          setIsUploading(false);
        }
      });
    } else {
      setUploadStatus({ type: 'error', message: 'Unsupported file format. Please upload CSV or JSON.' });
      setIsUploading(false);
    }
  };

  const uploadToSupabase = async (data: any[]) => {
    if (data.length === 0) {
      setUploadStatus({ type: 'error', message: 'The file is empty.' });
      setIsUploading(false);
      return;
    }

    try {
      // Map your file's specific columns to our Supabase schema
      const formattedData = data.map(item => ({
        question: item.question || item.Question || item.q || '',
        options: item.options || item.Options ? (typeof item.options === 'string' ? JSON.parse(item.options) : item.options) : null,
        correct_answer: item.correct_answer || item.answer || item.Answer || item.correct || '',
        difficulty: item.difficulty || item.Difficulty || 'Medium',
        category: item.category || item.Category || 'General',
        explanation: item.explanation || item.Explanation || ''
      })).filter(item => item.question); // Filter out rows without a question

      const { error } = await supabase
        .from('interview_questions')
        .insert(formattedData);

      if (error) throw error;

      setUploadStatus({ type: 'success', message: `Successfully uploaded ${formattedData.length} questions to the database!` });
    } catch (error: any) {
      console.error(error);
      setUploadStatus({ type: 'error', message: `Database error: ${error.message}` });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200">
      {/* Top Navbar */}
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-indigo-500" />
          <h1 className="text-xl font-bold text-white">Master Admin Console</h1>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" /> Exit Console
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Left Column: API Keys */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Gemini API Keys</h2>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Add multiple free Gemini API keys here. The Mock Interview engine will automatically rotate through these keys to bypass rate limits.
          </p>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Paste new API key here..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button 
              onClick={handleAddKey}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Key
            </button>
          </div>

          <div className="space-y-3">
            {isLoadingKeys ? (
              <p className="text-slate-500 text-sm">Loading keys...</p>
            ) : apiKeys.length === 0 ? (
              <p className="text-slate-500 text-sm italic">No API keys found. The AI will not function until keys are added.</p>
            ) : (
              apiKeys.map((key, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">Key {idx + 1}</span>
                    <span className="text-sm font-mono text-slate-300">
                      {key.slice(0, 8)}...{key.slice(-4)}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveKey(idx)}
                    className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Question Bank */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Upload Question Bank</h2>
          </div>
          <p className="text-slate-400 text-sm mb-6">
            Upload your CSV or JSON file containing the 555 Mock Interview questions. The system will automatically parse them and inject them into the database.
          </p>

          <label className={`block w-full border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer transition-colors ${isUploading ? 'bg-slate-800/50 cursor-not-allowed' : 'hover:border-indigo-500 hover:bg-slate-800/30'}`}>
            <input 
              type="file" 
              accept=".csv,.json"
              className="hidden" 
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <div className="flex flex-col items-center gap-3">
              <Upload className={`w-8 h-8 ${isUploading ? 'text-slate-500' : 'text-indigo-400'}`} />
              <span className="text-sm font-medium text-slate-300">
                {isUploading ? 'Processing File...' : 'Click or Drag CSV/JSON here to upload'}
              </span>
            </div>
          </label>

          {uploadStatus.message && (
            <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${uploadStatus.type === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              {uploadStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <p className={`text-sm ${uploadStatus.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                {uploadStatus.message}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
