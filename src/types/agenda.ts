export interface Agenda {
  id: number | null
  descricao: string
  clienteId: number
  funcionarioId: number
  tipoAgendaId: number
  horaInicio: Date | null
  horaFim: Date | null
}
