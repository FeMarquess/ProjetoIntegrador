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
  // horários reais gravados pelo painel da profissional
  inicioReal?: string | null
  fimReal?: string | null
  // fim combinado quando a etapa terminou antes e liberou o resto do horário
  horaFimPrevista?: string | null
  // quando a etapa espera outra da mesma visita: qual serviço, com quem e a que horas
  aguardando?: { id: number, servico: string, profissional: string, horaInicio: string } | null
  // preenchidos pela API nas buscas (include do Prisma)
  cliente?: { id: number, descricao: string }
  funcionario?: { id: number, descricao: string }
  tipoAgenda?: { id: number, descricao: string }
}
