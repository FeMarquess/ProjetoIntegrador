export type StatusAgenda = 'agendado' | 'liberado' | 'em_andamento' | 'concluido'

export interface Agenda {
  id: number | null
  descricao: string
  clienteId: number
  funcionarioId: number
  tipoAgendaId: number
  horaInicio: Date | null
  horaFim: Date | null
  status?: StatusAgenda
  // preenchidos pela API nas buscas (include do Prisma)
  cliente?: { id: number, descricao: string }
  funcionario?: { id: number, descricao: string }
  tipoAgenda?: { id: number, descricao: string }
}
