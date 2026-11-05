import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'

const api = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn(), post: vi.fn(), delete: vi.fn() }))
vi.mock('@/src/services/api', async (original) => ({
  ...(await original<typeof import('@/src/services/api')>()),
  api
}))

import Profissionais from '@/src/app/profissionais/page'
import HistoricoCliente from '@/src/components/HistoricoCliente'
import { Modal } from '@/src/components/CardAgenda'

const tipos = [{ id: 1, descricao: 'Cabelo' }, { id: 2, descricao: 'Manicure' }, { id: 3, descricao: 'Maquiagem' }]

describe('Profissionais: várias especialidades', () => {
  function respostas(funcionarios: unknown[]) {
    api.get.mockImplementation(async (rota: string) => ({
      data: rota === '/tipoAgendaBuscar' ? tipos : funcionarios
    }))
  }

  it('cadastra com todas as especialidades marcadas', async () => {
    respostas([])
    api.post.mockResolvedValue({ data: {} })
    render(<Profissionais/>)

    await userEvent.type(screen.getByLabelText('Nome:'), 'Carla')
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Cabelo' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Maquiagem' }))
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(api.post).toHaveBeenCalledWith('/funcionario', { descricao: 'Carla', especialidades: [1, 3] })
    expect(screen.getByRole('status').textContent).toBe('Profissional cadastrada')
  })

  it('não deixa salvar sem nenhuma especialidade', async () => {
    respostas([])
    render(<Profissionais/>)
    await screen.findByRole('checkbox', { name: 'Cabelo' })

    await userEvent.type(screen.getByLabelText('Nome:'), 'Carla')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(api.post).not.toHaveBeenCalled()
    expect(screen.getByRole('status').textContent).toBe('Marque ao menos uma especialidade')
  })

  it('lista as especialidades de cada profissional e preenche o formulário ao editar', async () => {
    respostas([{ id: 4, descricao: 'Bia', especialidades: [tipos[0], tipos[1]] }])
    render(<Profissionais/>)

    expect(await screen.findByText('Especialidades: Cabelo, Manicure')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Editar Bia' }))
    expect((screen.getByRole('checkbox', { name: 'Cabelo' }) as HTMLInputElement).checked).toBe(true)
    expect((screen.getByRole('checkbox', { name: 'Manicure' }) as HTMLInputElement).checked).toBe(true)
    expect((screen.getByRole('checkbox', { name: 'Maquiagem' }) as HTMLInputElement).checked).toBe(false)
  })
})

describe('Histórico de procedimentos da cliente', () => {
  it('lista os procedimentos com serviço, profissional e status', async () => {
    api.get.mockResolvedValue({ data: [
      { id: 2, status: 'concluido', horaInicio: '2026-11-01T12:00:00.000Z', tipoAgenda: { descricao: 'Cabelo' }, funcionario: { descricao: 'Bia' } },
      { id: 1, status: 'agendado', horaInicio: '2026-10-01T13:00:00.000Z', tipoAgenda: { descricao: 'Manicure' }, funcionario: { descricao: 'Ana' } }
    ] })
    render(<HistoricoCliente clienteId={5}/>)

    expect(await screen.findByText('2 procedimentos (1 concluído)')).toBeTruthy()
    expect(api.get).toHaveBeenCalledWith('/agendaBuscarCliente', { params: { clienteId: 5 } })
    const itens = screen.getAllByRole('listitem')
    expect(within(itens[0]).getByText('Cabelo com Bia')).toBeTruthy()
    expect(within(itens[0]).getByText('Concluído')).toBeTruthy()
    expect(within(itens[1]).getByText('Manicure com Ana')).toBeTruthy()
  })

  it('avisa quando não há procedimentos', async () => {
    api.get.mockResolvedValue({ data: [] })
    render(<HistoricoCliente clienteId={5}/>)
    expect(await screen.findByText('Nenhum procedimento registrado')).toBeTruthy()
  })
})

describe('Novo agendamento: conflito de horário', () => {
  it('mostra o motivo quando a API recusa por sobreposição (409)', async () => {
    api.get.mockImplementation(async (rota: string) => {
      if (rota === '/clienteBuscar' || rota === '/clienteBuscarNome') return { data: [{ id: 1, descricao: 'Camila' }] }
      if (rota === '/funcionarioBuscarEspecialidade') return { data: [
        { id: 4, descricao: 'Bia', especialidades: [], tipoAgendaId: 1, especialidade: 'Cabelo' },
        { id: 4, descricao: 'Bia', especialidades: [], tipoAgendaId: 2, especialidade: 'Manicure' }
      ] }
      return { data: [] }
    })
    api.post.mockRejectedValue(new AxiosError('409', '409', undefined, undefined, {
      status: 409, statusText: '', headers: {}, config: { headers: new AxiosHeaders() },
      data: { mensagem: 'A profissional já tem atendimento das 10:00 às 11:00 com Duda. Escolha outro horário' }
    }))
    const fechar = vi.fn()
    render(<Modal params={{ Criar: true, Editar: false, Aberto: true }} onClose={fechar} dataInicial='2026-11-10'/>)

    await userEvent.click(screen.getByLabelText('Cliente:'))
    await userEvent.click(await screen.findByRole('option', { name: '#1 Camila' }))
    // a mesma profissional aparece uma vez por serviço; escolhe Manicure
    await userEvent.click(screen.getByLabelText('Profissional:'))
    await userEvent.click(await screen.findByRole('option', { name: '#4 Bia — Manicure' }))
    await userEvent.type(screen.getByLabelText('Início:'), '1030')
    await userEvent.click(screen.getByRole('button', { name: '1 h' }))
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(api.post).toHaveBeenCalledWith('/agenda', expect.objectContaining({ funcionarioId: 4, tipoAgendaId: 2, clienteId: 1 }))
    expect(screen.getByRole('alert').textContent).toMatch(/já tem atendimento das 10:00 às 11:00/)
    expect(fechar).not.toHaveBeenCalled()
  })
})
