import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { firebaseDB, firebaseAuth } from '../services/firebaseService';
import { HelpCircle, Upload, Check } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function ManageContest() {
  const { id } = useParams();
  const [contest, setContest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Details');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newModerator, setNewModerator] = useState('');
  const [moderators, setModerators] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const filteredUsers = newModerator ? allUsers.filter(u => u.toLowerCase().includes(newModerator.toLowerCase()) && !moderators.includes(u) && u !== firebaseAuth?.currentUser?.email && u !== firebaseAuth?.currentUser?.displayName) : [];

  // Form State
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    noEndTime: false,
    orgType: '',
    orgName: '',
    tagline: '',
    description: '',
    prizes: '',
    rules: '',
    scoring: '',
    useAsOpenGraph: false,
  });

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    async function fetchContest() {
      const contests = await firebaseDB.getContests();
      const found = contests.find(c => c.id === id || c.id.toString() === id);
      if (found) {
        setContest(found);
        
        let sDate = '';
        let sTime = '';
        if (found.date) {
          const parts = found.date.split(' ');
          if (parts.length >= 2) {
            sDate = parts[0];
            sTime = parts[1];
          }
        }
        
        let eDate = '';
        let eTime = '';
        if (found.date && found.duration && found.duration !== 999999) {
          const startMs = new Date(found.date).getTime();
          const endMs = startMs + (found.duration * 60000);
          const endD = new Date(endMs);
          eDate = endD.toISOString().split('T')[0];
          
          const hours = endD.getHours().toString().padStart(2, '0');
          const mins = endD.getMinutes().toString().padStart(2, '0');
          eTime = `${hours}:${mins}`;
        }

        setForm({
          name: found.title || '',
          startDate: sDate,
          startTime: sTime,
          endDate: eDate,
          endTime: eTime,
          noEndTime: found.noEndTime || false,
          orgType: found.type || '',
          orgName: found.organizationName || '',
          tagline: found.tagline || '',
          description: found.description || '',
          prizes: found.prizes || '',
          rules: found.rules || '',
          scoring: found.scoring || '',
          useAsOpenGraph: found.useAsOpenGraph || false,
        });
      }

      const usersData = await firebaseDB.getUsersData();
      const userNames = usersData.map(u => u.displayName || u.email || u.id).filter(Boolean);
      setAllUsers(userNames);
      setRegisteredUsers(usersData);
    }
    fetchContest();
  }, [id]);

  const handleSave = async () => {
    if (!contest) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const startMs = new Date(`${form.startDate}T${form.startTime}`).getTime();
    let durationMins = 0;
    
    if (form.noEndTime) {
      durationMins = 999999;
    } else if (form.endDate && form.endTime) {
      const endMs = new Date(`${form.endDate}T${form.endTime}`).getTime();
      durationMins = Math.max(0, Math.floor((endMs - startMs) / 60000));
    }

    const updates = {
      title: form.name,
      date: `${form.startDate} ${form.startTime}`,
      duration: durationMins,
      type: form.orgType,
      organizationName: form.orgName,
      noEndTime: form.noEndTime,
      tagline: form.tagline,
      description: form.description,
      prizes: form.prizes,
      rules: form.rules,
      scoring: form.scoring,
      useAsOpenGraph: form.useAsOpenGraph,
    };

    try {
      await firebaseDB.updateContest(contest.id.toString(), updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update contest:", err);
    }
    setIsSaving(false);
  };

  const tabs = ['Details', 'Challenges', 'Moderators', 'Signups', 'Statistics'];

  if (!contest) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Header Breadcrumbs */}
      <div className="bg-[#0e141e] text-white px-8 py-4 text-[13px] flex items-center gap-2 font-semibold">
        <Link to="/contests" className="text-slate-400 hover:text-white transition">Manage Contests</Link>
        <span className="text-slate-500">&gt;</span>
        <span className="text-white">{contest.title || id}</span>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">
        
        {/* Title and URL */}
        <div className="mb-8">
          <h1 className="text-[32px] text-slate-700 font-light mb-1">{contest.title || id}</h1>
          <a href={`/contests/${contest.id}`} className="text-[13px] text-[#4a90e2] hover:underline">
            www.glintspark.in/contests/{contest.id}
          </a>
        </div>

        {/* Tabs */}
        <div className="flex border border-slate-200 bg-slate-50 rounded-sm overflow-x-auto text-[13px] font-bold text-slate-500">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 transition-colors whitespace-nowrap border-r border-slate-200 last:border-0 ${
                activeTab === tab ? 'bg-white text-[#0e141e] border-b-2 border-b-transparent shadow-[0_2px_0_0_#fff]' : 'hover:bg-slate-100'
              }`}
              style={activeTab === tab ? { boxShadow: 'inset 0 3px 0 0 transparent' } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Global Action Buttons Row (Sticky) */}
        <div className="sticky top-[56px] z-40 bg-white backdrop-blur-sm shadow-sm border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 py-4 px-4 -mx-4 mb-10">
          <div className="flex gap-2">
            <Link to={`/contests/${id}/landing`} target="_blank" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[13px] font-bold rounded-[3px] transition-colors border border-slate-200 flex items-center">
              Preview Landing Page
            </Link>
            <Link to={`/contests/${id}/challenges`} target="_blank" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[13px] font-bold rounded-[3px] transition-colors border border-slate-200 flex items-center">
              Preview Challenges Page
            </Link>
          </div>
          <div className="text-[13px] text-slate-600 font-medium hidden md:block">
            Contest URL is now publicly accessible.
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[13px] font-bold rounded-[3px] transition-colors">
              Unpublish
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-[#0e141e] hover:bg-[#1e2736] text-white text-[13px] font-bold rounded-[3px] transition-colors flex items-center gap-2 min-w-[120px] justify-center"
            >
              {isSaving ? 'Saving...' : saveSuccess ? <><Check size={16}/> Saved</> : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'Details' && (
          <div className="max-w-3xl">
            
            <h2 className="text-[20px] font-bold text-slate-800 mb-2">Contest Details</h2>
            <p className="text-[14px] text-slate-500 italic mb-8">
              Customize your contest by providing more information needed to create your landing page. Your contest will only be available to those who have access to the contest URL.
            </p>

            <div className="space-y-6">
              {/* Contest Name */}
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <label className="md:w-48 text-[14px] font-bold text-slate-700">Contest Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => set('name', e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Global Action Buttons Moved */}

              {/* Start Time */}
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <label className="md:w-48 text-[14px] font-bold text-slate-700">Start Time <span className="text-rose-500">*</span></label>
                <div className="flex-1 flex items-center gap-3">
                  <input 
                    type="date" 
                    value={form.startDate} 
                    onChange={e => set('startDate', e.target.value)}
                    className="w-36 bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary"
                  />
                  <span className="text-slate-600 text-[14px]">at</span>
                  <input 
                    type="time" 
                    value={form.startTime} 
                    onChange={e => set('startTime', e.target.value)}
                    className="w-28 bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary"
                  />
                  <span className="text-slate-600 text-[14px] flex items-center gap-1.5 font-bold">
                    IST <HelpCircle size={14} className="text-slate-400 cursor-help" />
                  </span>
                </div>
              </div>

              {/* End Time */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-6">
                <label className="md:w-48 text-[14px] font-bold text-slate-700 mt-2">End Time <span className="text-rose-500">*</span></label>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <input 
                      type="date" 
                      disabled={form.noEndTime}
                      value={form.endDate} 
                      onChange={e => set('endDate', e.target.value)}
                      className="w-36 bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <span className="text-slate-600 text-[14px]">at</span>
                    <input 
                      type="time" 
                      disabled={form.noEndTime}
                      value={form.endTime} 
                      onChange={e => set('endTime', e.target.value)}
                      className="w-28 bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <span className="text-slate-600 text-[14px] flex items-center gap-1.5 font-bold">
                      IST <HelpCircle size={14} className="text-slate-400 cursor-help" />
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer w-fit select-none">
                    <input 
                      type="checkbox" 
                      checked={form.noEndTime}
                      onChange={e => set('noEndTime', e.target.checked)}
                      className="w-3.5 h-3.5 rounded-sm border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                    />
                    This contest has no end time.
                  </label>
                </div>
              </div>

              {/* Organization Type */}
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <label className="md:w-48 text-[14px] font-bold text-slate-700">Organization Type <span className="text-rose-500">*</span></label>
                <select 
                  value={form.orgType} 
                  onChange={e => set('orgType', e.target.value)}
                  className="w-64 bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary"
                >
                  <option value=""></option>
                  <option value="Company">Company</option>
                  <option value="School">School</option>
                  <option value="Non Profit">Non Profit</option>
                  <option value="Bootcamp">Bootcamp</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Organization Name */}
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 mb-12">
                <label className="md:w-48 text-[14px] font-bold text-slate-700">Organization Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={form.orgName} 
                  onChange={e => set('orgName', e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-[3px] px-3 py-2 text-[14px] text-slate-700 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="border-t border-slate-200 pt-12 pb-4">
                <h2 className="text-[20px] font-bold text-slate-800 mb-2">Landing Page Customization</h2>
                <p className="text-[14px] text-slate-500 italic mb-8">
                  Fill out this information to customize your contest landing page.
                </p>
              </div>

              {/* Rich Text Placeholders */}
              {[
                { label: 'Description', key: 'description', placeholder: 'Please provide a short description of your contest here! This will also be used as metadata.' },
                { label: 'Prizes', key: 'prizes', placeholder: '- Prizes are optional. You may add any prizes that you would like to offer here.' },
                { label: 'Rules', key: 'rules', placeholder: '- Please provide any rules for your contest here.' },
                { label: 'Scoring', key: 'scoring', placeholder: "- Each challenge has a pre-determined score.\n- A participant's score depends on the number of test cases a participant's code submission successfully passes.\n- If a participant submits more than one solution per challenge, then the participant's score will reflect the highest score achieved. In a game challenge, the participant's score will reflect the last code submission.\n- Participants are ranked by score. If two or more participants achieve the same score, then the tie is broken by the total time taken to submit the last solution resulting in a higher score." }
              ].map(field => (
                <div key={field.key} className="flex flex-col md:flex-row gap-2 md:gap-6 pt-4">
                  <label className="md:w-48 text-[13px] font-bold text-slate-700 mt-2">{field.label}</label>
                  <div className="flex-1 bg-white rounded-[3px] shadow-sm mb-4">
                    <style>
                      {`
                        .quill-custom .ql-container {
                          min-height: 150px;
                          font-family: inherit;
                        }
                        .quill-custom .ql-editor {
                          min-height: 150px;
                          font-size: 14px;
                        }
                      `}
                    </style>
                    <ReactQuill 
                      theme="snow"
                      value={(form as any)[field.key] || ''}
                      onChange={(val) => set(field.key, val)}
                      placeholder={field.placeholder}
                      className="quill-custom"
                    />
                  </div>
                </div>
              ))}

            </div>
          </div>
        )}

        {activeTab === 'Challenges' && (
          <div className="max-w-4xl pb-10">
            <h2 className="text-[20px] font-bold text-slate-800 mb-2">Contest Challenges</h2>
            <p className="text-[14px] text-slate-500 italic mb-6 leading-relaxed max-w-3xl">
              Add challenges to your contest by selecting challenges from our library or create and add your own challenges <Link to={`/contests/${id}/challenges/create`} className="text-[#4a90e2] hover:underline">here</Link>. To reorder your challenges, simply select the challenge and then drag and drop to the desired location.
            </p>
            
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[13px] font-bold rounded-[3px] transition-colors mb-6 shadow-sm border border-slate-200">
              Add Challenge
            </button>

            <div className="border border-slate-200 rounded-sm py-8 flex items-center justify-center bg-white text-[14px] text-slate-500 italic shadow-sm mb-12">
              No challenges have been added yet.
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-slate-100">
              <div className="flex gap-2">
                <Link to={`/contests/${id}/landing`} target="_blank" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[13px] font-bold rounded-[3px] transition-colors border border-slate-200 flex items-center">
                  Preview Landing Page
                </Link>
                <Link to={`/contests/${id}/challenges`} target="_blank" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[13px] font-bold rounded-[3px] transition-colors border border-slate-200 flex items-center">
                  Preview Challenges Page
                </Link>
              </div>
              <div className="text-[13px] text-slate-600 font-medium">
                Contest URL is now publicly accessible.
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[13px] font-bold rounded-[3px] transition-colors">
                  Unpublish
                </button>
                <button className="px-6 py-2 bg-[#0e141e] hover:bg-[#1e2736] text-white text-[13px] font-bold rounded-[3px] transition-colors min-w-[120px] justify-center">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Moderators' && (
          <div className="max-w-4xl pb-10">
            <h2 className="text-[20px] font-medium text-slate-800 mb-1">Modify Existing Moderators</h2>
            <p className="text-[13px] text-slate-500 italic mb-8">
              Users with moderator access can edit your contest.
            </p>

            <div className="flex flex-col gap-6 max-w-2xl">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <span className="text-[13px] font-bold text-slate-700 w-40 flex-shrink-0">Add Moderators</span>
                <div className="flex flex-1 relative">
                  <input 
                    type="text" 
                    value={newModerator}
                    onChange={(e) => { setNewModerator(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-l-md text-[13px] focus:outline-none focus:border-brand-primary"
                    placeholder="Search users..."
                  />
                  {showDropdown && filteredUsers.length > 0 && (
                    <div className="absolute top-full left-0 right-[76px] mt-1 bg-white border border-slate-200 shadow-lg rounded-sm z-10 max-h-40 overflow-y-auto">
                       {filteredUsers.map(u => (
                         <div 
                           key={u} 
                           className="px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-100 cursor-pointer"
                           onClick={() => { setNewModerator(u); setShowDropdown(false); }}
                         >
                           {u}
                         </div>
                       ))}
                    </div>
                  )}
                  <button 
                    onClick={() => { 
                      if(newModerator) { 
                        if(!moderators.includes(newModerator)) {
                          setModerators([...moderators, newModerator]); 
                        }
                        setNewModerator(''); 
                      } 
                    }}
                    className="px-6 py-2 bg-slate-100 hover:bg-slate-200 border border-l-0 border-slate-300 rounded-r-md text-slate-600 text-[13px] font-bold transition-colors">
                    Add
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-2">
                <span className="text-[13px] font-bold text-slate-700 w-40 flex-shrink-0">Current Moderators</span>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-[14px] text-slate-700">
                        {contest?.createdBy || firebaseAuth?.currentUser?.displayName || firebaseAuth?.currentUser?.email || 'Contest Creator'}
                      </div>
                      <div className="text-[12px] text-slate-500">owner</div>
                    </div>
                  </div>
                  {moderators.map((mod, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-[14px] text-slate-700">{mod}</div>
                          <div className="text-[12px] text-slate-500">moderator</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setModerators(moderators.filter(m => m !== mod))}
                        className="text-[13px] text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove moderator"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Signups' && (
          <div className="max-w-5xl pb-10">
            <div className="border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-4 text-[13px] font-bold text-slate-700 w-24">No.</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-slate-700">Username</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-slate-700">Signup Date</th>
                    <th className="px-6 py-4 text-[13px] font-bold text-slate-700 flex items-center gap-1">
                      Login Time <HelpCircle size={14} className="text-slate-400" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registeredUsers.length === 0 ? (
                    <tr className="border-b border-slate-100">
                      <td colSpan={4} className="px-6 py-8 text-center text-[14px] text-slate-500 italic">No signups yet.</td>
                    </tr>
                  ) : (
                    registeredUsers.map((user, idx) => {
                      const username = user.displayName || user.email || user.id;
                      const dateObj = user.createdAt ? new Date(user.createdAt.seconds ? user.createdAt.seconds * 1000 : user.createdAt) : new Date();
                      const dateString = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' IST';
                      
                      const loginObj = user.lastLoginAt ? new Date(user.lastLoginAt.seconds ? user.lastLoginAt.seconds * 1000 : user.lastLoginAt) : dateObj;
                      const loginString = loginObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + loginObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' IST';

                      return (
                        <tr key={user.id || idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-[14px] text-slate-600">{idx + 1} .</td>
                          <td className="px-6 py-4 text-[14px] text-[#4a90e2] hover:underline cursor-pointer">{username}</td>
                          <td className="px-6 py-4 text-[14px] text-slate-600">{dateString}</td>
                          <td className="px-6 py-4 text-[14px] text-slate-600">{loginString}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Statistics' && (
          <div className="max-w-4xl pb-10">
            <div className="flex flex-col gap-2 text-[14px] text-slate-700 font-bold max-w-2xl">
              <div className="flex">
                <div className="w-[300px]">Signup Count:</div>
                <div className="font-normal">{registeredUsers.length}</div>
              </div>
              <div className="flex">
                <div className="w-[300px]">Total Cumulative Signups:</div>
                <div className="font-normal">{registeredUsers.length} <span className="text-slate-500">(includes signups after the end of the contest)</span></div>
              </div>
              <div className="flex">
                <div className="w-[300px]">Login Count:</div>
                <div className="font-normal">{registeredUsers.filter(u => u.lastLoginAt).length || 0}</div>
              </div>
              <div className="flex">
                <div className="w-[300px]">Login Conversion Rate:</div>
                <div className="font-normal">
                  {registeredUsers.length > 0 
                    ? (((registeredUsers.filter(u => u.lastLoginAt).length || 0) / registeredUsers.length) * 100).toFixed(2) 
                    : '0.00'} %
                </div>
              </div>
              <div className="flex">
                <div className="w-[300px]">Number of Users Who Submitted Code:</div>
                <div className="font-normal">0</div>
              </div>
            </div>

            <button className="mt-8 px-4 py-2 bg-[#0e141e] hover:bg-[#1e2736] text-white text-[14px] font-bold rounded-[3px] transition-colors">
              View all contest submissions
            </button>

            {/* Statistics specific action bar removed */}
          </div>
        )}

        {activeTab !== 'Details' && activeTab !== 'Challenges' && activeTab !== 'Moderators' && activeTab !== 'Signups' && activeTab !== 'Statistics' && (
          <div className="py-20 text-center text-slate-500">
            <h3 className="text-xl font-light mb-2">{activeTab}</h3>
            <p className="text-sm">This section is currently under construction.</p>
          </div>
        )}


      </div>
    </div>
  );
}
