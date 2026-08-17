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

    // Fetch HackerRank Profile
    const profileRes = await fetch(
      `https://www.hackerrank.com/rest/contests/master/hackers/${handle}/profile`,
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
          error: `HackerRank profile not found or API error: ${profileRes.status}`,
        }),
        {
          status: profileRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const profileData = await profileRes.json();
    const model = profileData.model;

    // Fetch HackerRank Badges to compute problems solved and stars
    const badgesRes = await fetch(
      `https://www.hackerrank.com/rest/hackers/${handle}/badges`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    let totalSolved = 0;
    let highestStars = 0;
    let rank = "Unranked";
    let badges = [];

    if (badgesRes.ok) {
      const badgesData = await badgesRes.json();
      if (badgesData && badgesData.models) {
        badges = badgesData.models;
        badges.forEach((badge: any) => {
          totalSolved += badge.solved || 0;
          if (badge.stars && badge.stars > highestStars) {
            highestStars = badge.stars;
          }
          // We could try to find the best rank
        });
      }
    }

    const result = {
      username: handle,
      name: model.name || handle,
      level: model.level,
      followers: model.followers_count,
      totalSolved: totalSolved,
      highestStars: highestStars,
      badges: badges.map((b: any) => ({
        name: b.badge_name,
        stars: b.stars,
        solved: b.solved,
      })),
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error fetching HackerRank stats:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
