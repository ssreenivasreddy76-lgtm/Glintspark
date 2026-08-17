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

    const query = `
      query getUserProfile($username: String!) {
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $username) {
          profile {
            ranking
          }
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
      }
    `

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        query,
        variables: { username: handle }
      })
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Could not fetch profile' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: res.status,
      })
    }

    const data = await res.json()
    
    if (data.errors || !data.data || !data.data.matchedUser) {
        return new Response(JSON.stringify({ status: 'error', message: 'User not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
        })
    }

    const matchedUser = data.data.matchedUser
    const acSubmissionNum = matchedUser.submitStats.acSubmissionNum
    
    let totalSolved = 0, easySolved = 0, mediumSolved = 0, hardSolved = 0
    let totalSubmissions = 0
    
    acSubmissionNum.forEach((item: any) => {
        if (item.difficulty === 'All') {
            totalSolved = item.count
            totalSubmissions = item.submissions
        }
        if (item.difficulty === 'Easy') easySolved = item.count
        if (item.difficulty === 'Medium') mediumSolved = item.count
        if (item.difficulty === 'Hard') hardSolved = item.count
    })

    // Approximate acceptance rate
    const acceptanceRate = totalSubmissions > 0 ? ((totalSolved / totalSubmissions) * 100).toFixed(1) : 0

    const payload = {
      status: 'success',
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      acceptanceRate,
      ranking: matchedUser.profile.ranking
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
