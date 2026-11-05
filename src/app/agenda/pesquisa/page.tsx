'use client'
import { Agenda } from '@/src/types/agenda'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { api, mensagemErro } from '@/src/services/api';
import CartaoAgenda from '@/src/components/CartaoAgenda';
import { Modal } from '@/src/components/CardAgenda';

function AgendaPesquisada () {
  const searchParams = useSearchParams()
  const [eventos, setEventos] = useState<Agenda[]>([])
  const [parametrosAgenda, setParametrosAgenda] = useState({Editar: false, Criar: false, Aberto: false})
  const [agendaSelecionada, setAgendaSelecionada] = useState<Agenda | null>(null)

  const descricao = searchParams.get('descricao')

  async function carregar() {
    try {
      const res = await api.get('/agendaBuscarNome', {
        params: { descricao: descricao ?? '' }
      })
      setEventos(res.data as Agenda[])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    carregar()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recarrega quando o termo muda
  }, [descricao])

  function editarAgenda(agenda: Agenda){
    setAgendaSelecionada(agenda)
    setParametrosAgenda({Editar: true, Criar: false, Aberto: true})
  }

  const fecharModal = () => {
    setParametrosAgenda({Editar: false, Criar: false, Aberto: false})
    carregar()
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

  return (
    <div>
      <h1 className='titulo'>{eventos.length} resultado{eventos.length === 1 ? '' : 's'} para &quot;{descricao}&quot;</h1>
      {eventos.length === 0 && <p className='semEventos'>Nenhum agendamento encontrado</p>}
      <div className='containerAgendaDia'>
        {eventos.map((agenda) => (
          <CartaoAgenda key={agenda.id} agenda={agenda} mostrarData onEditar={editarAgenda} onExcluir={deletarAgenda}/>
        ))}
      </div>
      <Modal
        params={parametrosAgenda}
        onClose={fecharModal}
        agenda={agendaSelecionada}
      />
    </div>
  )
}

// useSearchParams precisa de Suspense para a página poder ser gerada no build (next build)
export default function PaginaPesquisa() {
  return (
    <Suspense fallback={<div>Carregando…</div>}>
      <AgendaPesquisada/>
    </Suspense>
  )
}
