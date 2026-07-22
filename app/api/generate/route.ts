import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createPersonalizedMessage } from "@/lib/gemini";
export async function POST(req: Request) {
  const { lead_id } = await req.json();
  const supabase = supabaseAdmin();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", lead_id).single();
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const msg = await createPersonalizedMessage(lead);
  await supabase.from("leads").update({ whatsapp_message: msg }).eq("id", lead_id);
  return NextResponse.json({ message: msg });
}
