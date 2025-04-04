
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Set up CORS headers for the function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { rfid_id, event_type } = await req.json()
    console.log(`Processing ${event_type} event for RFID: ${rfid_id}`)
    
    if (!rfid_id || !event_type) {
      throw new Error('Missing required parameters: rfid_id or event_type')
    }
    
    // Validate event_type
    if (event_type !== 'entry' && event_type !== 'exit') {
      throw new Error('Invalid event_type. Must be "entry" or "exit"')
    }
    
    // Get current timestamp
    const now = new Date()
    const currentTime = now.toISOString()
    const currentDate = now.toISOString().split('T')[0]
    
    // Find the bus with this RFID
    const { data: busData, error: busError } = await supabase
      .from('bus_details')
      .select('*')
      .eq('rfid_id', rfid_id)
      .single()
    
    if (busError) {
      throw new Error(`Bus not found with RFID: ${rfid_id}`)
    }
    
    // Update bus status based on event type
    if (event_type === 'entry') {
      // Entry Event - Update bus_details
      const { error: updateError } = await supabase
        .from('bus_details')
        .update({ 
          in_campus: true,
          in_time: currentTime
        })
        .eq('rfid_id', rfid_id)
      
      if (updateError) {
        throw new Error(`Failed to update bus status: ${updateError.message}`)
      }
      
      // Record entry in bus_times table
      const { error: entryError } = await supabase
        .from('bus_times')
        .insert({
          bus_number: busData.bus_number,
          rfid_id: rfid_id,
          in_time: currentTime,
          date_in: currentDate
        })
      
      if (entryError) {
        console.error(`Warning: Failed to record entry time: ${entryError.message}`)
        // Continue execution even if this fails
      }
    } else {
      // Exit Event - Update bus_details
      const { error: updateError } = await supabase
        .from('bus_details')
        .update({ 
          in_campus: false,
          out_time: currentTime
        })
        .eq('rfid_id', rfid_id)
      
      if (updateError) {
        throw new Error(`Failed to update bus status: ${updateError.message}`)
      }
      
      // Find the latest entry record for this bus and update it with exit time
      const { data: timeData, error: timeError } = await supabase
        .from('bus_times')
        .select('*')
        .eq('rfid_id', rfid_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (!timeError && timeData) {
        // Update the record with exit time
        const { error: exitError } = await supabase
          .from('bus_times')
          .update({ 
            out_time: currentTime,
            date_out: currentDate
          })
          .eq('id', timeData.id)
        
        if (exitError) {
          console.error(`Warning: Failed to record exit time: ${exitError.message}`)
          // Continue execution even if this fails
        }
      }
    }
    
    // Return success response
    const responseBody = {
      success: true,
      message: `Bus ${busData.bus_number} ${event_type === 'entry' ? 'entered' : 'exited'} successfully`,
      timestamp: currentTime,
      bus_number: busData.bus_number
    }
    
    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
    
  } catch (error) {
    // Log and return error
    console.error(`Error processing request:`, error.message)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
