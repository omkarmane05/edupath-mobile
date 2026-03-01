import React, { useState, useEffect } from 'react';
import { User, GraduationCap, Book, Save, Loader2, LogOut } from 'lucide-react';
import { supabase } from '../supabase';

const ProfileSection: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        college: '',
        course: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('name, college, course')
                    .eq('id', session.user.id)
                    .single();

                if (data) {
                    setProfile({
                        name: data.name || '',
                        college: data.college || '',
                        course: data.course || ''
                    });
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setSaving(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
            // Upsert the profile data
            await supabase.from('profiles').upsert({
                id: session.user.id,
                name: profile.name,
                college: profile.college,
                course: profile.course,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
        }
        setSaving(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Loading Profile...</p>
            </div>
        );
    }

    return (
        <div className="p-5 pb-24 page-transition max-w-lg mx-auto">
            <header className="mb-10 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-xl">
                    <User className="w-12 h-12 text-blue-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">My Profile</h1>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Student Details</p>
            </header>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">

                {/* Full Name */}
                <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
                        <User className="w-3.5 h-3.5" /> Full Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                </div>

                {/* College / University */}
                <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
                        <GraduationCap className="w-3.5 h-3.5" /> College / University
                    </label>
                    <input
                        type="text"
                        name="college"
                        value={profile.college}
                        onChange={handleChange}
                        placeholder="e.g. Stanford University"
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                </div>

                {/* Course / Major */}
                <div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
                        <Book className="w-3.5 h-3.5" /> Course / Major
                    </label>
                    <input
                        type="text"
                        name="course"
                        value={profile.course}
                        onChange={handleChange}
                        placeholder="e.g. B.Tech Computer Science"
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-100 disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 text-red-500 font-black text-[11px] uppercase tracking-widest p-4 rounded-xl bg-red-50 active:bg-red-100 transition-colors"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </div>
    );
};

export default ProfileSection;
