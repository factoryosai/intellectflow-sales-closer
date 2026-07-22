import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/maps";
import { analyzeBusiness } from "@/lib/gemini";
import { supabaseAdmin } from "@/lib/supabase";
export async function POST(req: Request) {
  try {
    const { keyword, location } = await req.json();
    const places = await searchPlaces(keyword, location);
    const supabase = supabaseAdmin();
    let saved = 0;
    for (const place of places) {
      const phone = place.nationalPhoneNumber || "";
      if (!phone) continue;
      const analysis = await analyzeBusiness(place);
      const { data: existing } = await supabase.from("leads").select("id").eq("phone", phone).maybeSingle();
      if (existing) continue;
      await supabase.from("leads").insert({
        business_name: place.displayName?.text || "Unknown",
        niche: keyword,
        address: place.formattedAddress || "",
        phone: phone,
        rating: place.rating || 0,
        review_count: place.userRatingCount || 0,
        website: place.websiteUri || null,
        pain_point: analysis.pain_point,
        suggested_plan: analysis.suggested_plan,
        status: "New"
      });
      saved++;
    }
    return NextResponse.json({ success: true, found: places.length, saved });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
