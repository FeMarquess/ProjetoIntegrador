import { StatusAgenda } from '@/src/types/agenda';

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
