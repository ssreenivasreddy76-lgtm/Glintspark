import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { firebaseDB } from '../services/firebaseService';
import type { Challenge } from '../types';

export default function CreateChallenge() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    description: '',
    problemStatement: '',
    inputFormat: '',
    constraints: '',
    outputFormat: '',
    tags: '',
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name) {
      alert("Challenge Name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const newChallenge: Challenge = {
        id: `challenge-${Date.now()}`,
        title: form.name,
        description: form.description,
        problemStatement: form.problemStatement,
        inputFormat: form.inputFormat,
        constraints: form.constraints,
        outputFormat: form.outputFormat,
        tags: form.tags,
        contestId: id, // Link to this contest
        difficulty: 'medium', // Default
      };

      await firebaseDB.addChallenge(newChallenge);
      navigate(`/contests/${id}/manage`); // Go back to the contest manage page
    } catch (err) {
      console.error("Failed to save challenge", err);
      alert("Failed to save challenge.");
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Header Breadcrumbs */}
      <div className="bg-[#0e141e] text-white px-8 py-4 text-[13px] flex items-center gap-2 font-semibold">
        <Link to={`/contests/${id}/manage`} className="text-slate-400 hover:text-white transition">Manage Challenges</Link>
        <span className="text-slate-500">&gt;</span>
        <span className="text-white">Create</span>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-[32px] text-slate-700 font-light mb-2">Create Challenge</h1>
            <p className="text-[14px] text-slate-500 italic">
              Get started by providing the initial details needed to create a challenge.
            </p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#0e141e] hover:bg-[#1e2736] text-white text-[14px] font-bold rounded-[3px] transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-8">
          
          {/* Challenge Name */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-6">
            <label className="md:w-48 text-[13px] font-bold text-slate-700 mt-2">Challenge Name</label>
            <div className="flex-1">
              <input 
                type="text" 
                value={form.name} 
                onChange={e => set('name', e.target.value)}
                className="w-full max-w-xl bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-6">
            <label className="md:w-48 text-[13px] font-bold text-slate-700 mt-2">Description</label>
            <div className="flex-1 max-w-3xl">
              <textarea 
                value={form.description} 
                onChange={e => set('description', e.target.value)}
                placeholder="Write a short summary about the challenge"
                rows={2}
                className="w-full bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-[14px] font-mono text-slate-700 focus:outline-none focus:border-brand-primary resize-y"
              />
              <div className="text-right text-[11px] text-slate-500 mt-1">
                Characters left: {Math.max(0, 140 - form.description.length)}
              </div>
            </div>
          </div>

          {/* Rich Text Areas */}
          {[
            { label: 'Problem Statement', key: 'problemStatement' },
            { label: 'Input Format', key: 'inputFormat' },
            { label: 'Constraints', key: 'constraints' },
            { label: 'Output Format', key: 'outputFormat' },
          ].map(field => (
            <div key={field.key} className="flex flex-col md:flex-row gap-2 md:gap-6">
              <label className="md:w-48 text-[13px] font-bold text-slate-700 mt-2">{field.label}</label>
              <div className="flex-1 max-w-3xl border border-slate-300 rounded-[3px] bg-white overflow-hidden shadow-sm">
                {/* Fake toolbar */}
                <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-between">
                  <div className="flex gap-4 text-slate-400">
                    <span className="font-serif font-bold text-[14px] hover:text-slate-600 cursor-pointer">B</span>
                    <span className="italic font-serif text-[14px] hover:text-slate-600 cursor-pointer">i</span>
                    <span className="text-[14px] hover:text-slate-600 cursor-pointer">☰</span>
                    <span className="text-[14px] hover:text-slate-600 cursor-pointer">☷</span>
                    <span className="text-[14px] hover:text-slate-600 cursor-pointer">🖼</span>
                    <span className="text-[14px] hover:text-slate-600 cursor-pointer">🔗</span>
                    <span className="text-[14px] hover:text-slate-600 cursor-pointer">&lt;/&gt;</span>
                  </div>
                  <button className="px-3 py-1 bg-slate-200 text-slate-600 text-[11px] font-bold rounded">
                    Preview
                  </button>
                </div>
                {/* Text Area */}
                <div className="flex">
                  <div className="w-8 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-2 text-[12px] text-slate-400 select-none">
                    1
                  </div>
                  <textarea
                    value={(form as any)[field.key]}
                    onChange={e => set(field.key, e.target.value)}
                    rows={4}
                    className="flex-1 w-full p-3 text-[13px] font-mono text-slate-700 focus:outline-none resize-y"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Tags */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-6">
            <label className="md:w-48 text-[13px] font-bold text-slate-700 mt-2">Tags</label>
            <div className="flex-1 max-w-3xl">
              <textarea 
                value={form.tags} 
                onChange={e => set('tags', e.target.value)}
                placeholder="add a tag"
                rows={3}
                className="w-full bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary resize-none"
              />
            </div>
          </div>

        </div>
        
        {/* Footer Links (matches Manage Contest) */}
        <div className="mt-20 pt-6 border-t border-slate-200 flex flex-wrap justify-center gap-x-2 text-[13px] text-[#4a90e2]">
          <Link to="#" className="hover:underline">Interview Prep</Link> <span className="text-slate-300">|</span>
          <Link to="#" className="hover:underline">Blog</Link> <span className="text-slate-300">|</span>
          <Link to="#" className="hover:underline">Scoring</Link> <span className="text-slate-300">|</span>
          <Link to="#" className="hover:underline">Environment</Link> <span className="text-slate-300">|</span>
          <Link to="#" className="hover:underline">FAQ</Link> <span className="text-slate-300">|</span>
          <Link to="#" className="hover:underline">About Us</Link> <span className="text-slate-300">|</span>
          <Link to="#" className="hover:underline">Support</Link> <span className="text-slate-300">|</span>
          <Link to="#" className="hover:underline">Careers</Link> <span className="text-slate-300">|</span>
          <Link to="#" className="hover:underline">Terms Of Service</Link> <span className="text-slate-300">|</span>
          <Link to="#" className="hover:underline">Privacy Policy</Link>
        </div>

      </div>
    </div>
  );
}
