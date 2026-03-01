import React, { useState, useRef } from 'react';
import { Upload, X, Search, Grid, List as ListIcon, FileText, Smartphone, Code, Cpu, FolderOpen, Globe, Link as LinkIcon } from 'lucide-react';

interface Note {
    id: string;
    title: string;
    date: string;
    fileData?: string; // Base64 (optional if externalUrl exists)
    externalUrl?: string; // New field for preset notes
    fileType: 'image' | 'pdf' | 'link';
    category: string;
    subCategory?: string;
    tags: string[];
}

interface NotesSectionProps {
    notes: Note[];
    onAddNote: (note: Note) => void;
    onDeleteNote: (id: string) => void;
}

const CATEGORIES = [
    { id: 'All', label: 'All', icon: Grid },
    { id: 'DSA', label: 'DSA & Logic', icon: Cpu },
    { id: 'System Design', label: 'System Design', icon: Grid },
    { id: 'Languages', label: 'Languages', icon: Code },
    { id: 'Frameworks', label: 'Frameworks', icon: Smartphone },
    { id: 'Cloud', label: 'Cloud & DevOps', icon: FolderOpen },
    { id: 'AI Models', label: 'AI & ML', icon: Cpu },
    { id: 'Soft Skills', label: 'Interview Prep', icon: FileText },
    { id: 'Certifications', label: 'Certifications', icon: Upload }
];

const SUBCATEGORIES: Record<string, string[]> = {
    'Languages': ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'C#'],
    'Frameworks': ['React', 'Angular', 'Vue', 'Next.js', 'Spring', 'Django', 'Flask', 'Express', 'Laravel', 'Flutter', 'React Native'],
    'Cloud': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Git/GitHub'],
    'AI Models': ['TensorFlow', 'PyTorch', 'OpenAI', 'Llama', 'HuggingFace', 'Scikit-Learn', 'Pandas', 'NumPy'],
    'DSA': ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'DP', 'Recursion', 'Sorting', 'Searching', 'Bit Manipulation'],
    'System Design': ['HLD', 'LLD', 'Scalability', 'Databases', 'Caching', 'Load Balancing', 'Microservices'],
    'Soft Skills': ['Behavioral', 'Leadership', 'Communication', 'Resume', 'Negotiation']
};

