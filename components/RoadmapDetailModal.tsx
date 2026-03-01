import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, ExternalLink, BookOpen, AlertCircle, Award } from 'lucide-react';
import { supabase } from '../supabase';

interface RoadmapDetailModalProps {
    node: any;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (nodeId: string) => void;
}

const RoadmapDetailModal: React.FC<RoadmapDetailModalProps> = ({ node, isOpen, onClose, onComplete }) => {
    const [checkedItems, setCheckedItems] = useState<string[]>([]);

    useEffect(() => {
        // Reset or load saved state when node changes
        if (node) {
            const lsKey = `roadmap_check_${node.id}`;
            const saved = localStorage.getItem(lsKey);
            setCheckedItems(saved ? JSON.parse(saved) : []);

            // Attempt Cloud Sync
            const fetchCloudProgress = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) return; // Not logged in

                const { data, error } = await supabase
                    .from('roadmap_progress')
                    .select('checked_items')
                    .eq('user_id', session.user.id)
                    .eq('node_id', node.id)
                    .single();

                if (!error && data?.checked_items) {
                    const cloudItems = (data.checked_items as string[]) || [];
                    setCheckedItems(cloudItems);
                    localStorage.setItem(lsKey, JSON.stringify(cloudItems));
                }
            };
            fetchCloudProgress();
        }
    }, [node]);

    const handleCheck = async (item: string) => {
        // Optimistic UI Update
        const lsKey = `roadmap_check_${node.id}`;
        let updatedItems: string[] = [];

        setCheckedItems(prev => {
            const newItems = prev.includes(item)
                ? prev.filter(i => i !== item)
                : [...prev, item];

            localStorage.setItem(lsKey, JSON.stringify(newItems));
            updatedItems = newItems; // capture for cloud
            return newItems;
        });

        // Cloud Background Sync
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await supabase.from('roadmap_progress').upsert({
                user_id: session.user.id,
                node_id: node.id,
                checked_items: updatedItems
            }, { onConflict: 'user_id, node_id' });
        }
    };

    if (!isOpen || !node) return null;

    const allChecked = node.data.checklist && node.data.checklist.length > 0 &&
        node.data.checklist.every((item: string) => checkedItems.includes(item));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start shrink-0">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{node.data.duration || 'Self Paced'}</span>
                        <h2 className="text-2xl font-black text-slate-900 mt-3 leading-tight">{node.label}</h2>
                        <p className="text-slate-500 font-bold text-sm mt-1">{node.data.goal}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900 active:scale-90 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-8 overflow-y-auto no-scrollbar space-y-8">

                    {/* Mandatory Checklist */}
                    <section>
                        <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                            <AlertCircle className="w-4 h-4 text-amber-500" /> Mandatory Concepts
                        </h3>
                        <div className="space-y-3">
                            {node.data.checklist?.map((item: string, idx: number) => (
                                <div
                                    key={idx}
                                    onClick={() => handleCheck(item)}
                                    className={`
                                        p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all active:scale-[0.99]
                                        ${checkedItems.includes(item)
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-white border-slate-100 hover:border-blue-200'}
                                    `}
                                >
                                    <div className={`
                                        w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors
                                        ${checkedItems.includes(item) ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300'}
                                    `}>
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <span className={`font-bold text-sm ${checkedItems.includes(item) ? 'text-green-800 line-through opacity-70' : 'text-slate-700'}`}>
                                        {item}
                                    </span>
                                </div>
                            )) || <p className="text-slate-400 italic text-sm">No specific checklist for this module.</p>}
                        </div>
                    </section>

                    {/* Recommended Resources */}
                    <section>
                        <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                            <BookOpen className="w-4 h-4 text-blue-500" /> Deep Dive Resources
                        </h3>
                        <div className="grid gap-3">
                            {node.data.recommended?.map((res: any, idx: number) => (
                                <a
                                    key={idx}
                                    href={res.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                            {res.type === 'video' ? <ExternalLink className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{res.title}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{res.source || 'External'}</p>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                                </a>
                            )) || (
                                    <button
                                        onClick={() => window.open(`https://github.com/search?q=${encodeURIComponent(node.label + " awesome list")}`, '_blank')}
                                        className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" /> Find Resources on GitHub
                                    </button>
                                )}
                        </div>
                    </section>

                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                    <div className="text-xs font-bold text-slate-400">
                        {checkedItems.length} / {node.data.checklist?.length || 0} Concepts Mastered
                    </div>
                    <button
                        disabled={!allChecked}
                        onClick={() => { onComplete(node.id); onClose(); }}
                        className={`
                            px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all flex items-center gap-2
                            ${allChecked
                                ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 active:scale-95'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                        `}
                    >
                        <Award className="w-4 h-4" />
                        {allChecked ? 'Complete Module' : 'Incomplete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoadmapDetailModal;
