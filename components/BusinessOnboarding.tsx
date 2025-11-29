import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '../types';
import { extractBusinessFacts, auditKnowledgeBase, extractCaseStudies } from '../services/geminiService';
import { Loader2, Plus, Trash2, Save, Sparkles, GripVertical, Lightbulb, RefreshCw, Briefcase, BookOpen, MessageSquareQuote } from 'lucide-react';

interface Props {
  initialProfile?: BusinessProfile;
  onSave: (profile: BusinessProfile) => void;
}

const BusinessOnboarding: React.FC<Props> = ({ initialProfile, onSave }) => {
  const [formData, setFormData] = useState<Partial<BusinessProfile>>(initialProfile || {
    companyName: '',
    industry: '',
    knowledgeBase: [],
    caseStudies: [],
    pastEmails: [],
    branding: {
      primaryColor: '#4f46e5',
      fontName: 'Inter',
      toneOfVoice: 'professional'
    }
  });

  // UI State
  const [activeTab, setActiveTab] = useState<'knowledge' | 'portfolio' | 'voice'>('knowledge');

  // Input State
  const [newInput, setNewInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Suggestion State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);

  // Trigger audit whenever knowledge base changes
  useEffect(() => {
    const timer = setTimeout(() => {
        if (formData.industry && activeTab === 'knowledge') {
            handleAudit();
        }
    }, 1500); 
    return () => clearTimeout(timer);
  }, [formData.knowledgeBase, formData.industry, activeTab]); 

  const handleAudit = async () => {
      if (!formData.industry) return;
      setIsAuditing(true);
      try {
          const gaps = await auditKnowledgeBase(formData.knowledgeBase || [], formData.industry);
          setSuggestions(gaps);
      } catch (e) {
          console.error("Audit failed", e);
      } finally {
          setIsAuditing(false);
      }
  };

  // Handlers
  const handleProcessInput = async () => {
    if (!newInput.trim()) return;
    setIsProcessing(true);
    try {
      if (activeTab === 'knowledge') {
          const newFacts = await extractBusinessFacts(newInput, formData.industry);
          setFormData(prev => ({
            ...prev,
            knowledgeBase: [...(prev.knowledgeBase || []), ...newFacts]
          }));
      } else if (activeTab === 'portfolio') {
          const newCases = await extractCaseStudies(newInput);
          setFormData(prev => ({
              ...prev,
              caseStudies: [...(prev.caseStudies || []), ...newCases]
          }));
      } else if (activeTab === 'voice') {
          // For voice, we take the raw text as an example
          setFormData(prev => ({
              ...prev,
              pastEmails: [...(prev.pastEmails || []), newInput.trim()]
          }));
      }
      setNewInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateItem = (index: number, value: string) => {
    if (activeTab === 'knowledge') {
        const updated = [...(formData.knowledgeBase || [])];
        updated[index] = value;
        setFormData({ ...formData, knowledgeBase: updated });
    } else if (activeTab === 'portfolio') {
        const updated = [...(formData.caseStudies || [])];
        updated[index] = value;
        setFormData({ ...formData, caseStudies: updated });
    } else {
        const updated = [...(formData.pastEmails || [])];
        updated[index] = value;
        setFormData({ ...formData, pastEmails: updated });
    }
  };

  const removeItem = (index: number) => {
     if (activeTab === 'knowledge') {
        const updated = [...(formData.knowledgeBase || [])];
        updated.splice(index, 1);
        setFormData({ ...formData, knowledgeBase: updated });
    } else if (activeTab === 'portfolio') {
        const updated = [...(formData.caseStudies || [])];
        updated.splice(index, 1);
        setFormData({ ...formData, caseStudies: updated });
    } else {
        const updated = [...(formData.pastEmails || [])];
        updated.splice(index, 1);
        setFormData({ ...formData, pastEmails: updated });
    }
  };

  const addEmptyItem = () => {
    if (activeTab === 'knowledge') {
        setFormData({
            ...formData,
            knowledgeBase: [...(formData.knowledgeBase || []), '']
        });
    } else if (activeTab === 'portfolio') {
        setFormData({
            ...formData,
            caseStudies: [...(formData.caseStudies || []), '']
        });
    } else {
        setFormData({
            ...formData,
            pastEmails: [...(formData.pastEmails || []), '']
        });
    }
  };

  const handleSave = () => {
    if (formData.companyName && formData.industry && (formData.knowledgeBase?.length || 0) > 0) {
      onSave({
        ...formData,
        id: formData.id || crypto.randomUUID(),
        isVerified: true,
        knowledgeBase: formData.knowledgeBase || [],
        caseStudies: formData.caseStudies || [],
        pastEmails: formData.pastEmails || [],
      } as BusinessProfile);
    }
  };

  const glassInputClass = "w-full bg-white/50 border border-white/40 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white/80 outline-none transition-all placeholder-slate-400 text-slate-800 backdrop-blur-sm";
  const glassCardClass = "bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/50";
  
  let currentList: string[] = [];
  if (activeTab === 'knowledge') currentList = formData.knowledgeBase || [];
  else if (activeTab === 'portfolio') currentList = formData.caseStudies || [];
  else currentList = formData.pastEmails || [];

  return (
    <div className="flex h-full gap-6">
      
      {/* LEFT COLUMN: Identity & Branding */}
      <div className="w-1/3 flex flex-col space-y-6">
        <div className={glassCardClass}>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center mr-3 shadow-md shadow-indigo-500/30">
               <Sparkles size={16} />
            </span>
            Identity
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Company Name</label>
              <input
                type="text"
                className={glassInputClass}
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                placeholder="e.g. Acme Studio"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Industry</label>
              <select
                className={glassInputClass}
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
              >
                <option value="" disabled>Select Industry</option>
                <option value="Video services">Video services</option>
              </select>
            </div>
          </div>
        </div>

        <div className={glassCardClass}>
           <h2 className="text-lg font-bold text-slate-800 mb-4">Branding</h2>
           <div className="space-y-4">
             <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Voice Tone</label>
              <select 
                className={glassInputClass}
                value={formData.branding?.toneOfVoice}
                onChange={(e) => setFormData({
                    ...formData, 
                    branding: { ...formData.branding!, toneOfVoice: e.target.value as any }
                })}
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual & Friendly</option>
                <option value="urgent">Urgent/Salesy</option>
                <option value="luxury">Luxury/High-end</option>
              </select>
            </div>
             <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Brand Color</label>
              <div className="flex items-center space-x-3 bg-white/50 border border-white/40 rounded-xl p-2 pl-3">
                <input 
                    type="color" 
                    value={formData.branding?.primaryColor}
                    onChange={(e) => setFormData({
                        ...formData, 
                        branding: { ...formData.branding!, primaryColor: e.target.value }
                    })}
                    className="h-8 w-8 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-sm font-mono text-slate-600">{formData.branding?.primaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
             <button
                onClick={handleSave}
                disabled={!formData.companyName || !formData.industry || (formData.knowledgeBase?.length || 0) === 0}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-3xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-slate-900/20 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Save size={20} />
                <span>Save Profile</span>
            </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Knowledge & Portfolio */}
      <div className={`w-2/3 flex flex-col ${glassCardClass} overflow-y-auto no-scrollbar relative`}>
          
          {/* Header & Tabs */}
          <div className="flex-none mb-6">
             <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl font-bold text-slate-800">Knowledge Base</h2>
                 {activeTab === 'knowledge' && (
                    <button 
                        onClick={handleAudit} 
                        className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors"
                        title="Refresh Recommendations"
                    >
                        <RefreshCw size={18} className={isAuditing ? "animate-spin" : ""} />
                    </button>
                 )}
             </div>

             {/* Custom Tab Switcher */}
             <div className="flex bg-white/40 p-1 rounded-xl border border-white/50 relative">
                <button 
                    onClick={() => setActiveTab('knowledge')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                        activeTab === 'knowledge' 
                        ? 'bg-white shadow-sm text-indigo-600' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <BookOpen size={16} />
                    <span>Rules & Pricing</span>
                </button>
                <button 
                    onClick={() => setActiveTab('portfolio')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                        activeTab === 'portfolio' 
                        ? 'bg-white shadow-sm text-purple-600' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Briefcase size={16} />
                    <span>Portfolio</span>
                </button>
                <button 
                    onClick={() => setActiveTab('voice')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                        activeTab === 'voice' 
                        ? 'bg-white shadow-sm text-rose-600' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <MessageSquareQuote size={16} />
                    <span>Voice & Tone</span>
                </button>
             </div>
          </div>

           {/* Suggestions (Only for Knowledge Tab) */}
           {activeTab === 'knowledge' && (
               isAuditing ? (
                  <div className="flex-none mb-6 bg-white/40 border border-white/50 rounded-2xl p-6 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-sm animate-pulse transition-all">
                       <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                          <Loader2 size={24} className="animate-spin" /> 
                          <span className="text-base font-bold">AI Analyst Working</span>
                       </div>
                       <p className="text-sm text-slate-500 font-medium">Checking your profile against industry standards...</p>
                  </div>
               ) : suggestions.length > 0 && (
                  <div className="flex-none mb-6 bg-amber-50/60 border border-amber-200/50 rounded-2xl p-4 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                      <div className="flex items-center text-amber-800 mb-2">
                          <Lightbulb size={18} className="mr-2" />
                          <h3 className="text-sm font-bold uppercase tracking-wider">AI Recommendations</h3>
                      </div>
                      <ul className="space-y-1">
                          {suggestions.map((s, i) => (
                              <li key={i} className="text-sm text-amber-900/80 flex items-start">
                                  <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></span>
                                  {s}
                              </li>
                          ))}
                      </ul>
                  </div>
               )
           )}

          {/* AI Ingestion Area */}
          <div className="flex-none bg-white/30 rounded-2xl p-4 border border-white/40 mb-6 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
             <div className="relative">
                <textarea
                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm min-h-[80px] resize-none placeholder-slate-400"
                    placeholder={
                        activeTab === 'knowledge'
                        ? (formData.industry === 'Video services' 
                            ? "Paste info about Services, Pricing, Timelines or Policies..." 
                            : "Paste business rules here...")
                        : activeTab === 'portfolio'
                            ? "Paste project names, results, links to videos, or case study notes..."
                            : "Paste a recent email you sent to a client (the AI will learn your writing style)..."
                    }
                    value={newInput}
                    onChange={(e) => setNewInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.metaKey) {
                            handleProcessInput();
                        }
                    }}
                />
                <div className="flex justify-between items-center mt-2">
                     <span className="text-xs text-slate-400 font-medium">
                        {activeTab === 'knowledge' ? 'Extracts facts & rules' 
                         : activeTab === 'portfolio' ? 'Extracts projects & links'
                         : 'Adds raw text example'}
                    </span>
                    <button 
                        onClick={handleProcessInput}
                        disabled={!newInput.trim() || isProcessing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : activeTab === 'voice' ? <Plus size={16} /> : <Sparkles size={16} />}
                        <span>{activeTab === 'voice' ? 'Add Example' : 'Process'}</span>
                    </button>
                </div>
             </div>
          </div>

          {/* List Area */}
          <div className="space-y-3 mb-4">
             {currentList.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Sparkles size={24} className="mb-2 opacity-50" />
                    <p className="text-sm text-center">
                        {activeTab === 'knowledge' 
                         ? "No rules added yet." 
                         : activeTab === 'portfolio' 
                            ? "No case studies added yet."
                            : "No email examples added yet."}
                        <br/>Paste info above to begin.
                    </p>
                </div>
             ) : (
                 currentList.map((item, idx) => (
                    <div key={idx} className="group flex items-start space-x-3 bg-white/40 hover:bg-white/70 transition-colors p-3 rounded-xl border border-transparent hover:border-white/50">
                        <div className="mt-2 text-slate-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical size={14} />
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={item}
                                onChange={(e) => updateItem(idx, e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-700 font-medium resize-none overflow-hidden"
                                rows={Math.max(1, Math.ceil(item.length / 80))}
                                placeholder="Empty item..."
                            />
                        </div>
                        <button 
                            onClick={() => removeItem(idx)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                 ))
             )}
          </div>
        
          {/* Manual Add Button */}
          <button 
            onClick={addEmptyItem}
            className="flex-none mt-2 w-full py-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 text-slate-400 hover:text-indigo-600 rounded-xl flex items-center justify-center space-x-2 transition-all font-semibold text-sm"
          >
             <Plus size={16} />
             <span>Add Manual Item</span>
          </button>

      </div>
    </div>
  );
};

export default BusinessOnboarding;