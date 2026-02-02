/**
 * Supabase Client Configuration
 * This file initializes the Supabase client using environment variables.
 * For Netlify, ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in the Build & Deploy settings.
 */

// We use the Supabase JS library via CDN in the HTML files.
// This script assumes 'supabase' is globally available.

const textUrl = window.env?.TEXT_SUPABASE_URL || '';
const textKey = window.env?.TEXT_SUPABASE_ANON_KEY || '';
const mediaUrl = window.env?.MEDIA_SUPABASE_URL || '';
const mediaKey = window.env?.MEDIA_SUPABASE_ANON_KEY || '';

if (!textUrl || !textKey) {
    console.error('Supabase Text DB configuration missing!');
}

// Client 1: Specifically for Database operations (Text)
const supabaseText = supabase.createClient(textUrl, textKey);

// Client 2: Specifically for Storage operations (Media)
const supabaseMedia = (mediaUrl && mediaKey)
    ? supabase.createClient(mediaUrl, mediaKey)
    : supabaseText; // Fallback to Project A if Project B isn't set yet

// Global access
window.supabaseText = supabaseText;
window.supabaseMedia = supabaseMedia;
window.supabaseClient = supabaseText; // Global backward compatibility
