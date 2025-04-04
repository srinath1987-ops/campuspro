import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url);
      const rfid_id = url.searchParams.get('rfid_id');
      if (!rfid_id) {
        throw new Error('rfid_id is required');
      }
      const { data, error } = await supabase.from('bus_details').select('in_campus').eq('rfid_id', rfid_id).single();
      if (error) {
        throw new Error(`Failed to fetch bus status: ${error.message}`);
      }
      return new Response(JSON.stringify({
        in_campus: data.in_campus
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      });
    } catch (error) {
      console.error(`Error fetching bus status:`, error.message);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
  }
  return new Response(JSON.stringify({
    error: 'Method not allowed'
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 405
  });
});
