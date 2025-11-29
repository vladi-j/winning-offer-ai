import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { BusinessProfile } from '../types';

export function useBusinessProfile() {
    const [profile, setProfile] = useState<BusinessProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('business_profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                throw error;
            }

            if (data) {
                // Map snake_case DB fields to camelCase TS types
                setProfile({
                    id: data.id,
                    companyName: data.company_name,
                    industry: data.industry,
                    knowledgeBase: data.knowledge_base || [],
                    caseStudies: data.case_studies || [],
                    pastEmails: data.past_emails || [],
                    branding: data.branding || {
                        primaryColor: '#4f46e5',
                        fontName: 'Inter',
                        toneOfVoice: 'professional'
                    },
                    isVerified: data.is_verified
                });
            }
        } catch (err: any) {
            console.error('Error fetching profile:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function saveProfile(newProfile: BusinessProfile) {
        try {
            setLoading(true);

            // Map camelCase TS types to snake_case DB fields
            const dbPayload = {
                company_name: newProfile.companyName,
                industry: newProfile.industry,
                knowledge_base: newProfile.knowledgeBase,
                case_studies: newProfile.caseStudies,
                past_emails: newProfile.pastEmails,
                branding: newProfile.branding,
                is_verified: newProfile.isVerified
            };

            let result;
            if (profile?.id) {
                // Update existing
                result = await supabase
                    .from('business_profiles')
                    .update(dbPayload)
                    .eq('id', profile.id)
                    .select()
                    .single();
            } else {
                // Insert new
                result = await supabase
                    .from('business_profiles')
                    .insert(dbPayload)
                    .select()
                    .single();
            }

            if (result.error) throw result.error;

            if (result.data) {
                setProfile({
                    ...newProfile,
                    id: result.data.id
                });
            }

            return result.data;
        } catch (err: any) {
            console.error('Error saving profile:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }

    return { profile, loading, error, saveProfile, refreshProfile: fetchProfile };
}
