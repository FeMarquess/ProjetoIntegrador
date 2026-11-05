'use client'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { Agenda } from '@/src/types/agenda';
import { classeStatus, rotuloAgenda } from '@/src/utils/status';
import { diaCurto, horaCurta } from '@/src/utils/dataHora';
import ConfirmarExclusao from './ConfirmarExclusao';

interface props {
  agenda: Agenda
  // mostra o dia no card (pesquisa e página do agendamento); na lista do dia não precisa
  mostrarData?: boolean
  onEditar: (agenda: Agenda) => void
  onExcluir: (id: number) => void
}

// Card de agendamento usado na lista do dia, na pesquisa e na página do agendamento
export default function CartaoAgenda({ agenda, mostrarData = false, onEditar, onExcluir }: props) {
  const [confirmando, setConfirmando] = useState(false)
  const servico = agenda.tipoAgenda?.descricao || ''
  const cliente = agenda.cliente?.descricao || 'Sem cliente'
  const profissional = agenda.funcionario?.descricao || ''
  // a descrição só aparece quando foi escrita à mão (a automática é "Serviço — Cliente")
  const descricaoPropria = agenda.descricao && agenda.descricao !== `${servico} — ${cliente}` ? agenda.descricao : ''

  return (
    <div className='agendaDia'>
      <div className='botoesCard'>
        <button className='botaoEditar' aria-label={`Editar ${servico} de ${cliente}`} onClick={() => onEditar(agenda)}><FontAwesomeIcon icon={faPen} /></button>
        <button className='botaoExcluir' aria-label={`Excluir ${servico} de ${cliente}`} onClick={() => setConfirmando(true)}><FontAwesomeIcon icon={faTrash} /></button>
      </div>
      <div className='containerCondeudo'>
        {mostrarData && agenda.horaInicio && <h2 className='dataAgenda'>{diaCurto(agenda.horaInicio)}</h2>}
        <h1 className='tituloAgenda'>{horaCurta(agenda.horaInicio)} – {horaCurta(agenda.horaFim)} · {servico}</h1>
        <h2>{cliente}{profissional ? ` com ${profissional}` : ''}</h2>
        {descricaoPropria && <p className='notaAgenda'>{descricaoPropria}</p>}
        <span className={classeStatus(agenda.status)}>{rotuloAgenda(agenda)}</span>
      </div>
      {confirmando && (
        <ConfirmarExclusao
          texto={`Excluir ${servico} de ${cliente} às ${horaCurta(agenda.horaInicio)}?`}
          onCancelar={() => setConfirmando(false)}
          onConfirmar={() => { setConfirmando(false); if (agenda.id != null) onExcluir(agenda.id) }}/>
      )}
    </div>
  )
}
