'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from 'next/navigation'

export default function CardEvento() {
  const searchParams = useSearchParams()

  const eventoString = searchParams.get('evento')
console.log(eventoString)

  const evento= eventoString
  ? JSON.parse(eventoString)
  : null
  console.log(evento)

  if (!evento) return <div>Nenhum evento</div>

  return (
    <div className='agendaDia' key={evento.id}>
            <div className='botoesCard'>
              <button className='botaoEditar'><FontAwesomeIcon icon={faPen} /></button>
              <button className='botaoExcluir'><FontAwesomeIcon icon={faTrash} /></button>
            </div>
            <div className='containerCondeudo'>
              <h1>Nome do apontamento: {evento.title}</h1>
              <h2>Tipo de apontamento: {evento.extendedProps.properties.status}</h2>
              <h2>Funcionaria: {evento.extendedProps.properties.funcionario}</h2>
            </div>
          </div>
  )
}