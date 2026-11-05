import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import type { EventoAgenda } from '@/src/services/eventos'

// API falsa: cada teste define as respostas
const api = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() }))
vi.mock('@/src/services/api', async (original) => ({
  ...(await original<typeof import('@/src/services/api')>()),
  api
}))

// guarda o callback do tempo real para o teste simular um evento chegando da API
const tempoReal = vi.hoisted(() => ({ aoReceber: null as null | ((e: EventoAgenda) => void) }))
vi.mock('@/src/services/eventos', () => ({
  useEventosAgenda: (fn: (e: EventoAgenda) => void) => { tempoReal.aoReceber = fn }
}))

import PainelProfissional from '@/src/app/painel/page'

const bia = { id: 2, descricao: 'Bia', especialidades: [{ id: 1, descricao: 'Cabelo' }] }
const agenda = (id: number, status: string, cliente: string) => ({
  id, status, descricao: `visita ${id}`, clienteId: id, funcionarioId: 2, tipoAgendaId: 1,
  horaInicio: '2026-11-10T13:00:00.000Z', horaFim: '2026-11-10T14:00:00.000Z',
  cliente: { id, descricao: cliente }, tipoAgenda: { id: 1, descricao: 'Cabelo' }
})

function respostas(agendas: unknown[]) {
  api.get.mockImplementation(async (rota: string) => {
    if (rota === '/funcionarioBuscarId') return { data: bia }
    if (rota === '/agendaBuscarFuncionario') return { data: agendas }
    return { data: [] }
  })
}

describe('Painel da profissional', () => {
  beforeEach(() => {
    localStorage.setItem('profissionalId', '2')
    tempoReal.aoReceber = null
  })

  it('só mostra Iniciar na etapa liberada e Concluir na etapa em andamento', async () => {
    respostas([agenda(1, 'liberado', 'Camila'), agenda(2, 'agendado', 'Duda'), agenda(3, 'em_andamento', 'Eva')])
    render(<PainelProfissional/>)

    expect(await screen.findByText('Painel de Bia')).toBeTruthy()
    await screen.findByText(/Camila/)
    expect(screen.getAllByRole('button', { name: 'Iniciar' })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Concluir' })).toHaveLength(1)
    expect(screen.getByText('Aguardando etapa anterior')).toBeTruthy()
  })

  it('Iniciar chama a API da etapa certa', async () => {
    respostas([agenda(7, 'liberado', 'Camila')])
    api.put.mockResolvedValue({ data: {} })
    render(<PainelProfissional/>)

    await userEvent.click(await screen.findByRole('button', { name: 'Iniciar' }))
    expect(api.put).toHaveBeenCalledWith('/agendaIniciar', {}, { params: { id: 7 } })
  })

  it('mostra a mensagem da API quando a ação é recusada', async () => {
    respostas([agenda(7, 'liberado', 'Camila')])
    api.put.mockRejectedValue(new AxiosError('409', '409', undefined, undefined, {
      status: 409, statusText: '', headers: {}, config: { headers: new AxiosHeaders() },
      data: { mensagem: 'A etapa anterior desta cliente ainda não foi concluída' }
    }))
    render(<PainelProfissional/>)

    await userEvent.click(await screen.findByRole('button', { name: 'Iniciar' }))
    expect((await screen.findByRole('alert')).textContent).toBe('A etapa anterior desta cliente ainda não foi concluída')
  })

  it('avisa na hora quando uma etapa é liberada em outro aparelho (tempo real)', async () => {
    respostas([agenda(1, 'agendado', 'Camila')])
    render(<PainelProfissional/>)
    await screen.findByText(/Camila/)
    expect(screen.queryByRole('button', { name: 'Iniciar' })).toBeNull()

    // a manicure concluiu a etapa anterior: a API manda "etapa_liberada" para a Bia
    respostas([agenda(1, 'liberado', 'Camila')])
    tempoReal.aoReceber!({ tipo: 'etapa_liberada', dados: { id: 1, funcionarioId: 2 } })

    expect((await screen.findByRole('status')).textContent).toBe('Camila liberado(a) para Cabelo')
    expect(screen.getByRole('button', { name: 'Iniciar' })).toBeTruthy()
  })

  it('ignora eventos de outras profissionais', async () => {
    respostas([agenda(1, 'agendado', 'Camila')])
    render(<PainelProfissional/>)
    await screen.findByText(/Camila/)
    const chamadas = api.get.mock.calls.length

    tempoReal.aoReceber!({ tipo: 'agenda_alterada', dados: { id: 99, funcionarioId: 5 } })
    await new Promise((r) => setTimeout(r, 20))
    expect(api.get.mock.calls.length).toBe(chamadas)
  })

  it('sem profissional salva no aparelho, pede para escolher', async () => {
    localStorage.clear()
    respostas([])
    render(<PainelProfissional/>)
    expect(screen.getByText('Quem está usando este aparelho?')).toBeTruthy()
    await waitFor(() => expect(api.get).not.toHaveBeenCalledWith('/agendaBuscarFuncionario', expect.anything()))
  })
})
