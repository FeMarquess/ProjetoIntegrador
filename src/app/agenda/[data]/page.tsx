'use client'
import { useEffect, useState } from 'react'
import { Agenda } from '@/.next/dev/types/agenda';
import { useSearchParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/src/services/api';
import { Modal } from '@/src/components/CardAgenda';

interface IparametrosAgenda{
  Editar: boolean,
  Criar: boolean,
  Aberto: boolean
}

export default function CardEvento() {
  const searchParams = useSearchParams()
  const [eventos, setEventos] = useState<Agenda[]>([])
  const [parametrosAgenda, setParametrosAgenda] = useState<IparametrosAgenda>({Editar: false, Criar: false, Aberto: false})
  const [agendaSelecionada, setAgendaSelecionada] = useState<Agenda | null>(null)
  const dataParam = searchParams.get('date')

console.log('[data]')

useEffect(() => {
  carregar();
}) 

    if (!dataParam) return
     async function carregar() {
      try {
        const res = await api.get('/agendaBuscarData', {
          params: { data: dataParam }
        })
        const agendaDia = res.data as Agenda[]
        setEventos(agendaDia)
      } catch (error) {
        console.error(error)
      }
  }

  function editarAgenda(agenda: Agenda) {
  setAgendaSelecionada(agenda)

  setParametrosAgenda({
    Editar: true,
    Criar: false,
    Aberto: true
  })
}
  async function deletarAgenda(id: Number) {
    const res = await api.delete('/deletarAgenda',{
      params: {id: id}
    })
  }

  const fecharModal = () => {
  setParametrosAgenda({
    Editar: false,
    Criar: false,
    Aberto: false
  })
}


  if (eventos.length <= 0) return <div>Nenhum evento</div>
  return (
    <div >
      <h1 className='titulo'>Apontamento do dia</h1>
      <div className='containerAgendaDia'>
      {eventos.map((agenda: Agenda) => {
        return (
          <div className='agendaDia' key={agenda.id}>
            <div className='botoesCard'>
              <button className='botaoEditar' onClick={() => editarAgenda(agenda)}><FontAwesomeIcon icon={faPen} /></button>
              <button className='botaoExcluir' onClick={() => {if (agenda.id != null) {deletarAgenda(agenda.id)}}}><FontAwesomeIcon icon={faTrash} /></button>
            </div>
            <div className='containerCondeudo'>
              <h1>Nome do apontamento: {agenda.descricao}</h1>
              <h2>Tipo de apontamento: {agenda.tipoAgendaId}</h2>
              <h2>Funcionaria: {agenda.funcionarioId}</h2>
              <h2>Cliente: {agenda.clienteId}</h2>
              <h2>Começo: {
                    agenda.horaInicio
                      ? new Date(agenda.horaInicio).toLocaleString('pt-BR')
                      : ''
                  }</h2>
              <h2>Fim: {
                    agenda.horaFim
                      ? new Date(agenda.horaFim).toLocaleString('pt-BR')
                      : ''
                  }</h2>
            </div>
          </div>          
        )
        
      })}    
      <Modal
        params={parametrosAgenda}
        onClose={fecharModal}
        agenda={agendaSelecionada}
      />  
      </div>
    </div>
  )
}