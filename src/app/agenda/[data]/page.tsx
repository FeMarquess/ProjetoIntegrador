'use client'
import { Evento } from '@/.next/dev/types/eventos'
import { useSearchParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';

export default function CardEvento() {
  const searchParams = useSearchParams()

  const eventosString = searchParams.get('eventos')

  const eventos = eventosString
    ? JSON.parse(eventosString)
    : []

  if (eventos.length <= 0) return <div>Nenhum evento</div>
  return (
    <div >
      <h1 className='titulo'>Apontamento do dia</h1>
      <div className='containerAgendaDia'>
      {eventos.map((evento: Evento) => {
        console.log(evento)
        return (
          <div className='agendaDia' key={evento.id}>
            <div className='botoesCard'>
              <button className='botaoEditar'><FontAwesomeIcon icon={faPen} /></button>
              <button className='botaoExcluir'><FontAwesomeIcon icon={faTrash} /></button>
            </div>
            <div className='containerCondeudo'>
              <h1>Nome do apontamento: {evento.title}</h1>
              <h2>Tipo de apontamento: {evento.properties.status}</h2>
              <h2>Funcionaria: {evento.properties.funcionario}</h2>
            </div>
          </div>
        )
        
      })}
      </div>
    </div>
  )
}