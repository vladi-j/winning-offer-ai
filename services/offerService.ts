import { supabase } from './supabaseClient';
import { GeneratedOffer, OfferRecord } from '../types';

export const saveOffer = async (
    offer: GeneratedOffer,
    clientRequest: string,
    businessId: string
): Promise<OfferRecord> => {
    const { data, error } = await supabase
        .from('offers')
        .insert({
            business_id: businessId,
            client_request: clientRequest,
            offer_data: offer,
            title: offer.emailSubject || 'Untitled Offer',
            status: 'draft'
        })
        .select()
        .single();

    if (error) throw error;
    return data as OfferRecord;
};

export const updateOffer = async (
    id: string,
    updates: Partial<OfferRecord> | { offer_data: GeneratedOffer }
): Promise<void> => {
    const { error } = await supabase
        .from('offers')
        .update(updates)
        .eq('id', id);

    if (error) throw error;
};

export const duplicateOffer = async (originalOffer: OfferRecord): Promise<OfferRecord> => {
    const { data, error } = await supabase
        .from('offers')
        .insert({
            business_id: originalOffer.business_id,
            client_request: originalOffer.client_request,
            offer_data: originalOffer.offer_data,
            title: `${originalOffer.title} (Copy)`,
            status: 'draft'
        })
        .select()
        .single();

    if (error) throw error;
    return data as OfferRecord;
};

export const getOffers = async (businessId: string): Promise<OfferRecord[]> => {
    const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as OfferRecord[];
};
