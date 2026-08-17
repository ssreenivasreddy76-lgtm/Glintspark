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
    const leetcode = url.searchParams.get('leetcode') || ''
    const codeforces = url.searchParams.get('codeforces') || ''

    const calendarMap: Record<string, number> = {}

    // 1. Fetch LeetCode (Real-time GraphQL)
    if (leetcode) {
      try {
        const lcRes = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          body: JSON.stringify({
            query: `query getUserProfileCalendar($username: String!) { matchedUser(username: $username) { userCalendar { submissionCalendar } } }`,
            variables: { username: leetcode }
          })
        });

        if (lcRes.ok) {
          const lcData = await lcRes.json();
          const submissionCalendarStr = lcData?.data?.matchedUser?.userCalendar?.submissionCalendar;
          if (submissionCalendarStr) {
            const parsedCalendar = JSON.parse(submissionCalendarStr);
            for (const [timestampStr, count] of Object.entries(parsedCalendar)) {
              const date = new Date(parseInt(timestampStr) * 1000)
              const dateStr = date.toISOString().split('T')[0]
              calendarMap[dateStr] = (calendarMap[dateStr] || 0) + (count as number)
            }
          }
        }
      } catch (e) {
        console.error('LeetCode fetch error', e)
      }
    }

    // 2. Fetch Codeforces
    if (codeforces) {
      try {
        const cfRes = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(codeforces)}`)
        if (cfRes.ok) {
          const cfData = await cfRes.json()
          if (cfData.status === 'OK' && cfData.result) {
            cfData.result.forEach((sub: any) => {
              if (sub.creationTimeSeconds) {
                const date = new Date(sub.creationTimeSeconds * 1000)
                const dateStr = date.toISOString().split('T')[0]
                calendarMap[dateStr] = (calendarMap[dateStr] || 0) + 1
              }
            })
          }
        }
      } catch (e) {
        console.error('Codeforces fetch error', e)
      }
    }

    return new Response(JSON.stringify({ status: 'success', data: calendarMap }), {
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
