import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const handle = url.searchParams.get("handle");

    if (!handle) {
      return new Response(JSON.stringify({ error: "Handle is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch CodeChef Profile
    const profileRes = await fetch(
      `https://www.codechef.com/users/${handle}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    if (!profileRes.ok) {
      return new Response(
        JSON.stringify({
          error: `CodeChef profile not found or API error: ${profileRes.status}`,
        }),
        {
          status: profileRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await profileRes.text();

    // Parse Data from HTML
    let rating = 'Unrated';
    const settingsMatch = data.match(/jQuery\.extend\(Drupal\.settings, (.*?)\);/);
    if (settingsMatch) {
      try {
        const settings = JSON.parse(settingsMatch[1]);
        if (settings.date_versus_rating && settings.date_versus_rating.all && settings.date_versus_rating.all.length > 0) {
           const allContests = settings.date_versus_rating.all;
           rating = allContests[allContests.length - 1].rating;
        }
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
    } else {
        // Try to match the raw array from text in case parsing fails
        const ratingsArrayMatch = data.match(/\"all\":\[(.*?)\]/);
        if(ratingsArrayMatch) {
            const matches = ratingsArrayMatch[0].match(/\"rating\":\"(\d+)\"/g);
            if(matches && matches.length > 0) {
               rating = matches[matches.length-1].replace(/\"rating\":\"/, '').replace(/\"/, '');
            }
        }
    }
    
    // Global Rank
    let globalRank = 'Not Found';
    const globalRankRegex = /<strong>Global Rank<\/strong><\/label>\s*<span[^>]*>\s*<a[^>]*>(\d+)<\/a>/i;
    const grm = data.match(globalRankRegex) || data.match(/Global Rank.*?(\d+)/i) || data.match(/global-rank.*?(\d+)/i);
    if (grm) globalRank = grm[1];

    // Stars
    let stars = '1★';
    const starsRegex = /<span class=\"rating\"[^>]*>(.*?)★<\/span>/i;
    const sm = data.match(starsRegex) || data.match(/class=\"rating\">(.*?)★<\/span>/);
    if (sm) stars = `${sm[1]}★`;
    
    // highest rating
    let highestRating = 'Not Found';
    const highestRatingRegex = /Highest Rating (\d+)/i;
    const hm = data.match(highestRatingRegex) || data.match(/Highest Rating<\/small>\s*(\d+)/i) || data.match(/Highest Rating.*?(\d+)/i);
    if (hm) highestRating = hm[1];


    // Fully Solved
    let fullySolved = 'N/A';
    const solvedRegex = /Fully Solved \((.*?)\)/i;
    const solvedMatch = data.match(solvedRegex) || data.match(/Fully Solved.*?(\d+)/i) || data.match(/Total Problems Solved:.*?(\d+)/i);
    if (solvedMatch) {
      fullySolved = solvedMatch[1];
    } else {
      // Sometimes it is inside a section like "Problems Solved: 12"
      const match2 = data.match(/Problems Solved:\s*(\d+)/i);
      if (match2) fullySolved = match2[1];
    }


    const result = {
      username: handle,
      rating: rating,
      highestRating: highestRating,
      globalRank: globalRank,
      stars: stars,
      fullySolved: fullySolved,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error fetching CodeChef stats:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
