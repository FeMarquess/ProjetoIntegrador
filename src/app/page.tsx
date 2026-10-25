'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faCalendar, faUserTie, faClipboardList, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/src/services/api';
import { Agenda } from '@/src/types/agenda';
import { Cliente } from '@/src/types/cliente';
import { Funcionario } from '@/src/types/funcionario';
import { TipoAgenda } from '@/src/types/tipoAgenda';
import { rotuloStatus, classeStatus } from '@/src/utils/status';
import { EVENTO_AGENDA_ALTERADA } from '@/src/components/CardAgenda';

function hojeLocal() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function hora(data: Date | null) {
  return data ? new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
}

export default function Home() {
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [tipos, setTipos] = useState<TipoAgenda[]>([])

  useEffect(() => {
    carregar()
    // atualiza sozinho para acompanhar a triagem
    const intervalo = setInterval(carregar, 15000)
    window.addEventListener(EVENTO_AGENDA_ALTERADA, carregar)
    return () => {
      clearInterval(intervalo)
      window.removeEventListener(EVENTO_AGENDA_ALTERADA, carregar)
    }
  }, [])

  async function carregar() {
    try {
      const [resAgendas, resClientes, resFuncionarios, resTipos] = await Promise.all([
        api.get('/agendaBuscarData', { params: { data: hojeLocal() } }),
        api.get('/clienteBuscar'),
        api.get('/funcionarioBuscar'),
        api.get('/tipoAgendaBuscar')
      ])
      setAgendas(resAgendas.data as Agenda[])
      setClientes(resClientes.data as Cliente[])
      setFuncionarios(resFuncionarios.data as Funcionario[])
      setTipos(resTipos.data as TipoAgenda[])
    } catch (error) {
      console.error(error)
    }
  }

  const nomeCliente = (id: number) => clientes.find((c) => c.id === id)?.descricao || ''
  const nomeTipo = (id: number) => tipos.find((t) => t.id === id)?.descricao || ''

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
        <h2 className='tituloPainel'>Atendimentos de hoje ({new Date().toLocaleDateString('pt-BR')})</h2>
        {agendas.length === 0 && <p>Nenhum atendimento hoje</p>}
        <div className='colunasPainel'>
          {funcionarios
            .filter((f) => agendas.some((a) => a.funcionarioId === f.id))
            .map((f) => (
              <div className='colunaPainel' key={f.id}>
                <h3>#{f.id} {f.descricao}</h3>
                {agendas
                  .filter((a) => a.funcionarioId === f.id)
                  .sort((a, b) => new Date(a.horaInicio!).getTime() - new Date(b.horaInicio!).getTime())
                  .map((a) => (
                    <Link href={`/agenda/evento/${a.id}?id=${a.id}`} className='itemPainel' key={a.id}>
                      <strong>{hora(a.horaInicio)} – {hora(a.horaFim)}</strong>
                      <span>{nomeTipo(a.tipoAgendaId)} · {nomeCliente(a.clienteId)}</span>
                      <span className={classeStatus(a.status)}>{rotuloStatus[a.status || 'agendado']}</span>
                    </Link>
                  ))}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
