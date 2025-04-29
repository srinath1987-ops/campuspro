
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
  try {
    const { rfid_id, event_type, timestamp } = await req.json();
    console.log(`Processing ${event_type} event for RFID: ${rfid_id} at ${timestamp}`);
    
    if (!rfid_id || !event_type || !timestamp) {
      throw new Error('Missing required parameters: rfid_id, event_type, or timestamp');
    }
    
    if (event_type !== 'entry' && event_type !== 'exit') {
      throw new Error('Invalid event_type. Must be "entry" or "exit"');
    }
    
    const currentTime = timestamp;
    const currentDate = timestamp.split('T')[0];
    
    // First check if the bus exists
    const { data: busData, error: busError } = await supabase
      .from('bus_details')
      .select('*')
      .eq('rfid_id', rfid_id)
      .single();
    
    if (busError) {
      throw new Error(`Bus not found with RFID: ${rfid_id}`);
    }
    
    // Always ensure driver_name has a value before proceeding
    const driverName = busData.driver_name || 'Unknown Driver';
    if (!busData.driver_name) {
      // Update the driver name to a default value if missing
      const { error: updateDriverError } = await supabase
        .from('bus_details')
        .update({ driver_name: driverName })
        .eq('rfid_id', rfid_id);
        
      if (updateDriverError) {
        console.error(`Warning: Failed to set default driver name: ${updateDriverError.message}`);
      }
    }
    
    if (event_type === 'entry') {
      const { error: updateError } = await supabase
        .from('bus_details')
        .update({
          in_campus: true,
          in_time: currentTime,
          last_updated: new Date().toISOString()
        })
        .eq('rfid_id', rfid_id);
      
      if (updateError) {
        throw new Error(`Failed to update bus status: ${updateError.message}`);
      }
      
      const { error: entryError } = await supabase
        .from('bus_times')
        .insert({
          bus_number: busData.bus_number,
          rfid_id: rfid_id,
          in_time: currentTime,
          date_in: currentDate
        });
        
      if (entryError) {
        console.error(`Warning: Failed to record entry time: ${entryError.message}`);
      }
    } else {
      const { error: updateError } = await supabase.from('bus_details').update({
        in_campus: false,
        out_time: currentTime,
        last_updated: new Date().toISOString()
      }).eq('rfid_id', rfid_id);
      if (updateError) {
        throw new Error(`Failed to update bus status: ${updateError.message}`);
      }
      const { data: timeData, error: timeError } = await supabase.from('bus_times').select('*').eq('rfid_id', rfid_id).order('created_at', {
        ascending: false
      }).limit(1).single();
      if (!timeError && timeData) {
        const { error: exitError } = await supabase.from('bus_times').update({
          out_time: currentTime,
          date_out: currentDate
        }).eq('id', timeData.id);
        if (exitError) {
          console.error(`Warning: Failed to record exit time: ${exitError.message}`);
        }
      }
    }
    
    const responseBody = {
      success: true,
      message: `Bus ${busData.bus_number} ${event_type === 'entry' ? 'entered' : 'exited'} successfully`,
      timestamp: currentTime,
      bus_number: busData.bus_number
    };
    
    return new Response(JSON.stringify(responseBody), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error(`Error processing request:`, error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
