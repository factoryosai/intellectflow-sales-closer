import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/maps";
import { analyzeBusiness } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase";
export async function POST(req: Request) {
  try {
    const { keyword, location } = await req.json();
    if (!keyword) return NextResponse.json({ error: "keyword required" }, { status: 400 });
    const places = await searchPlaces(keyword, location || "Rajkot");
    const supabase = supabaseAdmin();
    let saved = 0;
    for (const place of places) {
      try {
        const phone = place.nationalPhoneNumber || "";
        const businessName = place.displayName?.text || "Unknown";
        if (phone) {
          const { data: existing } = await supabase.from("leads").select("id").eq("phone", phone).maybeSingle();
          if (existing) continue;
        }
        let analysis: any;
        try {
          analysis = await analyzeBusiness(place);
        } catch {
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
      } catch { continue; }
    }
    return NextResponse.json({ success: true, found: places.length, saved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
