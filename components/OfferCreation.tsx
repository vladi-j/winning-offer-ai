import React, { useState } from 'react';
import { BusinessProfile, GeneratedOffer, OfferRecord } from '../types';
import { generateOfferDraft, generateHtmlEmail } from '../services/anthropicService';
import { saveOffer, updateOffer, duplicateOffer } from '../services/offerService';
import { Loader2, Mail, ArrowRight, ClipboardCheck, AlertCircle, Sparkles, Copy, Trash2, Send, Sliders, ToggleLeft, ToggleRight, Check, Edit3, Save, CopyPlus, ArrowLeft } from 'lucide-react';

interface Props {
  businessProfile: BusinessProfile;
  initialOffer?: OfferRecord | null;
  onBack?: () => void;
}

const OfferCreation: React.FC<Props> = ({ businessProfile, initialOffer, onBack }) => {
  const [clientEmail, setClientEmail] = useState(initialOffer?.client_request || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [offer, setOffer] = useState<GeneratedOffer | null>(initialOffer?.offer_data || null);
  const [currentOfferId, setCurrentOfferId] = useState<string | null>(initialOffer?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState('');

  // Configuration Toggles
  const [options, setOptions] = useState({
    includeSummary: true,
    includeQuestions: true,
    includeTiers: true,
    includeWorkflow: true,
    includePS: true
  });

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    if (!clientEmail.trim()) return;

    setCurrentOfferId(null); // Reset current offer ID when generating a new one
    setIsGenerating(true);
    try {
      const result = await generateOfferDraft(businessProfile, clientEmail, options);
      setOffer(result);

      // Auto-save
      const saved = await saveOffer(result, clientEmail, businessProfile.id);
      setCurrentOfferId(saved.id);

    } catch (e: any) {
      console.error("Offer generation error:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      alert(`Failed to generate offer. Details: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const [htmlMode, setHtmlMode] = useState(false);
  const [isDesigning, setIsDesigning] = useState(false);

  const handleGenerateHtml = async () => {
    if (!offer) return;
    setIsDesigning(true);
    try {
      const html = await generateHtmlEmail(offer, businessProfile);
      const updatedOffer = { ...offer, htmlContent: html };
      setOffer(updatedOffer);
      setHtmlMode(true);

      // Update DB
      if (currentOfferId) {
        await updateOffer(currentOfferId, { offer_data: updatedOffer });
      }
    } catch (e: any) {
      console.error("HTML generation error:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      alert(`Failed to generate HTML email. Details: ${errorMessage}`);
    } finally {
      setIsDesigning(false);
    }
  };

  const handleStartEdit = () => {
    if (offer) {
      setEditedBody(offer.emailBody);
      setIsEditing(true);
      setHtmlMode(false); // Force text mode
    }
  };

  const handleSaveEdit = async () => {
    if (!offer || !currentOfferId) return;

    const updatedOffer = { ...offer, emailBody: editedBody, htmlContent: undefined }; // Reset HTML on edit
    setOffer(updatedOffer);
    setIsEditing(false);

    try {
      await updateOffer(currentOfferId, { offer_data: updatedOffer });
    } catch (e) {
      console.error("Failed to save edit", e);
      alert("Failed to save changes to database.");
    }
  };

  const handleDuplicate = async () => {
    if (!offer || !currentOfferId) return;

    try {
      // We need the full record, but we only have ID and GeneratedOffer. 
      // For simplicity, we'll reconstruct enough to duplicate or fetch fresh.
      // Better approach: duplicateOffer service handles it if we pass the record, 
      // but here we might just create a new one based on current state.
      // Let's use the service properly if we had the full record, but we can also just "save as new".

      const duplicated = await saveOffer(offer, clientEmail, businessProfile.id);
      // Update title to indicate copy
      await updateOffer(duplicated.id, { title: `${offer.emailSubject} (Copy)` });

      setCurrentOfferId(duplicated.id);
      alert("Offer duplicated! You are now working on the copy.");
    } catch (e) {
      console.error("Duplicate failed", e);
      alert("Failed to duplicate offer.");
    }
  };

  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!offer) return;

    setIsSending(true);
    try {
      const payload = {
        business_name: businessProfile.companyName,
        client_request: clientEmail,
        offer_subject: offer.emailSubject,
        offer_body: offer.emailBody,
        offer_html: offer.htmlContent,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('https://vladjs.app.n8n.cloud/webhook/register-opportunity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }

      alert('Opportunity registered successfully!');
    } catch (e) {
      console.error("Failed to send email webhook", e);
      alert("Failed to register opportunity. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const glassInputClass = "w-full bg-white/50 border border-white/40 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white/80 outline-none transition-all placeholder-slate-400 text-slate-800 backdrop-blur-sm shadow-inner";
  const glassCardClass = "bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/50";

  return (
    <div className="flex h-full gap-6">
      {/* Input Column */}
      <div className="w-1/3 flex flex-col space-y-4 overflow-y-auto no-scrollbar pb-4">

        {/* Request Input */}
        <div className={`${glassCardClass} flex flex-col`}>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <span className="bg-indigo-100/50 p-2 rounded-xl text-indigo-600 mr-3">
              <Mail size={20} />
            </span>
            Incoming Request
          </h2>
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Dashboard
            </button>
          )}
          <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">Paste Client Message</p>

          <textarea
            className={`${glassInputClass} resize-none text-sm leading-relaxed mb-4 min-h-[160px]`}
            placeholder="e.g. Hi, I need a delivery quote for 500 packages from Brooklyn to Queens next Tuesday. Can you do it?"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
          />
        </div>

        {/* Structure Settings */}
        <div className={glassCardClass}>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <span className="bg-purple-100/50 p-2 rounded-xl text-purple-600 mr-3">
              <Sliders size={20} />
            </span>
            Offer Structure
          </h2>
          <div className="space-y-3">
            {[
              { key: 'includeSummary', label: 'Project Summary' },
              { key: 'includeQuestions', label: 'Clarifying Questions' },
              { key: 'includeTiers', label: '3-Tier Packages' },
              { key: 'includeWorkflow', label: 'Workflow Steps' },
              { key: 'includePS', label: 'P.S. / Upsell' },
            ].map((opt) => (
              <div
                key={opt.key}
                onClick={() => toggleOption(opt.key as keyof typeof options)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/30 cursor-pointer transition-colors group"
              >
                <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                <div className={`transition-all duration-300 ${options[opt.key as keyof typeof options] ? 'text-indigo-600' : 'text-slate-300'}`}>
                  {options[opt.key as keyof typeof options] ? <ToggleRight size={28} fill="currentColor" className="opacity-20" /> : <ToggleLeft size={28} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !clientEmail.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:scale-[1.02]"
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={18} fill="currentColor" />}
          <span>Generate Winning Offer</span>
        </button>

        {/* Context Bubble */}
        <div className="bg-white/30 backdrop-blur-md p-5 rounded-3xl border border-white/40 flex items-center justify-between shadow-sm mt-auto">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Active Profile</h3>
            <div className="text-sm font-bold text-slate-800">{businessProfile.companyName}</div>
            <div className="text-[10px] text-slate-500 mt-1">
              {businessProfile.knowledgeBase.length} Rules • {businessProfile.caseStudies?.length || 0} Projects
            </div>
          </div>
          <div className="bg-green-100/80 text-green-700 p-2 rounded-full">
            <ClipboardCheck size={16} />
          </div>
        </div>
      </div>

      {/* Output Column */}
      <div className="w-2/3 h-full overflow-y-auto no-scrollbar pb-2">
        {!offer ? (
          <div className="h-full bg-white/20 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-white/40 flex items-center justify-center flex-col text-slate-400 group">
            <div className="w-20 h-20 bg-white/40 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
              <ArrowRight size={32} className="opacity-40" />
            </div>
            <p className="font-medium text-lg">Ready to draft your next deal</p>
            <p className="text-sm opacity-60 mt-1">Paste a request on the left to begin</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">

            {/* Status Banner */}
            <div className={`p-5 rounded-3xl border backdrop-blur-xl shadow-lg flex items-start space-x-4 ${offer.status === 'ready'
              ? 'bg-green-50/60 border-green-200/50 text-green-900'
              : 'bg-amber-50/60 border-amber-200/50 text-amber-900'
              }`}>
              <div className={`p-2 rounded-full ${offer.status === 'ready' ? 'bg-green-200/50' : 'bg-amber-200/50'}`}>
                {offer.status === 'ready'
                  ? <ClipboardCheck size={20} />
                  : <AlertCircle size={20} />
                }
              </div>
              <div>
                <h3 className="font-bold text-lg">{offer.status === 'ready' ? 'Ready to Send' : 'Missing Information'}</h3>
                <p className="text-sm mt-1 opacity-90 leading-relaxed">{offer.rationale}</p>
              </div>
            </div>

            {/* Missing Info (if any) */}
            {offer.missingClientInfo.length > 0 && (
              <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-red-100/50">
                <h3 className="text-xs font-bold text-red-600 mb-4 uppercase tracking-wider flex items-center">
                  <AlertCircle size={14} className="mr-2" />
                  Clarification Needed
                </h3>
                <ul className="space-y-3">
                  {offer.missingClientInfo.map((q, i) => (
                    <li key={i} className="flex items-center text-sm text-slate-700 bg-red-50/50 border border-red-100 p-3 rounded-xl">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-3 shrink-0"></span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* View Toggle */}
            <div className="flex justify-center items-center space-x-4">
              {offer.htmlContent && (
                <div className="bg-white/40 p-1 rounded-xl border border-white/50 flex space-x-1">
                  <button
                    onClick={() => { setHtmlMode(false); setIsEditing(false); }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!htmlMode ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Text Draft
                  </button>
                  <button
                    onClick={() => { setHtmlMode(true); setIsEditing(false); }}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${htmlMode ? 'bg-white shadow-sm text-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    HTML Design
                  </button>
                </div>
              )}
            </div>

            {/* The Draft - Paper Look */}
            <div className="bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col relative transform transition-all hover:translate-y-[-2px]">
              {/* Email Header */}
              <div className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex space-x-2">
                    {!htmlMode && !isEditing && (
                      <button
                        onClick={handleStartEdit}
                        className="flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <Edit3 size={12} />
                        <span>Edit Text</span>
                      </button>
                    )}
                    {!htmlMode && (
                      <button className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
                        <Copy size={12} />
                        <span>Copy Text</span>
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Subject</span>
                  <div className="text-lg font-semibold text-slate-900 mt-1">{offer.emailSubject}</div>
                </div>
              </div>

              {/* Email Body */}
              {isEditing ? (
                <div className="p-0">
                  <textarea
                    className="w-full h-[400px] p-8 text-slate-700 text-sm leading-7 font-medium outline-none resize-none bg-amber-50/30"
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                  />
                  <div className="p-4 bg-amber-50/50 border-t border-amber-100 flex justify-end space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-slate-500 text-sm font-bold hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 shadow-md flex items-center space-x-2"
                    >
                      <Save size={16} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              ) : (
                htmlMode && offer.htmlContent ? (
                  <div className="bg-slate-100 p-8 flex justify-center">
                    <div className="w-full max-w-[600px] bg-white shadow-sm">
                      <iframe
                        title="Email Preview"
                        srcDoc={offer.htmlContent}
                        className="w-full h-[600px] border-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-8 text-slate-700 prose prose-slate max-w-none text-sm leading-7 font-medium"
                    dangerouslySetInnerHTML={{ __html: offer.emailBody.replace(/\n/g, '<br/>') }}
                  />
                )
              )}

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-3">
                <button
                  onClick={() => setOffer(null)}
                  className="px-5 py-2.5 text-slate-500 text-sm font-bold hover:bg-slate-100 rounded-xl transition-colors flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Discard</span>
                </button>

                {currentOfferId && (
                  <button
                    onClick={handleDuplicate}
                    className="px-5 py-2.5 text-indigo-600 bg-indigo-50 text-sm font-bold hover:bg-indigo-100 rounded-xl transition-colors flex items-center space-x-2"
                  >
                    <CopyPlus size={16} />
                    <span>Duplicate</span>
                  </button>
                )}

                {!htmlMode && !offer.htmlContent ? (
                  <button
                    onClick={handleGenerateHtml}
                    disabled={isDesigning || isEditing}
                    className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg flex items-center space-x-2 hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70"
                  >
                    {isDesigning ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    <span>Approve & Design HTML</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSendEmail}
                    disabled={isSending}
                    className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all shadow-lg flex items-center space-x-2 hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70"
                  >
                    {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    <span>Send Email</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default OfferCreation;