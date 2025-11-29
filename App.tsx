import React, { useState, useEffect } from 'react';
import { useBusinessProfile } from './hooks/useBusinessProfile';
import { AppView, BusinessProfile } from './types';
import Sidebar from './components/Sidebar';
import BusinessOnboarding from './components/BusinessOnboarding';
import OfferCreation from './components/OfferCreation';
import { PlusCircle, History, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  const { profile: businessProfile, loading, saveProfile } = useBusinessProfile();
  const [currentView, setCurrentView] = useState<AppView>(AppView.ONBOARDING);

  // Effect to redirect to dashboard if profile exists and we are on onboarding
  useEffect(() => {
    if (!loading && businessProfile && currentView === AppView.ONBOARDING) {
      setCurrentView(AppView.OFFER_CREATION);
    }
  }, [loading, businessProfile]);

  const handleSaveProfile = async (profile: BusinessProfile) => {
    await saveProfile(profile);
    setCurrentView(AppView.OFFER_CREATION);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading your business profile...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <div className="p-8 h-full overflow-y-auto no-scrollbar">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
            <p className="text-slate-500 mb-8 font-medium">Overview of your AI sales performance</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Glass Stat Cards */}
              <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-lg hover:bg-white/50 transition-all">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-100/50 rounded-xl text-blue-600">
                    <CheckCircle size={20} />
                  </div>
                  <h3 className="text-slate-600 text-sm font-semibold">Offers Generated</h3>
                </div>
                <p className="text-4xl font-bold text-slate-800 mt-2">12</p>
              </div>
              <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-lg hover:bg-white/50 transition-all">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-indigo-100/50 rounded-xl text-indigo-600">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-slate-600 text-sm font-semibold">Time Saved</h3>
                </div>
                <p className="text-4xl font-bold text-slate-800 mt-2">48h</p>
              </div>
              <div className="bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-lg hover:bg-white/50 transition-all">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-emerald-100/50 rounded-xl text-emerald-600">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="text-slate-600 text-sm font-semibold">Conversion Rate</h3>
                </div>
                <p className="text-4xl font-bold text-slate-800 mt-2">64%</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h2>
              <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-lg overflow-hidden divide-y divide-white/40">
                <div className="p-5 flex items-center justify-between hover:bg-white/40 transition-colors cursor-pointer group">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/60 p-3 rounded-2xl text-indigo-600 shadow-sm"><History size={20} /></div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Offer for TechCorp Inc.</p>
                      <p className="text-sm text-slate-500">Sent 2 hours ago • $12,500 value</p>
                    </div>
                  </div>
                  <span className="text-xs bg-white/60 text-slate-600 px-3 py-1.5 rounded-full font-medium shadow-sm">View Details</span>
                </div>
                <div className="p-5 flex items-center justify-between hover:bg-white/40 transition-colors cursor-pointer group">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/60 p-3 rounded-2xl text-indigo-600 shadow-sm"><History size={20} /></div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Proposal for Local Logistics</p>
                      <p className="text-sm text-slate-500">Sent yesterday • Waiting response</p>
                    </div>
                  </div>
                  <span className="text-xs bg-white/60 text-slate-600 px-3 py-1.5 rounded-full font-medium shadow-sm">View Details</span>
                </div>
              </div>
            </div>
          </div>
        );
      case AppView.ONBOARDING:
        return (
          <div className="h-full flex flex-col p-6 overflow-hidden">
            <div className="mb-4 shrink-0">
              <h1 className="text-2xl font-bold text-slate-800">Business Knowledge Base</h1>
              <p className="text-slate-500 font-medium">Teach the AI about your business so it can sell for you.</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <BusinessOnboarding
                initialProfile={businessProfile || undefined}
                onSave={handleSaveProfile}
              />
            </div>
          </div>
        );
      case AppView.OFFER_CREATION:
        if (!businessProfile) {
          return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="bg-white/30 backdrop-blur-2xl p-10 rounded-3xl shadow-xl border border-white/40 max-w-md">
                <div className="bg-white/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <PlusCircle size={32} className="text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">No Business Profile</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">You need to set up your business knowledge base before you can generate magic offers.</p>
                <button
                  onClick={() => setCurrentView(AppView.ONBOARDING)}
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl hover:bg-black hover:scale-105 transition-all font-medium shadow-lg"
                >
                  Start Onboarding
                </button>
              </div>
            </div>
          )
        }
        return (
          <div className="h-full flex flex-col p-6 overflow-hidden">
            <div className="mb-4 shrink-0">
              <h1 className="text-2xl font-bold text-slate-800">Create New Offer</h1>
              <p className="text-slate-500 font-medium">AI-Assisted drafting based on your business profile.</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <OfferCreation businessProfile={businessProfile} />
            </div>
          </div>
        );
      default:
        return <div>Not Implemented</div>;
    }
  };

  return (
    <div className="flex h-screen w-screen gap-4 p-4">
      <Sidebar
        currentView={currentView}
        onChangeView={setCurrentView}
        hasProfile={!!businessProfile}
      />
      {/* Floating Main Content Panel */}
      <main className="flex-1 h-full bg-white/30 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-2xl overflow-hidden relative transition-all">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;