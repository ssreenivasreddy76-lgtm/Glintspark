import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email, otp } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (action === 'send-otp') {
      // 1. Find user with this backup email
      const { data: users, error: dbError } = await supabaseClient
        .from('users')
        .select('id, name')
        .eq('backup_email', email)

      if (dbError || !users || users.length === 0) {
        return new Response(JSON.stringify({ error: 'Backup email not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }

      // 2. Generate 6 digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()

      // 3. Save OTP to DB
      await supabaseClient
        .from('users')
        .update({ backup_otp: generatedOtp })
        .eq('id', users[0].id)

      // 4. Send Email via Resend
      const resendApiKey = Deno.env.get('RESEND_API_KEY')
      if (resendApiKey) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'GlintSpark Recovery <noreply@glintspark.in>',
            to: email,
            subject: 'Your GlintSpark Account Recovery Code',
            html: `<h2>Account Recovery</h2><p>Your recovery code is: <strong>${generatedOtp}</strong></p><p>If you did not request this, please ignore this email.</p>`
          })
        })
        if (!res.ok) {
          console.error("Resend Error", await res.text())
        }
      } else {
        console.log(`[MOCK EMAIL] OTP for ${email} is ${generatedOtp}`)
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'verify-otp') {
      // 1. Find user with this backup email and OTP
      const { data: users, error: dbError } = await supabaseClient
        .from('users')
        .select('id, backup_otp')
        .eq('backup_email', email)

      if (dbError || !users || users.length === 0 || users[0].backup_otp !== otp) {
        return new Response(JSON.stringify({ error: 'Invalid OTP' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // 2. OTP is valid! We need to log the user in.
      const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(users[0].id)
      
      if (authError || !authUser.user) {
        return new Response(JSON.stringify({ error: 'Original user not found in Auth' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }

      // 3. Clear OTP
      await supabaseClient.from('users').update({ backup_otp: null }).eq('id', users[0].id)

      // 4. Update their primary email to the backup email
      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(users[0].id, {
        email: email,
        email_confirm: true
      })

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // 5. Generate a Magic Link to log them in right now
      const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
        type: 'magiclink',
        email: email
      })

      return new Response(JSON.stringify({ success: true, link: linkData?.properties?.action_link }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
