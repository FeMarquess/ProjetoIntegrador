export interface Evento {
  id: string
  title: string
  start: string | Date
  end: string | Date
  properties: {
    clienteId: number
    cliente?: string
    funcionarioId: number
    funcionario?: string
    status?: string
  }
}
