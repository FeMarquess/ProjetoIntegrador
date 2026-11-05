import { Agenda, StatusAgenda } from '@/src/types/agenda';

// texto sempre acompanha a cor, para o status não depender só dela
export const rotuloStatus: Record<StatusAgenda, string> = {
  agendado: 'Aguardando etapa anterior',
  liberado: 'Liberado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído'
}

export function classeStatus(status?: StatusAgenda) {
  return `seloStatus status-${status || 'agendado'}`
}

const hora = (data: string | Date) =>
  new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

// Texto do selo de uma agenda. Para etapas que esperam outra, diz qual:
// "Aguardando Manicure com Ana (16:00)" em vez de "Aguardando etapa anterior".
export function rotuloAgenda(agenda: Pick<Agenda, 'status' | 'aguardando'>) {
  const status = agenda.status || 'agendado'
  if (status === 'agendado' && agenda.aguardando) {
    const a = agenda.aguardando
    return `Aguardando ${a.servico} com ${a.profissional} (${hora(a.horaInicio)})`
  }
  return rotuloStatus[status]
}
