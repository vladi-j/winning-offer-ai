import React, { useEffect, useState } from 'react';
import { BusinessProfile, OfferRecord } from '../types';
import { getOffers } from '../services/offerService';
import { Loader2, FileText, Calendar, ArrowRight, PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
    businessProfile: BusinessProfile;
    onEditOffer: (offer: OfferRecord) => void;
    onCreateNew: () => void;
}

const Dashboard: React.FC<Props> = ({ businessProfile, onEditOffer, onCreateNew }) => {
    const [offers, setOffers] = useState<OfferRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const data = await getOffers(businessProfile.id);
                setOffers(data);
            } catch (e) {
                console.error("Failed to fetch offers", e);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, [businessProfile.id]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <div className="p-8 h-full overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
                    <p className="text-slate-500 font-medium">Welcome back, {businessProfile.companyName}</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-black transition-all font-bold shadow-lg flex items-center space-x-2"
                >
                    <PlusCircle size={20} />
                    <span>New Offer</span>
                </button>
            </div>

            {offers.length === 0 ? (
                <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No offers yet</h3>
                    <p className="text-slate-500 mb-6 max-w-md">Start generating winning offers for your clients using your AI business profile.</p>
                    <button
                        onClick={onCreateNew}
                        className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center space-x-2"
                    >
                        <span>Create your first offer</span>
                        <ArrowRight size={16} />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer) => (
                        <div
                            key={offer.id}
                            onClick={() => onEditOffer(offer)}
                            className="bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-sm hover:shadow-lg hover:bg-white/60 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="text-indigo-600" />
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${offer.status === 'ready' ? 'bg-green-100/50 text-green-600' : 'bg-amber-100/50 text-amber-600'}`}>
                                    {offer.status === 'ready' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{offer.title}</h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{offer.client_request}</p>

                            <div className="flex items-center text-xs text-slate-400 font-medium">
                                <Calendar size={14} className="mr-2" />
                                {new Date(offer.updated_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
