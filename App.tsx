
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search, Rocket, ChevronRight, ArrowLeft, Play, Clock,
  Youtube as YoutubeIcon, Activity as ActivityIcon, Compass, BookOpen, Bell,
  Sparkles, Heart, X, Zap, Briefcase, Loader2,
  Upload, FileText, CheckCircle2, TrendingUp, Star, Globe, Calendar, Award,
  Info, MapPin, DollarSign, ExternalLink, Target, ShieldAlert, Building2,
  ThumbsUp, ThumbsDown, Check, Trash2, RefreshCw, History, Bookmark,
  Layers, Cpu, Layout
} from 'lucide-react';
import { DOMAINS, getIcon } from './constants';
import { generateRoadmap, analyzeResume, getTechUpdates, getLibraryContent } from './services/gemini';
import Navigation from './components/Navigation';
import ChatWidget from './components/ChatWidget';
import Login from './components/Login';
import RoadmapView from './components/RoadmapView';
import RoadmapDetailModal from './components/RoadmapDetailModal';
import NotesSection from './components/NotesSection';
import LabsSection from './components/LabsSection';
import { useSwipeBack } from './hooks/useSwipeBack';
import { RecentlyViewedItem } from './types';

// Memoized Components to prevent unnecessary re-renders
const DomainCard = React.memo(({ domain, onClick }: { domain: any, onClick: () => void }) => (
  <button onClick={onClick} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-4 active:scale-95 active:border-blue-500 transition-all shadow-sm will-change-transform">
    <div className="w-12 h-12 bg-blue-50 rounded-[1.25rem] flex items-center justify-center">
      {getIcon(domain.icon, 20, "text-blue-600")}
    </div>
    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">{domain.name}</span>
  </button>
));

const RoleCard = React.memo(({ role, onClick }: { role: any, onClick: () => void }) => (
  <button onClick={onClick} className="w-full bg-white p-6 rounded-[1.75rem] border border-slate-100 flex items-center justify-between shadow-sm active:scale-[0.98] text-left group will-change-transform">
    <div>
      <h3 className="font-black text-slate-900 text-[16px] group-active:text-blue-600">{role.name}</h3>
      <p className="text-slate-400 text-[9px] font-black uppercase mt-1 tracking-widest">Industry Track</p>
    </div>
    <ChevronRight className="w-5 h-5 text-slate-300" />
  </button>
));

