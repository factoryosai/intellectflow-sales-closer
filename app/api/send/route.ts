import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendWhatsApp } from "@/lib/evolution";
export async function POST(req: Request) {
  try {
    const { lead_id } = await req.json();
    const supabase = supabaseAdmin();
    const { data: lead } = await supabase.from("leads").select("*").eq("id", lead_id).single();
    if (!lead?.whatsapp_message) return NextResponse.json({ error: "Generate message first" }, { status: 400 });
    await sendWhatsApp(lead.phone, lead.whatsapp_message);
    await supabase.from("leads").update({ status: "Contacted" }).eq("id", lead_id);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
