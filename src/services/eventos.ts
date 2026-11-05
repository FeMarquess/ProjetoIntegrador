'use client'
import { useEffect, useRef } from 'react'
import { API_URL } from './api'

// Tipos enviados pela API em GET /eventos (Server-Sent Events)
export type TipoEventoAgenda = 'agenda_alterada' | 'etapa_liberada'

export interface EventoAgenda {
  tipo: TipoEventoAgenda
  dados: {
    id?: number
    funcionarioId?: number
    clienteId?: number | null
    cliente?: string | null
    servico?: string
    acao?: string
  }
}

// Recebe em tempo real as mudanças da agenda feitas em qualquer aparelho.
// O navegador reconecta sozinho se a conexão cair; as telas mantêm a atualização periódica
// como reserva, então nada se perde enquanto estiver sem conexão.
export function useEventosAgenda(aoReceber: (evento: EventoAgenda) => void) {
  // guarda sempre a versão mais nova do callback sem reabrir a conexão
  const callback = useRef(aoReceber)
  useEffect(() => {
    callback.current = aoReceber
  })

  useEffect(() => {
    if (typeof EventSource === 'undefined') return
    const fonte = new EventSource(`${API_URL}/eventos`)
    const tipos: TipoEventoAgenda[] = ['agenda_alterada', 'etapa_liberada']
    const ouvintes = tipos.map((tipo) => {
      const ouvinte = (e: MessageEvent) => {
        try {
          callback.current({ tipo, dados: JSON.parse(e.data) })
        } catch (error) {
          console.error(error)
        }
      }
      fonte.addEventListener(tipo, ouvinte)
      return [tipo, ouvinte] as const
    })
    return () => {
      ouvintes.forEach(([tipo, ouvinte]) => fonte.removeEventListener(tipo, ouvinte))
      fonte.close()
    }
  }, [])
}
