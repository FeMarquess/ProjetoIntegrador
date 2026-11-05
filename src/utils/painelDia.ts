import { Agenda } from '@/src/types/agenda';

export type Visao = 'profissional' | 'cliente'
export type FiltroStatus = 'todos' | 'abertos' | 'concluidos'

export interface Visita {
  chave: string
  cliente: string
  etapas: Agenda[]
  concluidas: number
}

export interface Coluna {
  chave: string
  profissional: string
  agendas: Agenda[]
}

const inicio = (a: Agenda) => new Date(a.horaInicio!).getTime()
const porHorario = (a: Agenda, b: Agenda) => inicio(a) - inicio(b)
const concluida = (a: Agenda) => a.status === 'concluido'

// Visitas do dia: etapas da mesma cliente em ordem de horário, visitas ordenadas pela primeira etapa
export function agruparVisitas(agendas: Agenda[]): Visita[] {
  const grupos = new Map<string, Agenda[]>()
  for (const a of agendas) {
    const chave = a.clienteId ? `c${a.clienteId}` : `sem-cliente-${a.id}`
    grupos.set(chave, [...(grupos.get(chave) ?? []), a])
  }
  return [...grupos.entries()]
    .map(([chave, etapas]) => {
      const ordenadas = [...etapas].sort(porHorario)
      return {
        chave,
        cliente: ordenadas[0].cliente?.descricao || 'Sem cliente',
        etapas: ordenadas,
        concluidas: ordenadas.filter(concluida).length
      }
    })
    .sort((a, b) => porHorario(a.etapas[0], b.etapas[0]))
}

// Uma coluna por profissional, na ordem do primeiro atendimento do dia
export function agruparPorProfissional(agendas: Agenda[]): Coluna[] {
  const grupos = new Map<number, Agenda[]>()
  for (const a of agendas) grupos.set(a.funcionarioId, [...(grupos.get(a.funcionarioId) ?? []), a])
  return [...grupos.entries()]
    .map(([id, lista]) => {
      const ordenadas = [...lista].sort(porHorario)
      return { chave: `f${id}`, profissional: ordenadas[0].funcionario?.descricao || '', agendas: ordenadas }
    })
    .sort((a, b) => porHorario(a.agendas[0], b.agendas[0]))
}

// "Em aberto" = ainda falta alguma coisa; "Concluídos" = já terminou.
// Por cliente, o filtro vale para a visita inteira, para a sequência de etapas não ficar pela metade.
export function filtrarAgendas(agendas: Agenda[], filtro: FiltroStatus) {
  if (filtro === 'abertos') return agendas.filter((a) => !concluida(a))
  if (filtro === 'concluidos') return agendas.filter(concluida)
  return agendas
}

export function filtrarVisitas(visitas: Visita[], filtro: FiltroStatus) {
  if (filtro === 'abertos') return visitas.filter((v) => v.concluidas < v.etapas.length)
  if (filtro === 'concluidos') return visitas.filter((v) => v.concluidas === v.etapas.length)
  return visitas
}