const App: React.FC = () => {
  const [user, setUser] = useState<any>(() => {
    // Check URL params for auto-login (admin backdoor)
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      return { email: 'admin@edupath.edu', role: 'admin' };
    }

    const saved = localStorage.getItem('edupath_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist user state
  useEffect(() => {
    if (user) {
      localStorage.setItem('edupath_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('edupath_user');
    }
  }, [user]);

  const [currentTab, setCurrentTab] = useState('explore');
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);

  // Resume State
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Updates State
  const [updates, setUpdates] = useState<any>({ news: [], internships: [], hackathons: [] });
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  // Library State
  const [library, setLibrary] = useState<any[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  // Activity State
  const [activity, setActivity] = useState<any>(() => {
    const saved = localStorage.getItem('edupath_activity');
    return saved ? JSON.parse(saved) : {
      savedRoadmaps: [],
      totalScans: 0,
      appliedJobs: [],
      recentlyViewed: []
    };
  });

  // Save activity to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('edupath_activity', JSON.stringify(activity));
  }, [activity]);

  useEffect(() => {
    if (currentTab === 'updates' && updates.news.length === 0) {
      loadUpdates();
    }
  }, [currentTab]);

  const loadUpdates = async () => {
    setLoadingUpdates(true);
    const data = await getTechUpdates();
    setUpdates(data);
    setLoadingUpdates(false);
  };

  const loadLibrary = async () => {
    if (library.length > 0) return;
    setLoadingLibrary(true);
    // Fallback to static if generic fails, effectively self-repairing
    const data = await getLibraryContent();
    setLibrary(data && data.length ? data : []);
    setLoadingLibrary(false);
  };

  useEffect(() => {
    if (currentTab === 'library') loadLibrary();
  }, [currentTab]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | undefined;
    if ('files' in e.target && (e.target as HTMLInputElement).files) {
      file = (e.target as HTMLInputElement).files![0];
    } else if ('dataTransfer' in e && (e as React.DragEvent).dataTransfer.files) {
      file = (e as React.DragEvent).dataTransfer.files[0];
    }

    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const filteredDomains = useMemo(() => {
    return DOMAINS.filter(d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const addToRecentlyViewed = (item: Omit<RecentlyViewedItem, 'timestamp'>) => {
    setActivity((prev: any) => {
      const newItem = { ...item, timestamp: new Date().toISOString() };
      const filtered = prev.recentlyViewed.filter((rv: RecentlyViewedItem) => rv.id !== item.id);
      return {
        ...prev,
        recentlyViewed: [newItem, ...filtered].slice(0, 10)
      };
    });
  };

  const handleRoleSelect = async (role: any) => {
    setSelectedRole(role);
    addToRecentlyViewed({
      id: role.id,
      name: role.name,
      type: 'role',
      domainName: selectedDomain?.name
    });

    setLoadingRoadmap(true);
    const result = await generateRoadmap(role.name, selectedDomain?.name || "Tech");
    setRoadmap(result);
    setLoadingRoadmap(false);

    setActivity((prev: any) => ({
      ...prev,
      savedRoadmaps: [...new Set([...prev.savedRoadmaps, { ...role, domain: selectedDomain?.name }])]
    }));
  };

  const handleDomainSelect = (domain: any) => {
    setSelectedDomain(domain);
    addToRecentlyViewed({ id: domain.id, name: domain.name, type: 'domain' });
  };

  const handleResumeAnalysis = async () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true);
    const results = await analyzeResume(resumeText, DOMAINS);
    setMatchResults(results || []);
    setCurrentMatchIndex(0);
    setAnalyzing(false);
    setActivity((prev: any) => ({ ...prev, totalScans: prev.totalScans + 1 }));
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    // USER REQUESTED: LEFT = Accept/Apply/Save, RIGHT = Reject
    if (direction === 'left') {
      const currentJob = matchResults[currentMatchIndex];
      setActivity((prev: any) => ({
        ...prev,
        appliedJobs: [...prev.appliedJobs, { ...currentJob, id: Date.now().toString() }]
      }));
    }

    if (currentMatchIndex < matchResults.length - 1) {
      setCurrentMatchIndex(prev => prev + 1);
    } else {
      setMatchResults([]);
      setResumeText('');
      setFileName(null);
    }
  };

  const removeAppliedJob = (jobId: string) => {
    setActivity((prev: any) => ({
      ...prev,
      appliedJobs: prev.appliedJobs.filter((j: any) => j.id !== jobId)
    }));
  };

  const openGitHub = (query: string) => {
    // Search GitHub for "awesome lists" or courses related to the query
    const searchUrl = `https://github.com/search?q=${encodeURIComponent(query + " awesome list OR roadmaps OR guide")}&type=repositories`;
    window.open(searchUrl, '_blank');
  };

  const handleAddNote = (note: any) => {
    setActivity((prev: any) => ({
      ...prev,
      notes: [note, ...(prev.notes || [])]
    }));
  };

  const handleDeleteNote = (id: string) => {
    setActivity((prev: any) => ({
      ...prev,
      notes: (prev.notes || []).filter((n: any) => n.id !== id)
    }));
  };

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const handleNodeComplete = (nodeId: string) => {
    // Here you could update the roadmap state to visually mark incomplete/complete
    // For now, it just closes, but the Checklist state is saved in LocalStorage by the Modal
    console.log("Completed Node:", nodeId);
  };

  // --- SWIPE BACK NAVIGATION ---
  // Determines what "back" means based on the current navigation state
  const handleSwipeBack = useCallback(() => {
    if (currentTab !== 'explore') return; // Only works in explore tab
    if (selectedRole) {
      // Level 3 → 2: Roadmap → Role List
      setSelectedRole(null);
      setRoadmap(null);
    } else if (selectedDomain) {
      // Level 2 → 1: Role List → Domain List
      setSelectedDomain(null);
    }
    // Level 1 = root, nothing to swipe back to
  }, [currentTab, selectedRole, selectedDomain]);

  // Enable swipe back only when we're inside a drill-down screen
  const canSwipeBack = currentTab === 'explore' && (!!selectedRole || !!selectedDomain);
  useSwipeBack(handleSwipeBack, canSwipeBack);

  if (!user) return <Login onLogin={(data) => setUser(data)} />;

  const renderContent = () => {
    switch (currentTab) {
      case 'explore':
        if (selectedRole) {
          return (
            <div className="p-5 pb-24 page-transition">
              <button onClick={() => { setSelectedRole(null); setRoadmap(null); }} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6 active:scale-95 transition-transform">
                <ArrowLeft className="w-4 h-4" /> Exit Roadmap
              </button>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2">{selectedRole.name}</h1>
                <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Learning Path • 2026</p>
              </div>

              {loadingRoadmap ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Analyzing skills...</p>
                </div>
              ) : (
                <div className="animate-in fade-in duration-500">
                  <RoadmapView data={roadmap} onNodeClick={handleNodeClick} />
                </div>
              )}

              <RoadmapDetailModal
                node={selectedNode}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onComplete={handleNodeComplete}
              />
            </div >
          );
        }
        if (selectedDomain) {
          return (
            <div className="p-5 pb-24 page-transition">
              <button onClick={() => setSelectedDomain(null)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Domains
              </button>
              <h1 className="text-2xl font-black text-slate-900 mb-6">{selectedDomain.name}</h1>
              <div className="grid gap-3">
                {selectedDomain.roles.map((role: any) => (
                  <RoleCard key={role.id} role={role} onClick={() => handleRoleSelect(role)} />
                ))}
              </div>
            </div>
          );
        }
        return (
          <div className="p-5 pb-24 page-transition">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Frontiers</h1>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Select vertical</p>
            </header>
            <div className="relative mb-8 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" placeholder="Search tech domains..." className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] font-black shadow-sm outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-200 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredDomains.map(d => (
                <DomainCard key={d.id} domain={d} onClick={() => handleDomainSelect(d)} />
              ))}
            </div>
          </div>
        );

      case 'labs':
        return <LabsSection />;

      case 'jobs': // Match Tab
        if (matchResults.length > 0) {
          const match = matchResults[currentMatchIndex];
          return (
            <div className="flex flex-col h-full overflow-hidden p-4 pb-24 animate-in fade-in duration-300">
              <header className="shrink-0 text-center mb-3">
                <h1 className="text-xl font-black text-slate-900 leading-none">Career Swiper</h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="flex gap-1">
                    {matchResults.map((_, idx) => (
                      <div key={idx} className={`h-1 w-4 rounded-full transition-all ${idx === currentMatchIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                </div>
              </header>

              <div className="flex-1 min-h-0 relative mb-4">
                <div className="absolute inset-0 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
                  {/* Decorative Gradient Bar */}
                  <div className="absolute top-0 left-0 w-2 bg-gradient-to-b from-blue-600 to-indigo-600 h-full"></div>

                  {/* Card Header (Sticky) */}
                  <div className="p-5 pb-3 bg-white border-b border-slate-50 flex justify-between items-start shrink-0">
                    <div className="max-w-[70%]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[7px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-full tracking-widest">Protocol Analysis</span>
                      </div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{match.domainName}</h3>
                    </div>
                    <div className="bg-slate-900 text-white p-2.5 rounded-2xl flex flex-col items-center min-w-[55px] shadow-lg shadow-slate-200">
                      <span className="text-xl font-black leading-none">{match.matchScore}</span>
                      <span className="text-[6px] uppercase font-black opacity-40 mt-1">Match Rank</span>
                    </div>
                  </div>

                  {/* Scrollable Content Part - High Priority for Mobile Content */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar touch-pan-y">
                    {/* Visual: Keyword Overlap Density */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                        <Layers className="w-3.5 h-3.5" /> Keyword Density
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {match.keywordOverlap?.map((kw: string, ki: number) => (
                          <span key={ki} className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-full uppercase shadow-sm animate-in zoom-in duration-300" style={{ animationDelay: `${ki * 50}ms` }}>
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Visual: Skills Alignment Bar Chart */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                        <Cpu className="w-3.5 h-3.5" /> Skills DNA
                      </h4>
                      <div className="space-y-3">
                        {match.skillsAlignment?.map((skill: any, si: number) => (
                          <div key={si} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-600">
                              <span>{skill.name}</span>
                              <span>{skill.percentage}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${skill.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-green-50/60 rounded-[1.5rem] border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Star className="w-3 h-3 text-green-600 fill-current" />
                        </div>
                        <h4 className="text-[9px] font-black text-green-700 uppercase tracking-widest">Core Proficiency</h4>
                      </div>
                      <p className="text-green-900 text-[13px] font-bold leading-relaxed">{match.strength}</p>
                    </div>

                    <div className="p-4 bg-red-50/60 rounded-[1.5rem] border border-red-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <ShieldAlert className="w-3 h-3 text-red-600" />
                        </div>
                        <h4 className="text-[9px] font-black text-red-700 uppercase tracking-widest">Growth Opportunity</h4>
                      </div>
                      <p className="text-red-900 text-[13px] font-bold leading-relaxed">{match.gap}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                        <Layout className="w-3.5 h-3.5" /> Recent Job Matches
                      </h4>
                      <div className="grid gap-2">
                        {match.jobs?.length > 0 ? (
                          match.jobs.map((job: any, ji: number) => (
                            <div key={ji} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center hover:border-blue-500 transition-colors cursor-pointer" onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(`${job.title} ${job.company} jobs`)}`, '_blank')}>
                              <div>
                                <h5 className="text-[12px] font-black text-slate-900 leading-tight">{job.title}</h5>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{job.company} • {job.location}</p>
                              </div>
                              <div className="text-right">
                                <span className="block text-[11px] font-black text-green-600">{job.salary}</span>
                                <span className="text-[8px] font-black text-slate-300 uppercase">{job.postedTime}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          match.suggestedRoles?.map((role: string, ri: number) => (
                            <div key={ri} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-[12px] font-black text-slate-700 shadow-sm">
                              {role}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pb-2">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                        <Target className="w-3.5 h-3.5" /> High-Value Targets
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {match.targetCompanies?.map((co: string, ci: number) => (
                          <div key={ci} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[11px] font-black shadow-md shadow-blue-100">
                            {co}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Optimized for Thumb Reach */}
              <div className="flex justify-center items-center gap-8 shrink-0 mb-2 px-4">
                <button
                  onClick={() => handleSwipe('right')}
                  className="w-14 h-14 bg-white border-2 border-slate-100 text-red-500 rounded-full flex items-center justify-center shadow-lg active:scale-90 active:bg-red-50 transition-all group"
                  aria-label="Reject"
                >
                  <X className="w-6 h-6 group-active:rotate-90 transition-transform" />
                </button>

                <button
                  onClick={() => handleSwipe('left')}
                  className="w-20 h-20 bg-blue-600 text-white rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl shadow-blue-200 active:scale-90 active:bg-blue-700 transition-all group"
                  aria-label="Save Job"
                >
                  <ThumbsUp className="w-8 h-8 group-active:-translate-y-1 transition-transform" />
                  <span className="text-[8px] font-black uppercase mt-1 tracking-widest">Accept</span>
                </button>

                <button
                  className="w-14 h-14 bg-white border-2 border-slate-100 text-blue-600 rounded-full flex items-center justify-center shadow-lg active:scale-90 active:bg-blue-50 transition-all"
                  aria-label="More Info"
                >
                  <Sparkles className="w-6 h-6" />
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="p-5 pb-24 page-transition">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Match AI</h1>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Profile Analysis</p>
            </header>

            <div
              className={`bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-6 relative overflow-hidden transition-all ${isDragActive ? 'border-blue-600 bg-blue-50/20' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragActive(false); handleFileUpload(e); }}
            >
              <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e)} className="hidden" accept=".txt,.pdf,.doc,.docx" />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center border-2 border-dashed border-blue-100 rounded-[2rem] p-8 bg-blue-50/10 active:bg-blue-50/30 transition-all"
              >
                {fileName ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 mb-4">
                      <FileText className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-black text-slate-900 text-center max-w-[150px] truncate">{fileName}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFileName(null); setResumeText(''); }}
                      className="mt-4 text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full"
                    >
                      <Trash2 className="w-3 h-3" /> Remove File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-50 mb-4">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-md font-black text-blue-600">Scan Resume</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Tap to upload .PDF / .TXT</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleResumeAnalysis}
              disabled={analyzing || !resumeText.trim()}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.75rem] shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {analyzing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm uppercase">Optimizing Matches...</span>
                </div>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  <span className="text-sm uppercase tracking-widest">Find My Future</span>
                </>
              )}
            </button>
          </div>
        );

      case 'updates':
        return (
          <div className="p-5 pb-24 page-transition">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Pulse</h1>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Industry Feed</p>
              </div>
              <button onClick={loadUpdates} className="w-10 h-10 bg-blue-600 rounded-xl text-white shadow-lg active:scale-90 flex items-center justify-center transition-transform">
                <RefreshCw className={`w-5 h-5 ${loadingUpdates ? 'animate-spin' : ''}`} />
              </button>
            </header>

            {loadingUpdates ? (
              <div className="flex flex-col items-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Updating data...</p>
              </div>
            ) : (
              <div className="space-y-10">
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Mainstream News</h2>
                  </div>
                  <div className="space-y-4">
                    {updates.news?.map((item: any, i: number) => (
                      <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[8px] font-black text-slate-300 uppercase block">{item.timestamp || 'Just now'}</span>
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        </div>
                        <h3 className="text-[15px] font-black text-slate-900 mb-1 leading-tight group-active:text-blue-600">{item.title}</h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-bold opacity-80">{item.summary}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <Briefcase className="w-5 h-5 text-green-600" />
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Hiring Now</h2>
                  </div>
                  <div className="grid gap-3">
                    {updates.internships?.map((item: any, i: number) => (
                      <div key={i} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 flex items-center justify-between shadow-sm active:bg-green-50">
                        <div className="flex-1 pr-4">
                          <p className="text-[9px] font-black text-green-600 uppercase mb-1">{item.company}</p>
                          <h3 className="text-[14px] font-black text-slate-900 leading-tight mb-2">{item.role}</h3>
                          <span className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {item.timestamp || item.deadline}
                          </span>
                        </div>
                        <button onClick={() => window.open(item.link || `https://www.google.com/search?q=${encodeURIComponent(item.company + ' careers ' + item.role)}`, '_blank')} className="bg-slate-900 text-white w-10 h-10 rounded-xl shadow-md flex items-center justify-center">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <Award className="w-5 h-5 text-amber-600" />
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Events</h2>
                  </div>
                  <div className="flex overflow-x-auto gap-4 no-scrollbar -mx-5 px-5 pb-4">
                    {updates.hackathons?.map((item: any, i: number) => (
                      <div key={i} className="min-w-[260px] bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full"></div>
                        <div className="mb-6">
                          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block mb-4">{item.date}</span>
                          <h3 className="text-xl font-black mb-2 leading-tight">{item.name}</h3>
                          <p className="text-slate-400 text-[11px] font-bold leading-relaxed line-clamp-2">{item.theme}</p>
                        </div>
                        <button onClick={() => openGitHub(`${item.name} Hackathon`)} className="bg-white text-slate-900 w-full py-3 rounded-xl font-black text-[10px] active:bg-amber-400 transition-colors uppercase">View Detail</button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        );

      case 'notes':
        return (
          <NotesSection
            notes={activity.notes || []}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        );

      case 'applied': // Activity Tab
        return (
          <div className="p-5 pb-24 page-transition h-full overflow-y-auto no-scrollbar">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Log</h1>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Career Progress</p>
            </header>

            <div className="grid grid-cols-2 gap-3 mb-8 shrink-0">
              <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-lg flex flex-col items-center">
                <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Roadmaps</p>
                <p className="text-3xl font-black">{activity.savedRoadmaps.length}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Saved Jobs</p>
                <p className="text-3xl font-black text-slate-900">{activity.appliedJobs.length}</p>
              </div>
            </div>

            {/* Recently Viewed Section */}
            <section className="mb-10 shrink-0">
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 px-1 flex items-center gap-3">
                <History className="w-5 h-5 text-blue-600" /> Recently Viewed
              </h2>
              {activity.recentlyViewed?.length === 0 ? (
                <p className="text-[10px] text-slate-400 font-bold px-2">No recently viewed items.</p>
              ) : (
                <div className="flex overflow-x-auto gap-4 no-scrollbar -mx-5 px-5 pb-2">
                  {activity.recentlyViewed.map((rv: RecentlyViewedItem) => (
                    <button
                      key={rv.id}
                      onClick={() => {
                        if (rv.type === 'domain') {
                          setSelectedDomain(DOMAINS.find(d => d.id === rv.id));
                          setCurrentTab('explore');
                        } else {
                          // For roles, we'd need more complex logic to jump back,
                          // simpler to just show name and domain
                          alert(`Revisiting: ${rv.name}`);
                        }
                      }}
                      className="min-w-[140px] bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-start active:scale-95 transition-transform"
                    >
                      <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full mb-2 ${rv.type === 'domain' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {rv.type}
                      </span>
                      <h4 className="text-[11px] font-black text-slate-900 leading-tight mb-1 line-clamp-1">{rv.name}</h4>
                      {rv.domainName && <p className="text-[8px] font-bold text-slate-400 uppercase">{rv.domainName}</p>}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Saved Jobs Section */}
            <section className="mb-10">
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 px-1 flex items-center gap-3">
                <Bookmark className="w-5 h-5 text-blue-600" /> Saved Jobs
              </h2>
              {activity.appliedJobs.length === 0 ? (
                <div className="bg-slate-50 p-12 rounded-[2.5rem] flex flex-col items-center border-2 border-dashed border-slate-200">
                  <Briefcase className="w-8 h-8 text-slate-200 mb-3" />
                  <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest text-center">No Saved Jobs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activity.appliedJobs.map((j: any) => (
                    <div key={j.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden animate-in fade-in slide-in-from-left-4">
                      <div className="absolute top-0 right-0 p-4">
                        <button onClick={() => removeAppliedJob(j.id)} className="text-slate-300 hover:text-red-500 active:scale-75 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shadow-sm shrink-0">
                          <ThumbsUp className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 pr-6">
                          <h4 className="font-black text-slate-900 text-[15px] truncate">{j.domainName} Match</h4>
                          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mt-0.5">Score: {j.matchScore}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-slate-500 line-clamp-2 italic">"{j.strength}"</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {j.suggestedRoles?.slice(0, 2).map((role: string, ri: number) => (
                            <span key={ri} className="text-[8px] font-black bg-slate-50 text-slate-400 border border-slate-100 px-2 py-1 rounded-md uppercase">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Generated Roadmaps Section */}
            <section>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 px-1 flex items-center gap-3">
                <Rocket className="w-5 h-5 text-blue-600" /> Active Roadmaps
              </h2>
              {activity.savedRoadmaps.length === 0 ? (
                <p className="text-[10px] text-slate-400 font-bold px-2">No generated roadmaps yet.</p>
              ) : (
                <div className="space-y-3">
                  {activity.savedRoadmaps.map((r: any, i: number) => (
                    <div key={i} className="bg-white p-5 rounded-[1.75rem] border border-slate-100 flex items-center gap-4 shadow-sm active:border-blue-600 transition-all cursor-pointer" onClick={() => {
                      handleRoleSelect(r);
                      setCurrentTab('explore');
                    }}>
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <Rocket className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-slate-900 text-[14px] truncate">{r.name}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.domain}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-200 ml-auto" />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        );

      case 'library':
        return (
          <div className="p-5 pb-24 page-transition">
            <header className="mb-10">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Hub</h1>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Learning Multipliers</p>
            </header>



            {loadingLibrary && library.length === 0 && (
              <div className="flex flex-col items-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Curating Content...</p>
              </div>
            )}

            {library.map((cat: any, idx: number) => (
              <section key={idx} className="mb-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="flex items-center gap-4 mb-6 px-1">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-2xl">{cat.icon}</div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 leading-none">{cat.title}</h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest opacity-60">{cat.subtitle}</p>
                  </div>
                </div>
                <div className="flex overflow-x-auto gap-5 no-scrollbar -mx-5 px-5 pb-4">
                  {cat.items?.map((item: any, i: number) => (
                    <div
                      key={i}
                      onClick={() => item.url ? window.open(item.url, '_blank') : openGitHub(`${item.title}`)}
                      className="min-w-[280px] bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
                    >
                      <div className="relative h-44 bg-slate-800">
                        {/* Dynamic gradient covers */}
                        <div className={`w-full h-full bg-gradient-to-br ${i % 2 === 0 ? 'from-blue-600 to-indigo-900' : 'from-slate-700 to-black'} opacity-80`} />

                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-600">
                            <YoutubeIcon className="w-6 h-6 fill-current" />
                          </div>
                        </div>
                        <div className="absolute top-4 right-4 bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg">
                          {item.duration}
                        </div>
                        <div className="absolute bottom-4 left-4 text-white font-black text-[10px] flex items-center gap-1">
                          <ActivityIcon className="w-3 h-3" /> {item.views}
                        </div>
                      </div>
                      <div className="p-6">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{item.channel}</span>
                        <h3 className="font-black text-slate-900 text-[14px] leading-tight line-clamp-2">{item.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest text-center py-1 border-b border-amber-200">
        ⚠️ Development Mode • Localhost Only
      </div>
      {/* Mobile Top Navigation */}
      {/* Mobile Top Navigation - Optimized: Removed heavy blur */}
      <nav className="shrink-0 bg-white/95 border-b border-slate-100 px-6 h-20 flex items-center justify-between safe-top z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-[0.85rem] flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform">
            <Rocket className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">EduPath</span>
            <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Global Student</span>
          </div>
        </div>
        <button onClick={() => setCurrentTab('updates')} className="relative w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center active:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5 text-slate-400" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
        </button>
      </nav>

      {/* Scrollable Content Container */}
      <main className="scroll-container no-scrollbar relative">
        {renderContent()}
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="shrink-0">
        <Navigation currentTab={currentTab} setTab={setCurrentTab} isAdmin={false} />
      </div>

      <ChatWidget />
    </div>
  );
};

export default App;
