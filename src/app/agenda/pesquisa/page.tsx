'use client'
import { Agenda } from '@/src/types/agenda'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/src/services/api';
import { rotuloStatus, classeStatus } from '@/src/utils/status';
import { Modal } from '@/src/components/CardAgenda';

export default function AgendaPesquisada () {
  const searchParams = useSearchParams()
  const [eventos, setEventos] = useState<Agenda[]>([])
  const [parametrosAgenda, setParametrosAgenda] = useState({Editar: false, Criar: false, Aberto: false})
  const [agendaSelecionada, setAgendaSelecionada] = useState<Agenda | null>(null)

  const descricao = searchParams.get('descricao')

  console.log(`termo chegou ${descricao}`)

  useEffect(() => {       
    carregar()
  }, [descricao])

async function carregar() {
  if(descricao)
  try {
    console.log(descricao)
          const res = await api.get('/agendaBuscarNome', {
            params: { descricao: descricao }
          })
          const agendaDia = res.data as Agenda[]
          console.log(res.data)
          setEventos(agendaDia)
        } catch (error) {
          console.error(error)
        }
        else{
        try{
          const res = await api.get('/agendaBuscarNome', {
            params: { descricao: descricao }
          })
          const agendaDia = res.data as Agenda[]
          console.log(res.data)
          setEventos(agendaDia)
        } catch (error) {
          console.error(error)
        }
        }          
    }

  function editarAgenda(agenda: Agenda){
    setAgendaSelecionada(agenda)
    setParametrosAgenda({Editar: true, Criar: false, Aberto: true})
  }

  const fecharModal = () => {
    setParametrosAgenda({Editar: false, Criar: false, Aberto: false})
    carregar()
  }

  async function deletarAgenda(id: Number) {
    const res = await api.delete('/deletarAgenda',{
      params: {id: id}
    })
    carregar()
  }

if (eventos.length <= 0) return <div>Nenhum evento</div>
console.log(eventos.length)
console.log(eventos)
  return (
    <div >
      <h1 className='titulo'>Apontamentos pesquisado</h1>
      <div className='containerAgendaDia'>
      {eventos.map((agenda: Agenda) => {
        if(agenda.id)
        return (
          <div className='agendaDia' key={agenda.id}>
            <div className='botoesCard'>
              <button className='botaoEditar' onClick={() => editarAgenda(agenda)}><FontAwesomeIcon icon={faPen} /></button>
              <button className='botaoExcluir' onClick={() => {if (agenda.id != null) {deletarAgenda(agenda.id)}}}><FontAwesomeIcon icon={faTrash} /></button>
            </div>
            <div className='containerCondeudo'>
              <h1>Nome do apontamento: {agenda.descricao}</h1>
              <span className={classeStatus(agenda.status)}>{rotuloStatus[agenda.status || 'agendado']}</span>
              <h2>Serviço: #{agenda.tipoAgendaId} {agenda.tipoAgenda?.descricao}</h2>
              <h2>Profissional: #{agenda.funcionarioId} {agenda.funcionario?.descricao}</h2>
              <h2>Cliente: #{agenda.clienteId} {agenda.cliente?.descricao}</h2>
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