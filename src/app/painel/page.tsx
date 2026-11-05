'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, mensagemErro } from '@/src/services/api';
import { useEventosAgenda } from '@/src/services/eventos';
import { Agenda } from '@/src/types/agenda';
import { Funcionario } from '@/src/types/funcionario';
import CampoBusca, { ItemBusca } from '@/src/components/CampoBusca';
import { classeStatus, rotuloAgenda } from '@/src/utils/status';
import { EVENTO_AGENDA_ALTERADA } from '@/src/components/CardAgenda';

const CHAVE_PROFISSIONAL = 'profissionalId'
// reserva: as mudanças chegam na hora por /eventos; a consulta periódica cobre quedas de conexão
const INTERVALO_MS = 30000

function hojeLocal() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function hora(data: Date | string | null | undefined) {
  return data ? new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
}

async function buscarProfissionais(termo: string): Promise<ItemBusca[]> {
  const res = termo
    ? await api.get('/funcionarioBuscarNome', { params: { descricao: termo } })
    : await api.get('/funcionarioBuscar')
  const lista = Array.isArray(res.data) ? res.data as Funcionario[] : []
  return lista.map((f) => ({ id: f.id!, texto: `#${f.id} ${f.descricao}` }))
}

// Notificação do sistema (aparece mesmo com a aba em segundo plano), se a profissional permitiu
function notificarNavegador(texto: string) {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Etapa liberada', { body: texto, tag: 'etapa-liberada' })
    }
  } catch (error) {
    console.error(error)
  }
}

export default function PainelProfissional() {
  const [profissional, setProfissional] = useState<Funcionario | null>(null)
  const [data, setData] = useState(hojeLocal())
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [mensagem, setMensagem] = useState('')
  const [aviso, setAviso] = useState('')
  const [permissao, setPermissao] = useState<NotificationPermission | 'indisponivel'>('indisponivel')
  // ids que já estavam liberados, para avisar só quando uma etapa nova for liberada
  const liberados = useRef<Set<number> | null>(null)

  const carregar = useCallback(async () => {
    if (!profissional) return
    try {
      const res = await api.get('/agendaBuscarFuncionario', { params: { funcionarioId: profissional.id, data: data } })
      const lista = res.data as Agenda[]

      const liberadosAgora = new Set(lista.filter((a) => a.status === 'liberado').map((a) => a.id!))
      if (liberados.current) {
        const novos = lista.filter((a) => liberadosAgora.has(a.id!) && !liberados.current!.has(a.id!))
        if (novos.length) {
          const texto = novos.map((a) => `${a.cliente?.descricao} liberado(a) para ${a.tipoAgenda?.descricao}`).join('. ')
          setAviso(texto)
          notificarNavegador(texto)
        }
      }
      liberados.current = liberadosAgora

      setAgendas(lista)
    } catch (error) {
      console.error(error)
    }
  }, [profissional, data])

  async function carregarProfissional(id: number) {
    try {
      const res = await api.get('/funcionarioBuscarId', { params: { id: id } })
      if (res.data?.id) setProfissional(res.data as Funcionario)
    } catch (error) {
      // profissional apagada ou id inválido: volta para a escolha
      console.error(error)
      try { localStorage.removeItem(CHAVE_PROFISSIONAL) } catch {}
    }
  }

  useEffect(() => {
    // o navegador lembra quem é a profissional deste aparelho
    let id: string | null = null
    try { id = localStorage.getItem(CHAVE_PROFISSIONAL) } catch {}
    if (id) carregarProfissional(Number(id))
    if (typeof Notification !== 'undefined') setPermissao(Notification.permission)
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
  }, [profissional, carregar])

  // tempo real: qualquer mudança nas agendas desta profissional recarrega o painel na hora
  useEventosAgenda((evento) => {
    if (profissional && evento.dados.funcionarioId === profissional.id) carregar()
  })

  async function ativarNotificacoes() {
    if (typeof Notification === 'undefined') return
    setPermissao(await Notification.requestPermission())
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
      await api.put(rota, {}, { params: { id: id } })
      setMensagem('')
    } catch (error) {
      // ex.: 409 "A etapa anterior desta cliente ainda não foi concluída"
      setMensagem(mensagemErro(error, 'Não foi possível atualizar o atendimento. Tente de novo.'))
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
      <h1 className='titulo'>Painel de {profissional.descricao}</h1>
      <div className='barraPainel'>
        <label htmlFor='painelData'>Dia:</label>
        <input id='painelData' type='date' value={data} onChange={(e) => setData(e.target.value)}/>
        <button className='botaoForm' onClick={trocarProfissional}>Trocar profissional</button>
        {permissao === 'default' && (
          <button className='botaoForm botaoNotificacao' onClick={ativarNotificacoes}>Ativar notificações</button>
        )}
      </div>

      <p role='status' aria-live='polite' className={aviso ? 'avisoLiberado' : 'mensagemCadastro'}>{aviso}</p>
      <p role='alert' className='mensagemCadastro'>{mensagem}</p>

      {agendas.length === 0 && <p className='semEventos'>Nenhum atendimento neste dia</p>}
      <div className='containerAgendaDia'>
        {agendas.map((a) => (
          <div className={`agendaDia ${a.status === 'liberado' ? 'cardLiberado' : ''}`} key={a.id}>
            <span className={classeStatus(a.status)}>{rotuloAgenda(a)}</span>
            <div className='containerCondeudo'>
              <h1 className='tituloAgenda'>{hora(a.horaInicio)} – {hora(a.horaFim)} · {a.tipoAgenda?.descricao}</h1>
              <h2>{a.cliente?.descricao || 'Sem cliente'}</h2>
              {a.horaFimPrevista && <h2 className='detalheCard'>Terminou antes: previsto até {hora(a.horaFimPrevista)}</h2>}
              {a.descricao && a.descricao !== `${a.tipoAgenda?.descricao} — ${a.cliente?.descricao}` && <p className='notaAgenda'>{a.descricao}</p>}
            </div>
            {a.status === 'liberado' && <button className='botaoAcao' onClick={() => mudarStatus('/agendaIniciar', a.id!)}>Iniciar</button>}
            {a.status === 'em_andamento' && <button className='botaoAcao' onClick={() => mudarStatus('/agendaConcluir', a.id!)}>Concluir</button>}
          </div>
        ))}
      </div>
    </div>
  )
}
