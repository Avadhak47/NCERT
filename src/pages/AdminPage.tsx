/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import originalData from '../data/states.json';
import { Save, CheckCircle2, AlertCircle, Edit2, Trash2, Plus, ChevronRight } from 'lucide-react';

export default function AdminPage() {
    const [data, setData] = useState(originalData);
    const [selectedStateIndex, setSelectedStateIndex] = useState(0);
    const [selectedCategoryPath, setSelectedCategoryPath] = useState('');
    const [selectedItemIndex, setSelectedItemIndex] = useState(-1);
    const [status, setStatus] = useState<'' | 'saving' | 'success' | 'error'>('');
    const [uploadStatus, setUploadStatus] = useState<'' | 'uploading' | 'success' | 'error'>(''); // Image Upload

    // Save strictly to the native local file system using Vite Backend
    const handleSave = async () => {
        setStatus('saving');
        try {
            const res = await fetch('/api/admin/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                setStatus('success');
                setTimeout(() => setStatus(''), 3000);
            } else {
                throw new Error(await res.text());
            }
        } catch (e) {
            console.error(e);
            setStatus('error');
            setTimeout(() => setStatus(''), 4000);
        }
    };

    const currentState = data.states[selectedStateIndex];

    const getCategories = (obj: any, prefix = '') => {
        let cats: string[] = [];
        for (const key in obj) {
            if (Array.isArray(obj[key])) {
                cats.push(prefix ? `${prefix}.${key}` : key);
            } else if (typeof obj[key] === 'object' && obj[key] && key === 'art_forms') {
                cats = cats.concat(getCategories(obj[key], key));
            } else if (typeof obj[key] === 'object' && obj[key] && key === 'dance_forms') {
                 cats = cats.concat(getCategories(obj[key], `${prefix ? prefix + '.' : ''}${key}`));
            }
        }
        return cats;
    };

    const categories = useMemo(() => {
        if (!currentState) return [];
        return getCategories(currentState);
    }, [currentState]);

    const getCurrentArray = () => {
        if (!currentState || !selectedCategoryPath || selectedCategoryPath === '__state_metadata__') return null;
        const parts = selectedCategoryPath.split('.');
        let current: any = currentState;
        for (const p of parts) {
            if (!current[p]) return null;
            current = current[p];
        }
        return Array.isArray(current) ? current : null;
    };

    const currentArray = getCurrentArray();
    const currentItem = currentArray && selectedItemIndex >= 0 ? currentArray[selectedItemIndex] : null;

    const updateCurrentItem = (field: string, value: string) => {
        const newData = JSON.parse(JSON.stringify(data));
        let arr = newData.states[selectedStateIndex];
        const parts = selectedCategoryPath.split('.');
        for (const p of parts) arr = arr[p];
        arr[selectedItemIndex][field] = value;
        setData(newData);
    };

    const deleteCurrentItem = () => {
        if (!confirm('Are you sure you want to completely delete this item from the database?')) return;
        const newData = JSON.parse(JSON.stringify(data));
        let arr = newData.states[selectedStateIndex];
        const parts = selectedCategoryPath.split('.');
        for (const p of parts) arr = arr[p];
        arr.splice(selectedItemIndex, 1);
        setData(newData);
        setSelectedItemIndex(-1);
    };

    const addNewItem = () => {
        const newData = JSON.parse(JSON.stringify(data));
        let arr = newData.states[selectedStateIndex];
        const parts = selectedCategoryPath.split('.');
        for (const p of parts) arr = arr[p];
        
        arr.unshift({
            id: `new_${Date.now()}`,
            name: "New Item",
            desc: "Add description here...",
            img: ""
        });
        
        setData(newData);
        setSelectedItemIndex(0); // Focus the newly created top item
    };

    const updateStateField = (field: string, value: string) => {
        const newData = JSON.parse(JSON.stringify(data));
        newData.states[selectedStateIndex][field] = value;
        setData(newData);
    };

    const handleImageUpload = async (file?: File, url?: string) => {
        setUploadStatus('uploading');
        try {
            const payload: any = { filename: (currentItem?.name || currentItem?.title || currentItem?.dance_form || currentState?.name || 'upload').slice(0, 30) };
            
            if (file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                await new Promise(r => reader.onload = r as any);
                payload.imageBase64 = reader.result;
            } else if (url) {
                payload.imageUrl = url;
            } else return;

            const res = await fetch('/api/admin/upload-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(await res.text());
            
            const responseData = await res.json();
            if (selectedCategoryPath === '__state_metadata__') {
                updateStateField('img', responseData.url);
            } else if (currentItem) {
                updateCurrentItem('img', responseData.url);
            }
            
            setUploadStatus('success');
            setTimeout(() => setUploadStatus(''), 2500);
        } catch (err) {
            console.error(err);
            setUploadStatus('error');
            setTimeout(() => setUploadStatus(''), 4000);
        }
    };

    return (
        <div className="pt-24 pb-12 px-4 sm:px-8 w-full max-w-[1400px] mx-auto min-h-screen text-slate-200">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-slate-900/60 p-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
                <div>
                    <h1 className="text-3xl font-serif font-black text-amber-500 tracking-tight drop-shadow-md">Virasat Content Admin</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">Direct read/write access to <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">src/data/states.json</code> via Vite dev server.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={status === 'saving'}
                    className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all shadow-xl text-white ${status === 'saving' ? 'bg-emerald-600/50 cursor-wait' : status === 'success' ? 'bg-emerald-500 shadow-emerald-500/20' : status === 'error' ? 'bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500 hover:-translate-y-0.5 hover:shadow-emerald-500/20 active:scale-95'}`}
                >
                    {status === 'saving' ? <span className="animate-pulse flex gap-2"><Save className="w-5 h-5"/> Saving to Disk...</span> : 
                     status === 'success' ? <><CheckCircle2 className="w-5 h-5"/> Safely Saved to JSON</> : 
                     status === 'error' ? <><AlertCircle className="w-5 h-5"/> Server Error</> : 
                     <><Save className="w-5 h-5"/> Securely Save Database</>}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[75vh]">
                
                {/* 1. STATE SELECTOR */}
                <div className="lg:col-span-3 bg-slate-900/40 rounded-2xl border border-white/10 overflow-hidden flex flex-col backdrop-blur-sm shadow-xl h-[400px] lg:h-full">
                    <div className="bg-slate-800/80 p-4 font-black tracking-wide border-b border-white/10 text-amber-400 flex items-center gap-2 uppercase text-sm"><span className="bg-amber-500/20 w-6 h-6 rounded-full flex items-center justify-center text-amber-300">1</span> Select Area</div>
                    <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                        {data.states.map((st, i) => (
                            <button
                                key={st.id || i}
                                onClick={() => { setSelectedStateIndex(i); setSelectedCategoryPath(''); setSelectedItemIndex(-1); }}
                                className={`w-full text-left px-4 py-3 rounded-xl mb-1 transition-all text-sm font-bold ${selectedStateIndex === i ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md' : 'hover:bg-white/5 text-slate-300'}`}
                            >
                                {st.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. CATEGORY SELECTOR */}
                <div className="lg:col-span-3 bg-slate-900/40 rounded-2xl border border-white/10 overflow-hidden flex flex-col backdrop-blur-sm shadow-xl h-[400px] lg:h-full">
                    <div className="bg-slate-800/80 p-4 font-black tracking-wide border-b border-white/10 text-emerald-400 flex items-center gap-2 uppercase text-sm"><span className="bg-emerald-500/20 w-6 h-6 rounded-full flex items-center justify-center text-emerald-300">2</span> Category</div>
                    <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => { setSelectedCategoryPath(cat); setSelectedItemIndex(-1); }}
                                className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all text-sm font-bold mb-1 ${selectedCategoryPath === cat ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-md' : 'hover:bg-white/5 text-slate-300'}`}
                            >
                                <span className="capitalize">{cat.replace(/_/g, ' ').replace(/\//g, ' > ')}</span>
                                <ChevronRight className="w-4 h-4 opacity-50" />
                            </button>
                        ))}

                        {/* Special State description editor trigger */}
                        {currentState && (
                            <button
                                onClick={() => { setSelectedCategoryPath('__state_metadata__'); setSelectedItemIndex(-1); }}
                                className={`w-full text-left px-4 py-3 mt-4 rounded-xl flex items-center justify-between transition-all text-sm font-black border border-dashed ${selectedCategoryPath === '__state_metadata__' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md' : 'border-white/20 text-slate-400 hover:bg-white/5'}`}
                            >
                                Edit Core State Details
                            </button>
                        )}
                    </div>
                </div>

                {/* 3. ITEM LIST */}
                <div className="lg:col-span-3 bg-slate-900/40 rounded-2xl border border-white/10 overflow-hidden flex flex-col backdrop-blur-sm shadow-xl h-[400px] lg:h-full">
                    <div className="bg-slate-800/80 p-4 font-black tracking-wide border-b border-white/10 text-cyan-400 flex items-center gap-2 uppercase text-sm"><span className="bg-cyan-500/20 w-6 h-6 rounded-full flex items-center justify-center text-cyan-300">3</span> Select Entry</div>
                    <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                        {selectedCategoryPath === '__state_metadata__' ? (
                            <div className="p-8 text-center text-purple-400/70 italic font-medium">Currently modifying the high-level attributes for the entire state.</div>
                        ) : currentArray ? (
                            <>
                                <button onClick={addNewItem} className="w-full mb-3 p-3 border-2 border-dashed border-cyan-500/40 text-cyan-400 rounded-xl hover:bg-cyan-500/10 flex items-center justify-center gap-2 font-black text-sm transition-colors shadow-sm">
                                    <Plus className="w-5 h-5" /> OVERRIDE / ADD ENTRY
                                </button>
                                {currentArray.map((item: any, i: number) => (
                                    <button
                                        key={item.id || i}
                                        onClick={() => setSelectedItemIndex(i)}
                                        className={`w-full text-left p-3 rounded-xl mb-1.5 transition-all text-sm flex gap-3 items-center ${selectedItemIndex === i ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-md shadow-cyan-900/20' : 'hover:bg-white/5 text-slate-300 border border-transparent hover:border-white/10'}`}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                                            {item.img ? <img src={item.img} className="w-full h-full object-cover" /> : <span className="text-[9px] font-black text-white/30 tracking-widest">IMG</span>}
                                        </div>
                                        <div className="truncate font-bold leading-tight">
                                            {item.name !== undefined ? item.name : 
                                             item.title !== undefined ? item.title : 
                                             item.dance_form !== undefined ? item.dance_form : 
                                             item.subtitle !== undefined ? item.subtitle : `Unnamed Item ${i+1}`}
                                        </div>
                                    </button>
                                ))}
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 font-bold p-6 text-center">
                                Select a category from the previous column.
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. EDITOR PANEL */}
                <div className="lg:col-span-3 bg-zinc-900/80 rounded-2xl border border-white/15 overflow-hidden flex flex-col backdrop-blur-xl shadow-[0_0_40px_-15px_rgba(0,0,0,0.5)] h-[600px] lg:h-full relative">
                    <div className="bg-zinc-800/90 p-4 font-black tracking-wide border-b border-white/10 text-white flex justify-between items-center z-10">
                        <span className="flex items-center gap-2 uppercase text-sm"><span className="bg-white/20 w-6 h-6 rounded-full flex items-center justify-center text-white">4</span> Manage Content</span>
                        {currentItem && <button onClick={deleteCurrentItem} className="text-red-400 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg flex gap-2 font-bold text-xs items-center transition-colors shadow-sm"><Trash2 className="w-4 h-4"/> DELETE</button>}
                    </div>
                    
                    <div className="overflow-y-auto flex-1 p-5 custom-scrollbar">
                        {selectedCategoryPath === '__state_metadata__' && currentState ? (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest font-black text-slate-400 mb-1.5 ml-1">State Name</label>
                                    <input value={currentState.name || ''} onChange={(e) => updateStateField('name', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-inner transition-shadow" />
                                </div>
                                
                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest font-black text-slate-400 mb-1.5 ml-1 mt-6">Primary State Description</label>
                                    <textarea value={(currentState as any).desc || (currentState as any).description || ''} onChange={(e) => updateStateField('desc', e.target.value)} rows={7} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-inner transition-shadow leading-relaxed resize-none custom-scrollbar" />
                                </div>
                                
                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest font-black text-slate-400 mb-1.5 ml-1 mt-6">Banner Image Path</label>
                                    <input value={(currentState as any).img || ''} onChange={(e) => updateStateField('img', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-emerald-300 font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-inner transition-shadow" />
                                </div>
                                <ImageUploadBox uploadStatus={uploadStatus} onUpload={handleImageUpload} />
                            </div>
                        ) : currentItem ? (
                            <div className="space-y-5 pb-8">
                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest font-black text-slate-400 mb-1.5 ml-1">Primary Title / Name</label>
                                    <input 
                                        value={
                                            currentItem.name !== undefined ? currentItem.name : 
                                            currentItem.title !== undefined ? currentItem.title : 
                                            currentItem.dance_form !== undefined ? currentItem.dance_form : ''
                                        } 
                                        onChange={(e) => {
                                            const activeKey = currentItem.name !== undefined ? 'name' : 
                                                              currentItem.title !== undefined ? 'title' : 
                                                              currentItem.dance_form !== undefined ? 'dance_form' : 'name';
                                            updateCurrentItem(activeKey, e.target.value);
                                        }} 
                                        className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white font-bold text-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none shadow-inner transition-shadow" 
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest font-black text-slate-400 mb-1.5 ml-1 mt-4">Description Text</label>
                                    <textarea value={currentItem.desc || currentItem.description || currentItem.historical_significance || ''} onChange={(e) => {
                                         let key = 'desc';
                                         if (currentItem.description !== undefined) key = 'description';
                                         if (currentItem.historical_significance !== undefined) key = 'historical_significance';
                                         updateCurrentItem(key, e.target.value);
                                    }} rows={6} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white font-medium focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none shadow-inner transition-shadow leading-relaxed resize-none custom-scrollbar" />
                                </div>

                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest font-black text-slate-400 mb-1.5 ml-1 mt-4">Image Source Link (from /public folder)</label>
                                    <input value={currentItem.img || ''} onChange={(e) => updateCurrentItem('img', e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-emerald-300 font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none shadow-inner transition-shadow" />
                                </div>
                                
                                <ImageUploadBox uploadStatus={uploadStatus} onUpload={handleImageUpload} />

                                {currentItem.img && (
                                    <div className="mt-3 w-full h-40 bg-black/80 rounded-xl overflow-hidden border border-white/10 relative shadow-2xl flex items-center justify-center group">
                                        <img src={currentItem.img} className="w-full h-full object-contain p-1" />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs font-bold font-mono text-white tracking-widest truncate px-4">{currentItem.img}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-white/10 mt-8">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><div className="h-px bg-slate-700 flex-1"></div> Advanced Form Fields <div className="h-px bg-slate-700 flex-1"></div></h4>
                                    {Object.keys(currentItem).filter(k => !['id', 'name', 'title', 'dance_form', 'desc', 'description', 'historical_significance', 'img'].includes(k)).map(key => (
                                        <div key={key} className="mb-4 bg-white/5 p-3 rounded-lg border border-white/5 shadow-inner">
                                            <label className="block text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-1">{key}</label>
                                            <input value={typeof currentItem[key] === 'string' ? currentItem[key] : JSON.stringify(currentItem[key])} onChange={(e) => updateCurrentItem(key, e.target.value)} className="w-full bg-black/40 border border-transparent rounded-md p-2 text-slate-200 text-sm focus:ring-1 focus:ring-amber-500/50 outline-none font-mono" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-60">
                                <Edit2 className="w-16 h-16 mb-5 drop-shadow-2xl opacity-50 text-slate-500" />
                                <p className="font-bold text-lg text-slate-400 text-center max-w-[200px]">Select an item from the list to modify its contents.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

// Subcomponent for the Image Upload Interface
function ImageUploadBox({ uploadStatus, onUpload }: { uploadStatus: string, onUpload: (file?: File, url?: string) => void }) {
    return (
        <div className="mt-4 p-4 bg-black/40 border border-white/10 rounded-xl space-y-4 relative overflow-hidden">
            <label className="block text-[10px] uppercase tracking-widest font-black text-slate-400">Media Upload Pipeline (Auto-WebP)</label>
            
            <div className="flex gap-2 items-center">
                <input type="text" id="img-url-fetch" placeholder="Paset external URL (https://...)" className="flex-1 bg-black/60 border border-white/10 rounded-lg p-2.5 text-white text-xs focus:ring-1 focus:ring-cyan-500 outline-none font-mono" />
                <button onClick={() => onUpload(undefined, (document.getElementById('img-url-fetch') as HTMLInputElement).value)} className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors border border-cyan-500/30 whitespace-nowrap">
                    Download & Compress
                </button>
            </div>

            <div className="relative w-full">
                <input type="file" accept="image/*" onChange={(e) => e.target.files && onUpload(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" />
                <div className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-dashed border-emerald-500/40 rounded-lg p-3.5 flex justify-center items-center text-emerald-400/80 font-bold text-xs transition-colors">
                    Click or Drag Image File Here to Upload & Convert
                </div>
            </div>

            {uploadStatus === 'uploading' && <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-20 text-cyan-400 font-black tracking-widest uppercase animate-pulse text-xs">Processing WebP via Sharp...</div>}
            {uploadStatus === 'success' && <div className="absolute inset-0 bg-emerald-900/90 backdrop-blur-md flex items-center justify-center z-20 text-emerald-400 font-black tracking-widest uppercase text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)]">Upload & Compression Successful!</div>}
            {uploadStatus === 'error' && <div className="absolute inset-0 bg-red-900/90 backdrop-blur-md flex items-center justify-center z-20 text-red-400 font-black tracking-widest uppercase text-xs">Upload Failed</div>}
        </div>
    );
}
