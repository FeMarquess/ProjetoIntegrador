'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, mensagemErro } from '@/src/services/api';
import CartaoAgenda from '@/src/components/CartaoAgenda';
import { Agenda } from '@/src/types/agenda';
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
  const router = useRouter()
  async function carregar() {
      if (!idParam) return
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

  useEffect(() => {
    carregar();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- recarrega quando o id muda
  }, [idParam])

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
  carregar()
}

  async function deletarAgenda() {
    try {
      await api.delete('/deletarAgenda',{
        params: {id: idParam}
      })
      router.push('/agenda')
    } catch (error) {
      alert(mensagemErro(error))
    }
  }

  if (!evento) return <p className='semEventos'>Agendamento não encontrado</p>
  return (
    <div className='containerAgendaUnica'>
      <CartaoAgenda agenda={evento} mostrarData onEditar={() => editarAgenda(true)} onExcluir={deletarAgenda}/>
      <Modal params = {parametrosAgenda} onClose = {fecharModal} agenda={evento}/>
    </div>
  )
}
