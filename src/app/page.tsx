'use client'

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faCalendar, faUserTie, faClipboardList, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/src/services/api';
import { useEventosAgenda } from '@/src/services/eventos';
import { Agenda } from '@/src/types/agenda';
import { classeStatus, rotuloAgenda, rotuloStatus } from '@/src/utils/status';
import { horaCurta } from '@/src/utils/dataHora';
import { agruparPorProfissional, agruparVisitas, filtrarAgendas, filtrarVisitas, FiltroStatus, Visao } from '@/src/utils/painelDia';
import { EVENTO_AGENDA_ALTERADA } from '@/src/components/CardAgenda';

// a escolha de visão e filtro fica salva neste aparelho
const CHAVE_PREFERENCIA = 'painelDia'

function hojeLocal() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const VISOES: { valor: Visao, rotulo: string }[] = [
  { valor: 'profissional', rotulo: 'Profissional' },
  { valor: 'cliente', rotulo: 'Cliente' }
]

const FILTROS: { valor: FiltroStatus, rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'abertos', rotulo: 'Em aberto' },
  { valor: 'concluidos', rotulo: 'Concluídos' }
]

export default function Home() {
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [visao, setVisao] = useState<Visao>('profissional')
  const [filtro, setFiltro] = useState<FiltroStatus>('todos')

  async function carregar() {
    try {
      // a agenda do dia já vem com nomes de cliente, profissional e serviço
      const res = await api.get('/agendaBuscarData', { params: { data: hojeLocal() } })
      setAgendas(res.data as Agenda[])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_PREFERENCIA) || '{}')
      if (salvo.visao === 'profissional' || salvo.visao === 'cliente') setVisao(salvo.visao)
      if (FILTROS.some((f) => f.valor === salvo.filtro)) setFiltro(salvo.filtro)
    } catch {}
    carregar()
    // reserva: as mudanças chegam na hora por /eventos; a consulta periódica cobre quedas de conexão
    const intervalo = setInterval(carregar, 30000)
    window.addEventListener(EVENTO_AGENDA_ALTERADA, carregar)
    return () => {
      clearInterval(intervalo)
      window.removeEventListener(EVENTO_AGENDA_ALTERADA, carregar)
    }
  }, [])

  // tempo real: qualquer mudança feita em outro aparelho atualiza o painel do dia na hora
  useEventosAgenda(() => { carregar() })

  function escolher(novaVisao: Visao, novoFiltro: FiltroStatus) {
    setVisao(novaVisao)
    setFiltro(novoFiltro)
    try { localStorage.setItem(CHAVE_PREFERENCIA, JSON.stringify({ visao: novaVisao, filtro: novoFiltro })) } catch {}
  }

  const visitas = agruparVisitas(agendas)
  // contagem de cada filtro na unidade da visão atual (atendimentos ou visitas)
  const contagem = (f: FiltroStatus) => visao === 'cliente' ? filtrarVisitas(visitas, f).length : filtrarAgendas(agendas, f).length

  const colunas = agruparPorProfissional(filtrarAgendas(agendas, filtro))
  const visitasFiltradas = filtrarVisitas(visitas, filtro)
  const vazio = visao === 'cliente' ? visitasFiltradas.length === 0 : colunas.length === 0

  return (
    <div className='homePage'>
      <h1 className='titulo'>Salão — painel do dia</h1>

      <nav className='botoesHome' aria-label='Ações principais'>
        <Link href='/clientes' className='botaoHome'><FontAwesomeIcon icon={faUserPlus} /> Cadastrar cliente</Link>
        <Link href='/profissionais' className='botaoHome'><FontAwesomeIcon icon={faUserTie} /> Cadastrar profissional</Link>
        <Link href='/agenda' className='botaoHome'><FontAwesomeIcon icon={faCalendar} /> Ver agenda</Link>
        <Link href='/painel' className='botaoHome'><FontAwesomeIcon icon={faClipboardList} /> Painel da profissional</Link>
        <Link href='/indicadores' className='botaoHome'><FontAwesomeIcon icon={faChartBar} /> Indicadores</Link>
      </nav>

      <section className='painel' aria-label='Atendimentos de hoje'>
        <div className='cabecalhoPainel'>
          <h2 className='tituloPainel'>Atendimentos de hoje ({new Date().toLocaleDateString('pt-BR')})</h2>
          <div className='filtrosPainel'>
            <div className='atalhos' role='group' aria-label='Ver por'>
              <span className='rotuloFiltro'>Ver por</span>
              {VISOES.map((v) => (
                <button key={v.valor} type='button' aria-pressed={visao === v.valor}
                  className={`atalho ${visao === v.valor ? 'atalhoAtivo' : ''}`}
                  onClick={() => escolher(v.valor, filtro)}>{v.rotulo}</button>
              ))}
            </div>
            <div className='atalhos' role='group' aria-label='Mostrar'>
              <span className='rotuloFiltro'>Mostrar</span>
              {FILTROS.map((f) => (
                <button key={f.valor} type='button' aria-pressed={filtro === f.valor}
                  className={`atalho ${filtro === f.valor ? 'atalhoAtivo' : ''}`}
                  onClick={() => escolher(visao, f.valor)}>{f.rotulo} ({contagem(f.valor)})</button>
              ))}
            </div>
          </div>
        </div>

        {vazio && (
          <p className='semEventos'>
            {agendas.length === 0 ? 'Nenhum atendimento hoje' : filtro === 'abertos' ? 'Nada em aberto: tudo de hoje já foi concluído' : 'Nada concluído ainda hoje'}
          </p>
        )}

        {visao === 'profissional' && (
          <div className='colunasPainel'>
            {colunas.map((c) => (
              <div className='colunaPainel' key={c.chave}>
                <h3>{c.profissional}</h3>
                {c.agendas.map((a) => (
                  <Link href={`/agenda/evento/${a.id}?id=${a.id}`} className='itemPainel' key={a.id}>
                    <strong>{horaCurta(a.horaInicio)} – {horaCurta(a.horaFim)}</strong>
                    <span>{a.tipoAgenda?.descricao} · {a.cliente?.descricao || 'Sem cliente'}</span>
                    <span className={classeStatus(a.status)}>{rotuloAgenda(a)}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}

        {visao === 'cliente' && (
          <div className='listaVisitas'>
            {visitasFiltradas.map((v) => (
              <div className='visitaPainel' key={v.chave}>
                <div className='cabecalhoVisita'>
                  <h3>{v.cliente}</h3>
                  <span>{v.concluidas} de {v.etapas.length} etapa{v.etapas.length === 1 ? '' : 's'} concluída{v.etapas.length === 1 ? '' : 's'}</span>
                </div>
                <ol className='cadeiaVisita'>
                  {v.etapas.map((a, i) => (
                    <Fragment key={a.id}>
                      {i > 0 && <li className='setaVisita' aria-hidden='true'>→</li>}
                      <li className='etapaCadeia'>
                        <Link href={`/agenda/evento/${a.id}?id=${a.id}`}
                          className={`itemPainel ${a.status === 'liberado' || a.status === 'em_andamento' ? 'cardLiberado' : ''}`}>
                          <strong>{horaCurta(a.horaInicio)} {a.tipoAgenda?.descricao}</strong>
                          <span>{a.funcionario?.descricao}</span>
                          {/* na cadeia a etapa anterior já está à esquerda, então o selo fica curto */}
                          <span className={classeStatus(a.status)}>{a.status === 'agendado' ? 'Aguardando' : rotuloStatus[a.status || 'agendado']}</span>
                        </Link>
                      </li>
                    </Fragment>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
