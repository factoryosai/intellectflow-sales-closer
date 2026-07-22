'use client'

import { useState, useEffect } from 'react'

type Lead = {
  id?: string
  name: string
  address?: string
  phone?: string
  rating?: number
  place_id?: string
}

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
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const handleScrape = async () => {
    setLoading(true)
    setPitch('')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      if (data.leads) {
        setLeads(data.leads)
      } else {
        alert(data.error || 'Scrape failed')
      }
    } catch (err) {
      alert('Scrape error')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (lead: Lead) => {
    setGenerating(lead.name)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead })
      })
      const data = await res.json()
      setPitch(data.text || data.pitch || 'No pitch generated')
    } catch {
      alert('Generate failed')
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">IntellectFlow - Sales Closer</h1>
          <p className="text-zinc-500">Google Maps se leads nikalo, Gemini se pitch banao, Supabase me save karo</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: dentist in Ahmedabad"
            className="flex-1 px-4 py-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={handleScrape}
            disabled={loading}
            className="px-6 py-2.5 bg-black text-white rounded-lg font-medium disabled:opacity-50 hover:bg-zinc-800 transition"
          >
            {loading? 'Scraping...' : 'Scrape Leads'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border shadow-sm">
            <div className="p-4 border-b font-semibold">Leads ({leads.length})</div>
            <div className="divide-y max-h-[600px] overflow-auto">
              {leads.length === 0 && (
                <div className="p-8 text-center text-zinc-500">No leads yet. Search karo upar se.</div>
              )}
              {leads.map((lead, i) => (
                <div key={i} className="p-4 flex justify-between items-center gap-4 hover:bg-zinc-50">
                  <div>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-zinc-500">{lead.address || 'No address'}</div>
                    <div className="text-xs text-zinc-400">{lead.phone || ''} {lead.rating? `⭐ ${lead.rating}` : ''}</div>
                  </div>
                  <button
                    onClick={() => handleGenerate(lead)}
                    disabled={generating === lead.name}
                    className="px-4 py-1.5 text-sm border rounded-lg hover:bg-black hover:text-white transition disabled:opacity-50"
                  >
                    {generating === lead.name? '...' : 'Pitch'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm p-4">
            <div className="font-semibold mb-3">Generated Pitch</div>
            {pitch? (
              <div className="text-sm whitespace-pre-wrap bg-zinc-50 p-3 rounded-lg border">{pitch}</div>
            ) : (
              <div className="text-sm text-zinc-500">Kisi lead pe Pitch click karo, Gemini pitch banayega.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
