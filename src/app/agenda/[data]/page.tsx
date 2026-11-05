'use client'
import { useEffect, useState } from 'react'
import { Agenda } from '@/src/types/agenda';
import { useParams, useSearchParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus } from '@fortawesome/free-solid-svg-icons';
import { api, mensagemErro } from '@/src/services/api';
import { diaLongo, isoParaData } from '@/src/utils/dataHora';
import CartaoAgenda from '@/src/components/CartaoAgenda';
import { Modal, EVENTO_AGENDA_ALTERADA } from '@/src/components/CardAgenda';

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
  const params = useParams<{ data: string }>()
  const dataParam = searchParams.get('date') || params.data

  async function carregar() {
      if (!dataParam) return
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

  useEffect(() => {
    carregar();
    window.addEventListener(EVENTO_AGENDA_ALTERADA, carregar)
    return () => window.removeEventListener(EVENTO_AGENDA_ALTERADA, carregar)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recarrega quando o dia muda
  }, [dataParam])

  function editarAgenda(agenda: Agenda) {
  setAgendaSelecionada(agenda)

  setParametrosAgenda({
    Editar: true,
    Criar: false,
    Aberto: true
  })
}
  async function deletarAgenda(id: number) {
    try {
      await api.delete('/deletarAgenda',{
        params: {id: id}
      })
    } catch (error) {
      alert(mensagemErro(error))
    }
    carregar()
  }

  const fecharModal = () => {
  setParametrosAgenda({
    Editar: false,
    Criar: false,
    Aberto: false
  })
  carregar()
}


  const contagem = eventos.length ? ` · ${eventos.length} atendimento${eventos.length === 1 ? '' : 's'}` : ''
  const titulo = dataParam ? `${diaLongo(dataParam)}${contagem}` : 'Atendimentos do dia'

  return (
    <div>
      <h1 className='titulo'>{titulo}</h1>
      {eventos.length === 0 ? (
        <div className='listaVazia'>
          <FontAwesomeIcon icon={faCalendarPlus} />
          <span>Nenhum atendimento neste dia</span>
          {dataParam && (
            <button className='botaoForm botaoDestaque' onClick={() => setParametrosAgenda({ Editar: false, Criar: true, Aberto: true })}>
              + Agendar em {isoParaData(dataParam).slice(0, 5)}
            </button>
          )}
        </div>
      ) : (
        <div className='containerAgendaDia'>
          {eventos.map((agenda) => (
            <CartaoAgenda key={agenda.id} agenda={agenda} onEditar={editarAgenda} onExcluir={deletarAgenda}/>
          ))}
        </div>
      )}
      <Modal
        params={parametrosAgenda}
        onClose={fecharModal}
        agenda={parametrosAgenda.Criar ? null : agendaSelecionada}
        dataInicial={dataParam || undefined}
      />
    </div>
  )
}
