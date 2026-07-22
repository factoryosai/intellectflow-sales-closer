import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateCloserReply } from "@/lib/gemini";
import { sendWhatsApp } from "@/lib/evolution";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const from = body.data?.key?.remoteJid?.replace("@s.whatsapp.net", "") || body.data?.pushName;
    const clientMsg = body.data?.message?.conversation || body.data?.message?.extendedTextMessage?.text || "";
    if (!from || !clientMsg) return NextResponse.json({ ok: true });
    const supabase = supabaseAdmin();
    const { data: lead } = await supabase.from("leads").select("*").ilike("phone", `%${from.slice(-10)}%`).maybeSingle();
    if (!lead) return NextResponse.json({ ok: true });
    const reply = await generateCloserReply(clientMsg, lead);
    await sendWhatsApp(lead.phone, reply);
    await supabase.from("leads").update({ status: "Replied" }).eq("id", lead.id);
    return NextResponse.json({ reply });
  } catch (e) { return NextResponse.json({ ok: true }); }
}
