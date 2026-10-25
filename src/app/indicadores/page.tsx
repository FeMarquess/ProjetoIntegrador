'use client'
import { useEffect, useState } from 'react'
import { api } from '@/src/services/api';
import GraficoBarras from '@/src/components/GraficoBarras';

interface ServicoIndicador {
  id: number
  descricao: string
  total: number
  idadeMedia: number | null
  profissionais: { id: number, descricao: string, total: number }[]
}

interface Indicadores {
  totalAtendimentos: number
  servicos: ServicoIndicador[]
  faixas: { faixa: string, total: number }[]
}

export default function PaginaIndicadores() {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null)
  const [servicoId, setServicoId] = useState<number | null>(null)

  useEffect(() => {
    api.get('/indicadores')
      .then((res) => {
        const dados = res.data as Indicadores
        setIndicadores(dados)
        // começa pelo serviço mais procurado
        if (dados.servicos.length) setServicoId(dados.servicos[0].id)
      })
      .catch((error) => console.error(error))
  }, [])

  if (!indicadores) return <p className='titulo'>Carregando indicadores…</p>

  const total = indicadores.totalAtendimentos
  const percentual = (valor: number) => total ? `${Math.round((valor / total) * 100)}% dos atendimentos` : ''
  const maisProcurado = indicadores.servicos[0]
  const faixaTop = [...indicadores.faixas].sort((a, b) => b.total - a.total)[0]
  const servicoSelecionado = indicadores.servicos.find((s) => s.id === servicoId)
  const comIdade = indicadores.servicos.filter((s) => s.idadeMedia !== null)

  return (
    <div className='paginaIndicadores'>
      <h1 className='titulo'>Indicadores do salão</h1>
      <p className='notaIndicadores'>Considera apenas atendimentos concluídos.</p>

      <section className='blocosResumo' aria-label='Resumo'>
        <div className='blocoResumo'>
          <span className='rotuloResumo'>Atendimentos concluídos</span>
          <span className='numeroResumo'>{total}</span>
        </div>
        <div className='blocoResumo'>
          <span className='rotuloResumo'>Serviço mais procurado</span>
          <span className='numeroResumo'>{maisProcurado?.descricao || '—'}</span>
          {maisProcurado && <span className='detalheResumo'>{maisProcurado.total} atendimentos · {percentual(maisProcurado.total)}</span>}
        </div>
        <div className='blocoResumo'>
          <span className='rotuloResumo'>Faixa etária que mais procurou</span>
          <span className='numeroResumo'>{faixaTop?.total ? faixaTop.faixa : '—'}</span>
          {faixaTop?.total ? <span className='detalheResumo'>{faixaTop.total} atendimentos</span> : null}
        </div>
      </section>

      <div className='gradeGraficos'>
        <GraficoBarras
          titulo='Serviços mais procurados'
          itens={indicadores.servicos.map((s) => ({ rotulo: s.descricao, valor: s.total }))}
          detalhe={(item) => percentual(item.valor)}/>

        <div>
          <div className='filtroGrafico'>
            <label htmlFor='filtroServico'>Profissionais do serviço:</label>
            <select id='filtroServico' value={servicoId ?? ''} onChange={(e) => setServicoId(Number(e.target.value))}>
              {indicadores.servicos.map((s) => (
                <option key={s.id} value={s.id}>{s.descricao}</option>
              ))}
            </select>
          </div>
          <GraficoBarras
            titulo={`Quem mais atendeu ${servicoSelecionado?.descricao || ''}`}
            itens={(servicoSelecionado?.profissionais || []).map((p) => ({ rotulo: `#${p.id} ${p.descricao}`, valor: p.total }))}
            formatar={(v) => `${v} atend.`}/>
        </div>

        <GraficoBarras
          titulo='Atendimentos por faixa etária'
          itens={indicadores.faixas.map((f) => ({ rotulo: f.faixa, valor: f.total }))}
          detalhe={(item) => percentual(item.valor)}/>

        <GraficoBarras
          titulo='Idade média das clientes por serviço'
          itens={comIdade.map((s) => ({ rotulo: s.descricao, valor: s.idadeMedia! }))}
          formatar={(v) => `${v} anos`}/>
      </div>
    </div>
  )
}
