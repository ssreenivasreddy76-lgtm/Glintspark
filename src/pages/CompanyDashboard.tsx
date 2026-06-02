import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import { motion } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

// Simple Company Dashboard for managing practice tracks and challenges
// NOTE: The actual backend tables are not defined yet – this component provides UI placeholders.

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<Array<any>>([]);
  const [newTrackName, setNewTrackName] = useState('');

  // Fetch user role from Supabase profile (assumes a `role` column exists)
  useEffect(() => {
    async function fetchRole() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', userData.user.id)
            .single();
          if (error) {
            console.error('Failed to fetch role', error);
            // Fallback to company role for development
            setUserRole('company');
          } else {
            // Use fetched role or fallback if missing
            setUserRole(data?.role ?? 'company');
          }
        } else {
          // No user data – assume company for dev testing
          setUserRole('company');
        }
      } catch (e) {
        console.error('Unexpected error fetching role', e);
        setUserRole('company');
      } finally {
        setLoading(false);
      }
    }
    fetchRole();
  }, []);

  // Placeholder: load practice tracks from a local constant (could be replaced by a DB call later)
  useEffect(() => {
    // Mock data – in a real app replace with supabase fetch from `practice_tracks` table
    const mockTracks = [
      { id: 'c', name: 'C' },
      { id: 'javascript', name: 'JavaScript' },
      { id: 'python', name: 'Python' },
    ];
    setTracks(mockTracks);
  }, []);

  const handleAddTrack = () => {
    if (!newTrackName.trim()) return;
    const newTrack = { id: newTrackName.toLowerCase(), name: newTrackName };
    // In a real implementation you would INSERT into supabase here.
    setTracks(prev => [...prev, newTrack]);
    setNewTrackName('');
  };

  const handleDeleteTrack = (id: string) => {
    // In a real implementation you would DELETE from supabase here.
    setTracks(prev => prev.filter(t => t.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-68px)] bg-[#f3f7f7]">
        <p className="text-slate-500">Loading dashboard…</p>
      </div>
    );
  }

  /* Role check temporarily removed for development – always show dashboard */


  return (
    <div className="min-h-screen bg-[#f3f7f7] p-8">
      <h1 className="text-3xl font-bold text-[#1e2330] mb-6">Company Dashboard</h1>
      <section className="bg-white p-6 rounded shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-[#39424e] mb-4">Practice Tracks</h2>
        <div className="flex items-center gap-4 mb-4">
          <input
            value={newTrackName}
            onChange={e => setNewTrackName(e.target.value)}
            placeholder="New track name"
            className="border border-slate-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <button
            onClick={handleAddTrack}
            className="flex items-center gap-1 bg-brand-primary text-white px-4 py-1 rounded hover:bg-brand-dark transition"
          >
            <Plus size={16} /> Add Track
          </button>
        </div>
        <ul className="space-y-2">
          {tracks.map(track => (
            <motion.li
              key={track.id}
              className="flex items-center justify-between p-2 border border-slate-200 rounded"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-[#39424e]">{track.name}</span>
              <button
                onClick={() => handleDeleteTrack(track.id)}
                className="text-rose-600 hover:text-rose-800"
              >
                <Trash2 size={18} />
              </button>
            </motion.li>
          ))}
        </ul>
      </section>
      {/* Placeholder for future Challenge management UI */}
      <section className="bg-white p-6 rounded shadow-sm">
        <h2 className="text-xl font-semibold text-[#39424e] mb-4">Challenges Management</h2>
        <p className="text-slate-500">Coming soon – add, edit, delete challenges for your company.</p>
        <div className="mt-4 flex items-center gap-4">
          <button className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-dark transition">
            Add Challenge
          </button>
          <button className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition">
            Delete Challenge
          </button>
        </div>
      </section>
    </div>
  );
}
