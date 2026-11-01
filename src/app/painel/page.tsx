'use client'
import { useEffect, useRef, useState } from 'react'
import { api } from '@/src/services/api';
import { Agenda } from '@/src/types/agenda';
import { Funcionario } from '@/src/types/funcionario';
import CampoBusca, { ItemBusca } from '@/src/components/CampoBusca';
import { rotuloStatus, classeStatus } from '@/src/utils/status';
import { EVENTO_AGENDA_ALTERADA } from '@/src/components/CardAgenda';

const CHAVE_PROFISSIONAL = 'profissionalId'
// intervalo da atualização automática do painel
const INTERVALO_MS = 10000

function hojeLocal() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function hora(data: Date | null) {
  return data ? new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
}

async function buscarProfissionais(termo: string): Promise<ItemBusca[]> {
  const res = termo
    ? await api.get('/funcionarioBuscarNome', { params: { descricao: termo } })
    : await api.get('/funcionarioBuscar')
  const lista = Array.isArray(res.data) ? res.data as Funcionario[] : []
  return lista.map((f) => ({ id: f.id!, texto: `#${f.id} ${f.descricao}` }))
}

export default function PainelProfissional() {
  const [profissional, setProfissional] = useState<Funcionario | null>(null)
  const [data, setData] = useState(hojeLocal())
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [mensagem, setMensagem] = useState('')
  const [aviso, setAviso] = useState('')
  // ids que já estavam liberados, para avisar só quando uma etapa nova for liberada
  const liberados = useRef<Set<number> | null>(null)

  useEffect(() => {
    // o navegador lembra quem é a profissional deste aparelho
    let id: string | null = null
    try { id = localStorage.getItem(CHAVE_PROFISSIONAL) } catch {}
    if (id) carregarProfissional(Number(id))
  }, [])

  useEffect(() => {
    if (!profissional) return
    liberados.current = null
    carregar()
    const intervalo = setInterval(carregar, INTERVALO_MS)
    window.addEventListener(EVENTO_AGENDA_ALTERADA, carregar)
    return () => {
      clearInterval(intervalo)
      window.removeEventListener(EVENTO_AGENDA_ALTERADA, carregar)
    }
  }, [profissional, data])

  async function carregarProfissional(id: number) {
    const res = await api.get('/funcionarioBuscarId', { params: { id: id } })
    if (res.data?.id) setProfissional(res.data as Funcionario)
  }

  async function carregar() {
    if (!profissional) return
    try {
      const res = await api.get('/agendaBuscarFuncionario', { params: { funcionarioId: profissional.id, data: data } })
      const lista = res.data as Agenda[]

      const liberadosAgora = new Set(lista.filter((a) => a.status === 'liberado').map((a) => a.id!))
      if (liberados.current) {
        const novos = lista.filter((a) => liberadosAgora.has(a.id!) && !liberados.current!.has(a.id!))
        if (novos.length) {
          setAviso(novos.map((a) => `${a.cliente?.descricao} liberado(a) para ${a.tipoAgenda?.descricao}`).join('. '))
        }
      }
      liberados.current = liberadosAgora

      setAgendas(lista)
    } catch (error) {
      console.error(error)
    }
  }

  function escolherProfissional(item: ItemBusca) {
    try { localStorage.setItem(CHAVE_PROFISSIONAL, String(item.id)) } catch {}
    setAviso('')
    carregarProfissional(item.id)
  }

  function trocarProfissional() {
    try { localStorage.removeItem(CHAVE_PROFISSIONAL) } catch {}
    setProfissional(null)
    setAgendas([])
    setAviso('')
  }

  async function mudarStatus(rota: '/agendaIniciar' | '/agendaConcluir', id: number) {
    try {
      // corpo vazio em JSON: sem corpo o Fastify recusa o PUT com 415
      const res = await api.put(rota, {}, { params: { id: id } })
      // a API devolve texto quando a ação não é permitida
      setMensagem(typeof res.data === 'string' ? res.data : '')
    } catch (error) {
      console.error(error)
      setMensagem('Não foi possível atualizar o atendimento. Tente de novo.')
    }
    carregar()
  }

  if (!profissional) {
    return (
      <div>
        <h1 className='titulo'>Painel da profissional</h1>
        <div className='containerCadastro'>
          <div className='formAgenda formCadastro'>
            <h2 className='tituloFormAgenda'>Quem está usando este aparelho?</h2>
            <CampoBusca
              id='painelProfissional'
              label='Profissional:'
              placeholder='Seu nome'
              selecionado=''
              buscar={buscarProfissionais}
              onSelecionar={escolherProfissional}/>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className='titulo'>Painel de #{profissional.id} {profissional.descricao}</h1>
      <div className='barraPainel'>
        <label htmlFor='painelData'>Dia:</label>
        <input id='painelData' type='date' value={data} onChange={(e) => setData(e.target.value)}/>
        <button className='botaoForm' onClick={trocarProfissional}>Trocar profissional</button>
      </div>

      <p role='status' aria-live='polite' className={aviso ? 'avisoLiberado' : 'mensagemCadastro'}>{aviso}</p>
      <p role='alert' className='mensagemCadastro'>{mensagem}</p>

      {agendas.length === 0 && <p className='titulo'>Nenhum atendimento neste dia</p>}
      <div className='containerAgendaDia'>
        {agendas.map((a) => (
          <div className={`agendaDia ${a.status === 'liberado' ? 'cardLiberado' : ''}`} key={a.id}>
            <span className={classeStatus(a.status)}>{rotuloStatus[a.status || 'agendado']}</span>
            <div className='containerCondeudo'>
              <h1>{hora(a.horaInicio)} – {hora(a.horaFim)}</h1>
              <h2>Cliente: #{a.clienteId} {a.cliente?.descricao}</h2>
              <h2>Serviço: {a.tipoAgenda?.descricao}</h2>
              <h2>{a.descricao}</h2>
            </div>
            {a.status === 'liberado' && <button className='botaoAcao' onClick={() => mudarStatus('/agendaIniciar', a.id!)}>Iniciar</button>}
            {a.status === 'em_andamento' && <button className='botaoAcao' onClick={() => mudarStatus('/agendaConcluir', a.id!)}>Concluir</button>}
          </div>
        ))}
      </div>
    </div>
  )
}
