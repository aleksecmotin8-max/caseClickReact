import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCases() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('cases')
      .select('id, name, price, case_items(items(id, name, rarity, price, weight))')
      .order('id')
      .then(({ data, error: fetchError }) => {
        if (cancelled) {
          return
        }

        if (fetchError) {
          setError(fetchError.message)
          setLoading(false)
          return
        }

        const normalized = data.map((row) => ({
          id: row.id,
          name: row.name,
          price: row.price,
          items: row.case_items.map((caseItem) => caseItem.items)
        }))

        setCases(normalized)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { cases, loading, error }
}
