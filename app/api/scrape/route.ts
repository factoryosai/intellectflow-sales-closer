import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/maps";
import { analyzeBusiness } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { keyword, location } = await req.json();
    if (!keyword) return NextResponse.json({ error: "keyword required" }, { status: 400 });
    
    const places = await searchPlaces(keyword, location || "Rajkot");
    console.log("Places found:", places.length);
    
    const supabase = supabaseAdmin();
    let saved = 0;
    
    for (const place of places) {
      try {
        const phone = place.nationalPhoneNumber || "";
        // Phone check hataya - bina phone ke bhi save karo
        const businessName = place.displayName?.text || "Unknown";

        // Sirf tab check karo agar phone hai to
        if (phone) {
          const { data: existing } = await supabase.from("leads").select("id").eq("phone", phone).maybeSingle();
          if (existing) continue;
        }

        let analysis;
        try {
          analysis = await analyzeBusiness(place);
        } catch (e) {
          analysis = { pain_point: "Low online visibility", suggested_plan: "Website + Google Profile" };
        }

        const { error } = await supabase.from("leads").insert({
          business_name: businessName,
          niche: keyword,
          address: place.formattedAddress || "",
          phone: phone || "N/A",
          rating: place.rating || 0,
          review_count: place.userRatingCount || 0,
          website: place.websiteUri || null,
          pain_point: analysis.pain_point,
          suggested_plan: analysis.suggested_plan,
          status: "New"
        });
        
        if (!error) saved++;
        else console.log("Insert error:", error.message);

      } catch (innerErr) {
        console.log("Lead skip:", innerErr);
        continue;
      }
    }
    return NextResponse.json({ success: true, found: places.length, saved });
  } catch (e: any { 
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 }); 
  }
}
