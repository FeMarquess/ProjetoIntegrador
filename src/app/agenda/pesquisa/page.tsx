'use client'
import { Agenda } from '@/.next/dev/types/agenda'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api } from '@/src/services/api';

export default function AgendaPesquisada () {
  const searchParams = useSearchParams()
  const [eventos, setEventos] = useState<Agenda[]>([])
  
  const descricao = searchParams.get('descricao')

  console.log(`termo chegou ${descricao}`)

  useEffect(() => {       
    carregar()
  })

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

  async function editarAgenda(agenda: Agenda){
    const res = await api.put('/alterarAgenda', {
      params: { id: agenda },
      data: {
        descricao: agenda?.descricao,
        funcionarioId: agenda?.funcionarioId,
        clienteId: agenda?.clienteId,
        tipoAgenda: agenda?.tipoAgendaId,
        horaInicio: agenda?.horaInicio,
        horaFim: agenda?.horaFim
      }
    })
  }

  async function deletarAgenda(id: Number) {
    const res = await api.delete('/deletarAgenda',{
      params: {id: id}
    })
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
      </div>
    </div>
  )
}