export async function sendWhatsApp(phone: string, text: string) {
  const url = `${process.env.EVOLUTION_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`;
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 10) clean = '91' + clean;
  const res = await fetch(url, {
    method: "POST",
    headers: { "apikey": process.env.EVOLUTION_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({ number: clean, text: text, options: { delay: 1200, presence: "composing" } })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}
