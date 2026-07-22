'use client'
import { useState, useEffect } from 'react'
type Lead = { id?: string; name: string; address?: string; phone?: string; rating?: number; place_id?: string }
export default function Home() {
  const [query, setQuery] = useState('gym in Rajkot')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)
  const [pitch, setPitch] = useState('')
  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      if (data.leads) setLeads(data.leads)
    } catch {}
  }
  useEffect(() => { fetchLeads() }, [])
  const handleScrape = async () => {
    setLoading(true); setPitch('')
    try {
      const res = await fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) })
      const data = await res.json()
      if (data.leads) setLeads(data.leads)
    } catch {} finally { setLoading(false) }
  }
  const handleGenerate = async (lead: Lead) => {
    setGenerating(lead.name)
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead }) })
      const data = await res.json()
      setPitch(data.text || data.pitch || 'No pitch')
    } catch {} finally { setGenerating(null) }
  }
  return (
    <div className="min-h-screen p-4 md:p-8 bg-zinc-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">IntellectFlow - Sales Closer</h1>
        <div className="bg-white p-4 rounded-xl border flex gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 px-4 py-2 rounded-lg border" />
          <button onClick={handleScrape} disabled={loading} className="px-6 py-2.5 bg-black text-white rounded-lg disabled:opacity-50">{loading? 'Scraping...' : 'Scrape'}</button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-xl border">
            <div className="p-4 border-b font-semibold">Leads ({leads.length})</div>
            <div className="divide-y max-h-[600px] overflow-auto">
              {leads.map((lead, i) => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <div><div className="font-medium">{lead.name}</div><div className="text-sm text-zinc-500">{lead.address}</div></div>
                  <button onClick={() => handleGenerate(lead)} className="px-4 py-1.5 text-sm border rounded-lg">{generating === lead.name? '...' : 'Pitch'}</button>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4"><div className="font-semibold mb-3">Pitch</div><div className="text-sm whitespace-pre-wrap">{pitch || 'Pitch yahan ayega'}</div></div>
        </div>
      </div>
    </div>
  )
}
