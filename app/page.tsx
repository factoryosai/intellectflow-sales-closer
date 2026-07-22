"use client";
import { useEffect, useState } from "react";
type Lead = any;

export default function Admin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("salon");
  const [city, setCity] = useState("Rajkot");

  const fetchLeads = async () => {
    const res = await fetch("/api/leads");
    const data = await res.json();
    setLeads(Array.isArray(data) ? data : []);
  };
  useEffect(() => { fetchLeads(); }, []);

  const handleScrape = async () => {
    setLoading(true);
    await fetch("/api/scrape", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keyword, location: city }) });
    await fetchLeads();
    setLoading(false);
  };
  const handleGenerate = async (id: string) => {
    await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lead_id: id }) });
    fetchLeads();
  };
  const handleSend = async (id: string) => {
    if(!confirm("WhatsApp bhejna hai?")) return;
    await fetch("/api/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lead_id: id }) });
    fetchLeads();
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto
