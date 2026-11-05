import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Agenda } from '@/src/types/agenda'

const api = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() }))
vi.mock('@/src/services/api', async (original) => ({
  ...(await original<typeof import('@/src/services/api')>()),
  api
}))
vi.mock('@/src/services/eventos', () => ({ useEventosAgenda: () => {} }))
vi.mock('next/navigation', () => ({
  useParams: () => ({ data: '2026-11-20' }),
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/'
}))

import { rotuloAgenda } from '@/src/utils/status'
import { diaLongo, diaCurto, idade } from '@/src/utils/dataHora'
import { agruparVisitas, filtrarVisitas, filtrarAgendas, agruparPorProfissional } from '@/src/utils/painelDia'
import Home from '@/src/app/page'
import Clientes from '@/src/app/clientes/page'
import AgendaDoDia from '@/src/app/agenda/[data]/page'

const etapa = (id: number, clienteId: number, cliente: string, hora: string, servico: string, profissional: string, funcionarioId: number, status: Agenda['status']): Agenda => ({
  id, clienteId, funcionarioId, tipoAgendaId: 1, descricao: `${servico} — ${cliente}`, status,
  horaInicio: new Date(`2026-11-04T${hora}:00`), horaFim: new Date(`2026-11-04T${hora}:00`),
  cliente: { id: clienteId, descricao: cliente }, funcionario: { id: funcionarioId, descricao: profissional }, tipoAgenda: { id: 1, descricao: servico }
})

const dia: Agenda[] = [
  etapa(3, 1, 'Camila', '16:00', 'Maquiagem', 'Carla', 3, 'agendado'),
  etapa(1, 1, 'Camila', '14:00', 'Manicure', 'Ana', 1, 'concluido'),
  etapa(2, 1, 'Camila', '15:00', 'Cabelo', 'Bia', 2, 'liberado'),
  etapa(4, 2, 'Helena', '09:00', 'Maquiagem', 'Carla', 3, 'concluido')
]

describe('textos e formatos', () => {
  it('o selo diz qual etapa está bloqueando', () => {
    expect(rotuloAgenda({ status: 'agendado', aguardando: { id: 1, servico: 'Manicure', profissional: 'Ana', horaInicio: '2026-11-04T19:00:00.000Z' } }))
      .toBe('Aguardando Manicure com Ana (16:00)')
    expect(rotuloAgenda({ status: 'agendado', aguardando: null })).toBe('Aguardando etapa anterior')
    expect(rotuloAgenda({ status: 'liberado' })).toBe('Liberado')
  })
  it('datas por extenso e idade', () => {
    expect(diaLongo('2026-11-04')).toBe('Quarta, 04/11')
    expect(diaCurto(new Date('2026-11-06T12:00:00'))).toBe('sex, 06/11')
    expect(idade('1990-05-20T00:00:00.000Z', new Date('2026-11-04T10:00:00'))).toBe(36)
    expect(idade('2000-11-05', new Date('2026-11-04T10:00:00'))).toBe(25)
  })
})

describe('painel do dia: agrupamento e filtros', () => {
  it('agrupa as etapas de cada cliente em ordem de horário', () => {
    const visitas = agruparVisitas(dia)
    expect(visitas.map((v) => v.cliente)).toEqual(['Helena', 'Camila'])
    expect(visitas[1].etapas.map((e) => e.id)).toEqual([1, 2, 3])
    expect(visitas[1].concluidas).toBe(1)
  })
  it('filtra visitas inteiras e atendimentos', () => {
    const visitas = agruparVisitas(dia)
    expect(filtrarVisitas(visitas, 'abertos').map((v) => v.cliente)).toEqual(['Camila'])
    expect(filtrarVisitas(visitas, 'concluidos').map((v) => v.cliente)).toEqual(['Helena'])
    expect(filtrarAgendas(dia, 'abertos').map((a) => a.id).sort()).toEqual([2, 3])
    expect(agruparPorProfissional(dia).map((c) => c.profissional)).toEqual(['Carla', 'Ana', 'Bia'])
  })
})

describe('telas', () => {
  beforeEach(() => { localStorage.clear() })

  it('painel do dia troca para a visão por cliente e filtra em aberto, lembrando a escolha', async () => {
    api.get.mockResolvedValue({ data: dia })
    render(<Home/>)
    expect(await screen.findByRole('button', { name: 'Todos (4)' })).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'Cliente' }))
    expect(screen.getByRole('button', { name: 'Todos (2)' })).toBeTruthy()
    expect(screen.getByText('1 de 3 etapas concluídas')).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'Em aberto (1)' }))
    expect(screen.queryByText('Helena')).toBeNull()
    expect(screen.getByText('Camila')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('painelDia')!)).toEqual({ visao: 'cliente', filtro: 'abertos' })
  })

  it('excluir cliente pede confirmação e só apaga ao confirmar', async () => {
    api.get.mockResolvedValue({ data: [{ id: 5, descricao: 'Helena', telefone: null, dataNascimento: '1962-01-15T00:00:00.000Z' }] })
    api.delete.mockResolvedValue({ data: {} })
    render(<Clientes/>)

    await userEvent.click(await screen.findByRole('button', { name: 'Excluir Helena' }))
    const confirmacao = screen.getByRole('alertdialog')
    expect(api.delete).not.toHaveBeenCalled()

    await userEvent.click(within(confirmacao).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(api.delete).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Excluir Helena' }))
    await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Excluir' }))
    expect(api.delete).toHaveBeenCalledWith('/deletarCliente', { params: { id: 5 } })
  })

  it('card da cliente mostra idade e esconde telefone vazio', async () => {
    api.get.mockResolvedValue({ data: [{ id: 5, descricao: 'Helena', telefone: null, dataNascimento: '1962-01-15T00:00:00.000Z' }] })
    render(<Clientes/>)
    const linha = await screen.findByText(/anos · 15\/01\/1962/)
    const card = linha.closest('.agendaDia') as HTMLElement
    expect(within(card).queryByText(/Telefone/)).toBeNull()
    expect(card.querySelector('.telefoneCard')).toBeNull()
  })

  it('dia vazio oferece agendar já com a data do dia', async () => {
    api.get.mockResolvedValue({ data: [] })
    render(<AgendaDoDia/>)
    await userEvent.click(await screen.findByRole('button', { name: '+ Agendar em 20/11' }))
    expect((screen.getByLabelText('Data:') as HTMLInputElement).value).toBe('20/11/2026')
  })
})
