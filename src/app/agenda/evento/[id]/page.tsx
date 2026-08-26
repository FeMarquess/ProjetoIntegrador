'use client'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from 'next/navigation'
import { api } from '@/src/services/api';
import { Agenda } from '@/.next/dev/types/agenda';
import { Modal } from '@/src/components/CardAgenda';

interface IparametrosAgenda{
  Editar: boolean,
  Criar: boolean,
  Aberto: boolean
}

export default function CardEvento() {
  const searchParams = useSearchParams()
  const [evento, setEventos] = useState<Agenda| null>(null)
  const [parametrosAgenda, setParametrosAgenda] = useState<IparametrosAgenda>({Editar: false, Criar: false, Aberto: false})
  const idParam = searchParams.get('id')
    useEffect(() => {
      carregar();
    }, [idParam]) 

    console.log('[data]')

    if (!idParam) return
     async function carregar() {
      try {
        const res = await api.get('/agendaBuscarId', {
          params: { id: idParam }
        })
        const agendaDia = res.data as Agenda
        setEventos(agendaDia)
      } catch (error) {
        console.error(error)
      }
  }

  async function editarAgenda(aberto: boolean){
    setParametrosAgenda({Editar: true,  Criar: false, Aberto: aberto})
  }

  // const res = await api.put('/alterarAgenda', {
  //     params: { id: idParam },
  //     data: {
  //       descricao: evento?.descricao,
  //       funcionarioId: evento?.funcionarioId,
  //       clienteId: evento?.clienteId,
  //       tipoAgenda: evento?.tipoAgendaId,
  //       horaInicio: evento?.horaInicio,
  //       horaFim: evento?.horaFim
  //     }
  //   })

const fecharModal = () => {
  setParametrosAgenda({
    Editar: false,
    Criar: false,
    Aberto: false
  })
}

  async function deletarAgenda() {
    const res = await api.delete('/deletarAgenda',{
      params: {id: idParam}
    })
  }

  if (!evento) return <div>Nenhum evento</div>
  return (
    <div className='containerAgendaUnica'>
      <div className='agendaDia' key={evento.id}>
        <div className='botoesCard'>
          <button className='botaoEditar' onClick={() => editarAgenda(true)}><FontAwesomeIcon icon={faPen} /></button>
          <button className='botaoExcluir' onClick={deletarAgenda}><FontAwesomeIcon icon={faTrash} /></button>
        </div>          
            <div className='containerCondeudo'>
              <h1>Nome do apontamento: {evento.descricao}</h1>
              <h2>Tipo de apontamento: {evento.tipoAgendaId}</h2>
              <h2>Funcionaria: {evento.funcionarioId}</h2>
              <h2>Cliente: {evento.clienteId}</h2>
              <h2>Começo: {
                    evento.horaInicio
                      ? new Date(evento.horaInicio).toLocaleString('pt-BR')
                      : ''
                  }</h2>
              <h2>Fim: {
                    evento.horaFim
                      ? new Date(evento.horaFim).toLocaleString('pt-BR')
                      : ''
                  }</h2>
            </div>
      </div>
        <Modal params = {parametrosAgenda} onClose = {fecharModal} agenda={evento}/>
    </div>
  )
}