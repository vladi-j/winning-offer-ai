import React, { useState, useEffect } from 'react';
import { useBusinessProfile } from './hooks/useBusinessProfile';
import { AppView, BusinessProfile } from './types';
import Sidebar from './components/Sidebar';
import BusinessOnboarding from './components/BusinessOnboarding';
import OfferCreation from './components/OfferCreation';
import Dashboard from './components/Dashboard';
import { PlusCircle, History, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { OfferRecord } from './types';

import Auth from './components/Auth';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const { profile: businessProfile, loading, saveProfile, refreshProfile } = useBusinessProfile();
  const [currentView, setCurrentView] = useState<AppView>(AppView.ONBOARDING);
  const [selectedOffer, setSelectedOffer] = useState<OfferRecord | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        refreshProfile(); // Refresh profile when user logs in
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Effect to redirect to dashboard if profile exists and we are on onboarding
  useEffect(() => {
    if (!loading && businessProfile && currentView === AppView.ONBOARDING) {
      setCurrentView(AppView.DASHBOARD);
    }
  }, [loading, businessProfile]);

  if (!session) {
    return <Auth />;
  }

  const handleSaveProfile = async (profile: BusinessProfile) => {
    await saveProfile(profile);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleEditOffer = (offer: OfferRecord) => {
    setSelectedOffer(offer);
    setCurrentView(AppView.OFFER_CREATION);
  };

  const handleCreateNew = () => {
    setSelectedOffer(null);
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
        if (!businessProfile) return null; // Should not happen due to redirect
        return (
          <Dashboard
            businessProfile={businessProfile}
            onEditOffer={handleEditOffer}
            onCreateNew={handleCreateNew}
          />
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
              <h1 className="text-2xl font-bold text-slate-800">{selectedOffer ? 'Edit Offer' : 'Create New Offer'}</h1>
              <p className="text-slate-500 font-medium">AI-Assisted drafting based on your business profile.</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <OfferCreation
                businessProfile={businessProfile}
                initialOffer={selectedOffer}
                onBack={() => setCurrentView(AppView.DASHBOARD)}
              />
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