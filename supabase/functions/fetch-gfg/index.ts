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

    // Fetch the GeeksForGeeks profile page
    const profileUrl = `https://www.geeksforgeeks.org/user/${encodeURIComponent(handle)}/`
    const res = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Could not fetch profile' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: res.status,
      })
    }

    const html = await res.text()

    // Parse the embedded Next.js JSON payload or HTML content using Regex
    // The quotes might be escaped like \"score\":97
    const scoreMatch = html.match(/(?:\\"|")score(?:\\"|"):(\d+)/)
    const monthlyScoreMatch = html.match(/(?:\\"|")monthly_score(?:\\"|"):(\d+)/)
    const problemsMatch = html.match(/(?:\\"|")total_problems_solved(?:\\"|"):(\d+)/)
    const rankMatch = html.match(/(?:\\"|")institute_rank(?:\\"|"):(?:\\"|")([^"\\]*)(?:\\"|")/)

    const codingScore = scoreMatch ? parseInt(scoreMatch[1]) : 0
    const monthlyCodingScore = monthlyScoreMatch ? parseInt(monthlyScoreMatch[1]) : 0
    const totalProblemsSolved = problemsMatch ? parseInt(problemsMatch[1]) : 0
    const instituteRank = rankMatch && rankMatch[1] !== '' ? rankMatch[1] : '-'

    const payload = {
      info: {
        codingScore,
        monthlyCodingScore,
        totalProblemsSolved,
        instituteRank
      }
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
