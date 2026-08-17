import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const handle = url.searchParams.get('handle') || ''

    if (!handle) {
      return new Response(JSON.stringify({ error: 'Handle is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`)
    const data = await res.json()

    if (!res.ok || data.status !== 'OK') {
      return new Response(JSON.stringify({ error: 'Could not fetch profile' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: res.status !== 200 ? res.status : 400,
      })
    }

    const user = data.result[0]
    
    // We fetch user.status separately to get solved count if needed in the future, 
    // but Profile.tsx currently only needs rating info
    const payload = {
      status: 'success',
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || 'Unrated',
      maxRank: user.maxRank || 'Unrated',
      contribution: user.contribution || 0,
    }

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