// --- PRE-POPULATED LIBRARY ---
const PRESET_NOTES: Note[] = [
    // DSA
    { id: 'p1', title: 'Blind 75 LeetCode Sheet', date: 'Permanent', fileType: 'link', category: 'DSA', tags: ['DSA'], externalUrl: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions' },
    { id: 'p2', title: 'Big O Cheat Sheet', date: 'Permanent', fileType: 'link', category: 'DSA', tags: ['DSA'], externalUrl: 'https://www.bigocheatsheet.com/' },
    { id: 'p3', title: 'Algorithms Specialization PDF', date: 'Permanent', fileType: 'pdf', category: 'DSA', tags: ['DSA'], externalUrl: 'https://www.designgurus.io/course/grokking-the-coding-interview' },

    // System Design
    { id: 'p4', title: 'System Design Primer', date: 'Permanent', fileType: 'link', category: 'System Design', tags: ['System Design'], externalUrl: 'https://github.com/donnemartin/system-design-primer' },
    { id: 'p5', title: 'Microservices Patterns', date: 'Permanent', fileType: 'pdf', category: 'System Design', tags: ['System Design'], externalUrl: 'https://microservices.io/patterns/microservices.html' },

    // Languages
    { id: 'p6', title: 'JavaScript Info (PDF)', date: 'Permanent', fileType: 'pdf', category: 'Languages', subCategory: 'JavaScript', tags: ['Languages'], externalUrl: 'https://javascript.info/' },
    { id: 'p7', title: 'TypeScript Handbook', date: 'Permanent', fileType: 'pdf', category: 'Languages', subCategory: 'TypeScript', tags: ['Languages'], externalUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
    { id: 'p8', title: 'Rust Programming Book', date: 'Permanent', fileType: 'pdf', category: 'Languages', subCategory: 'Rust', tags: ['Languages'], externalUrl: 'https://doc.rust-lang.org/book/' },

    // Frameworks
    { id: 'p9', title: 'React Documentation', date: 'Permanent', fileType: 'link', category: 'Frameworks', subCategory: 'React', tags: ['Frameworks'], externalUrl: 'https://react.dev/learn' },
    { id: 'p10', title: 'Next.js Learn', date: 'Permanent', fileType: 'link', category: 'Frameworks', subCategory: 'Next.js', tags: ['Frameworks'], externalUrl: 'https://nextjs.org/learn' },

    // Cloud
    { id: 'p11', title: 'AWS Solutions Architect Guide', date: 'Permanent', fileType: 'pdf', category: 'Cloud', subCategory: 'AWS', tags: ['Cloud'], externalUrl: 'https://d1.awsstatic.com/whitepapers/architecture/AWS_Well-Architected_Framework.pdf' },
    { id: 'p12', title: 'Docker for Beginners', date: 'Permanent', fileType: 'pdf', category: 'Cloud', subCategory: 'Docker', tags: ['Cloud'], externalUrl: 'https://docker-curriculum.com/' },

    // AI
    { id: 'p13', title: 'Deep Learning Book', date: 'Permanent', fileType: 'pdf', category: 'AI Models', tags: ['AI Models'], externalUrl: 'https://www.deeplearningbook.org/' },
    { id: 'p14', title: 'HuggingFace Course', date: 'Permanent', fileType: 'link', category: 'AI Models', subCategory: 'HuggingFace', tags: ['AI Models'], externalUrl: 'https://huggingface.co/learn/nlp-course' },

    // Soft Skills
    { id: 'p15', title: 'Resume Action Verbs', date: 'Permanent', fileType: 'pdf', category: 'Soft Skills', subCategory: 'Resume', tags: ['Soft Skills'], externalUrl: 'https://hwpi.harvard.edu/files/ocs/files/hes-resume-cover-letter-guide.pdf' }
];

const NotesSection: React.FC<NotesSectionProps> = ({ notes, onAddNote, onDeleteNote }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeSubCategory, setActiveSubCategory] = useState('All');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Merge User Notes with Preset Notes
    const allNotes = [...PRESET_NOTES, ...notes];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const type = file.type.includes('pdf') ? 'pdf' : 'image';

            // Assign to currently active category, or General if 'All' is selected
            const assignedCategory = activeCategory === 'All' ? 'General' : activeCategory;

            const newNote: Note = {
                id: Date.now().toString(),
                title: file.name.split('.')[0],
                date: new Date().toLocaleDateString(),
                fileData: base64, // Store base64 content
                fileType: type,
                category: assignedCategory,
                tags: [assignedCategory]
            };
            onAddNote(newNote);
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const filteredNotes = allNotes.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'All' || n.category === activeCategory;

        // Subcategory match (if activeSubCategory is not All)
        const matchesSub = activeSubCategory === 'All' || n.subCategory === activeSubCategory || (n.category === activeCategory && !n.subCategory); // Show items without subcat if searching in main cat? Maybe stricter:
        const strictSubMatch = activeSubCategory === 'All' ? true : n.subCategory === activeSubCategory;

        return matchesSearch && matchesCategory && strictSubMatch;
    });

    const openNote = (note: Note) => {
        if (note.externalUrl) {
            window.open(note.externalUrl, '_blank');
            return;
        }

        if (note.fileType === 'pdf' && note.fileData) {
            // Check if base64 has header, if not add it
            const pdfData = note.fileData.startsWith('data:') ? note.fileData : `data:application/pdf;base64,${note.fileData}`;
            const win = window.open();
            win?.document.write(`<iframe src="${pdfData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        } else if (note.fileData) {
            // Image preview
            const win = window.open();
            win?.document.write(`<img src="${note.fileData}" style="max-width:100%"/>`);
        }
    };

    return (
        <div className="p-5 pb-24 page-transition min-h-full flex flex-col">
            <header className="mb-6">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">My Notes</h1>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Digital Library</p>
            </header>

            {/* Category Tabs */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6 pb-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => { setActiveCategory(cat.id); setActiveSubCategory('All'); }}
                        className={`
                            px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shrink-0 transition-all border
                            ${activeCategory === cat.id
                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
                                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}
                        `}
                    >
                        <cat.icon className="w-3 h-3" />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Sub-Category Tabs (Dynamic) */}
            {activeCategory !== 'All' && SUBCATEGORIES[activeCategory] && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <button
                        onClick={() => setActiveSubCategory('All')}
                        className={`
                            px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wide shrink-0 transition-all border
                            ${activeSubCategory === 'All'
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}
                        `}
                    >
                        All
                    </button>
                    {SUBCATEGORIES[activeCategory].map(sub => (
                        <button
                            key={sub}
                            onClick={() => setActiveSubCategory(sub)}
                            className={`
                                px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wide shrink-0 transition-all border
                                ${activeSubCategory === sub
                                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}
                            `}
                        >
                            {sub}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-blue-500"
                    />
                </div>
                <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="w-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 active:bg-slate-50"
                >
                    {viewMode === 'grid' ? <ListIcon className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                {filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Upload className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-black text-slate-300 uppercase">No notes in {activeCategory}</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-4 gap-3" : "space-y-2"}>
                        {filteredNotes.map(note => (
                            <div key={note.id} className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm relative group cursor-pointer hover:shadow-md transition-all active:scale-95" onClick={() => openNote(note)}>
                                {!note.id.startsWith('p') && ( // Only allow deleting user notes (not presets)
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                                        className="absolute top-1 right-1 w-4 h-4 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                )}

                                <div className={`aspect-[4/3] rounded-lg mb-1.5 overflow-hidden flex items-center justify-center ${note.fileType === 'pdf' ? 'bg-red-50' : note.fileType === 'link' ? 'bg-blue-50' : 'bg-slate-100'}`}>
                                    {note.fileType === 'pdf' ? (
                                        <div className="flex flex-col items-center text-red-500">
                                            <FileText className="w-6 h-6 mb-1" />
                                            <span className="text-[7px] font-black uppercase tracking-wider">PDF</span>
                                        </div>
                                    ) : note.fileType === 'link' ? (
                                        <div className="flex flex-col items-center text-blue-500">
                                            <LinkIcon className="w-6 h-6 mb-1" />
                                            <span className="text-[7px] font-black uppercase tracking-wider">Link</span>
                                        </div>
                                    ) : (
                                        <img src={note.fileData} alt={note.title} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-800 text-[10px] truncate leading-tight">{note.title}</h3>
                                <div className="flex justify-between items-center mt-1.5">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">{note.date}</span>
                                    <div className="flex gap-1">
                                        <span className="text-[7px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md uppercase">{note.category === 'AI Models' ? 'AI' : note.category.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-24 right-5">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform"
                >
                    <Upload className="w-6 h-6" />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                />
            </div>

            {/* Quick Link to Online Notes */}
            <div className="fixed bottom-6 right-5 flex gap-3">
                <button
                    onClick={() => {
                        const query = activeCategory === 'All' ? 'computer science handwritten notes pdf' : `${activeCategory} ${activeSubCategory !== 'All' ? activeSubCategory : ''} handwritten notes pdf`;
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                    }}
                    className="w-14 h-14 bg-white text-blue-600 rounded-full shadow-xl border border-blue-100 flex items-center justify-center active:scale-90 transition-transform group"
                    title="Find Online Notes"
                >
                    <Globe className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default NotesSection;
