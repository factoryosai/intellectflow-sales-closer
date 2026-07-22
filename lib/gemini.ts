import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeBusiness(business: any) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `You are Intellect Flow sales analyst. Business: ${business.displayName?.text}, Rating: ${business.rating}, Reviews: ${business.userRatingCount}, Address: ${business.formattedAddress}. For Intellect Flow product: QR + AI Review Writer + AI Reply Generator + Negative Filter. Task: Find pain_point (low_reviews/no_reply/negative_reviews/no_website) and suggest_plan from ["Starter Rs 299 - QR only", "Growth Rs 599 - 50 AI Replies + Negative Filter + WhatsApp Reminder [BEST]", "Pro Rs 1299 - Unlimited Replies + GMB Posts + Website"]. Return ONLY JSON: {"pain_point":"","suggested_plan":"","reason":""}`;
  try {
    const res = await model.generateContent(prompt);
    let txt = res.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(txt);
  } catch { return { pain_point: "low_reviews", suggested_plan: "Growth Rs 599 - 50 AI Replies + Negative Filter + WhatsApp Reminder [BEST]", reason: "default" }; }
}

export async function createPersonalizedMessage(lead: any) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Write 3-line personalized WhatsApp first message in Hinglish for Rajkot business. Business: ${lead.business_name} is ${lead.niche} in ${lead.address}, Rating ${lead.rating} with ${lead.review_count} reviews. Pain: ${lead.pain_point}. Product: Intellect Flow by Heer Patel, ${lead.suggested_plan}. Rules: Start with business name, mention rating/reviews to show research, pitch ONE feature, end with "2 min me demo dikha du?" Max 4 lines.`;
  const res = await model.generateContent(prompt);
  return res.response.text().trim();
}

export async function generateCloserReply(clientMsg: string, lead: any) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `You are AI Sales Closer for Intellect Flow (Rajkot). Plans: Starter 299: QR only, Growth 599 BEST: 50 AI Reply Generator + Negative Filter + WhatsApp Reminder, Pro 1299: Unlimited. Lead: ${lead.business_name}, Plan: ${lead.suggested_plan}. Client said: "${clientMsg}". Goal: Convince to buy, push Growth 599. Mention no GMB verification needed, 1-click copy. Keep Hinglish, short 2-3 lines.`;
  const res = await model.generateContent(prompt);
  return res.response.text().trim();
}
