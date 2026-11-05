'use client'
import { useEffect, useState } from 'react'
import { api, mensagemErro } from '@/src/services/api';
import { Agenda } from '@/src/types/agenda';
import { rotuloStatus, classeStatus } from '@/src/utils/status';

function dataHora(data: Date | string | null) {
  return data ? new Date(data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
}

// Histórico de procedimentos da cliente, carregado ao abrir
export default function HistoricoCliente({ clienteId }: { clienteId: number }) {
  const [agendas, setAgendas] = useState<Agenda[] | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    api.get('/agendaBuscarCliente', { params: { clienteId } })
      .then((res) => setAgendas(res.data as Agenda[]))
      .catch((error) => setErro(mensagemErro(error)))
  }, [clienteId])

  if (erro) return <p role='alert' className='historicoCliente'>{erro}</p>
  if (!agendas) return <p className='historicoCliente'>Carregando histórico…</p>
  if (agendas.length === 0) return <p className='historicoCliente'>Nenhum procedimento registrado</p>

  const concluidos = agendas.filter((a) => a.status === 'concluido').length
  return (
    <div className='historicoCliente'>
      <strong>{agendas.length} procedimento{agendas.length === 1 ? '' : 's'} ({concluidos} concluído{concluidos === 1 ? '' : 's'})</strong>
      <ol>
        {agendas.map((a) => (
          <li key={a.id}>
            <span>{dataHora(a.horaInicio)}</span>
            <span>{a.tipoAgenda?.descricao} com {a.funcionario?.descricao}</span>
            <span className={classeStatus(a.status)}>{rotuloStatus[a.status || 'agendado']}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
