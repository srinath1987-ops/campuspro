
// HTTP Bus Entry/Exit Function
// This function handles bus entry and exit events from the ESP32 controllers

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials')
    }

    // Create Supabase client with service role key for admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const body = await req.json()
    const { rfid_id, event_type } = body

    // Validate required fields
    if (!rfid_id || !event_type) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: rfid_id and event_type are required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    if (event_type !== 'entry' && event_type !== 'exit') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid event_type: must be either "entry" or "exit"' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log(`Processing ${event_type} event for RFID: ${rfid_id}`)

    // Call the database function to update bus status
    const { data, error } = await supabase.rpc('update_bus_status', {
      rfid_id,
      event_type,
    })

    if (error) {
      console.error('Error updating bus status:', error)
      throw error
    }

    // Also log the entry/exit to the bus_times table for historical tracking
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    // Get the bus_number from rfid_id
    const { data: busData, error: busError } = await supabase
      .from('bus_details')
      .select('bus_number')
      .eq('rfid_id', rfid_id)
      .single()
      
    if (busError) {
      console.error('Error fetching bus details:', busError)
      throw busError
    }
    
    if (!busData) {
      throw new Error('Bus not found with provided RFID')
    }
    
    // Insert entry in bus_times table
    if (event_type === 'entry') {
      await supabase
        .from('bus_times')
        .upsert({
          rfid_id,
          bus_number: busData.bus_number,
          in_time: now.toISOString(),
          date_in: today,
        }, { onConflict: 'bus_number,date_in' })
    } else {
      // For exit, update the existing record
      const { data: entryData } = await supabase
        .from('bus_times')
        .select('id')
        .eq('bus_number', busData.bus_number)
        .eq('date_in', today)
        .maybeSingle()
        
      if (entryData?.id) {
        await supabase
          .from('bus_times')
          .update({
            out_time: now.toISOString(),
            date_out: today,
          })
          .eq('id', entryData.id)
      } else {
        // If no entry record found, create a new one
        await supabase
          .from('bus_times')
          .insert({
            rfid_id,
            bus_number: busData.bus_number,
            out_time: now.toISOString(),
            date_out: today,
          })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        event_type,
        message: `Bus ${event_type} processed successfully` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in bus entry/exit function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
