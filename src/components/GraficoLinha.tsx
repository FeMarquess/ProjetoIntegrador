import { useEffect, useRef, useState } from 'react';

export interface PontoGrafico {
    rotulo: string,       // eixo X, ex.: "ter 27/10"
    rotuloLongo: string,  // tooltip e tabela, ex.: "terça, 27/10"
    valor: number
}

interface props {
    titulo: string,
    pontos: PontoGrafico[],
    formatar?: (valor: number) => string
}

// altura fixa; a largura acompanha o cartão em pixels reais, para o texto não crescer junto
const ALTURA = 240
const MARGEM = { topo: 24, direita: 16, baixo: 32, esquerda: 32 }

// Linha de uma série com mira (crosshair) que se prende ao ponto mais próximo
export default function GraficoLinha({ titulo, pontos, formatar = (v) => String(v) }: props) {
    const [ativo, setAtivo] = useState<number | null>(null)
    const area = useRef<HTMLDivElement>(null)
    const [largura, setLargura] = useState(640)

    useEffect(() => {
        if (!area.current) return
        const observador = new ResizeObserver(([entrada]) => setLargura(Math.max(320, entrada.contentRect.width)))
        observador.observe(area.current)
        return () => observador.disconnect()
    }, [])

    const larguraUtil = largura - MARGEM.esquerda - MARGEM.direita
    const alturaUtil = ALTURA - MARGEM.topo - MARGEM.baixo
    const maximo = Math.max(...pontos.map((p) => p.valor), 0)
    // topo do eixo em número redondo, com pelo menos 4 para a escala não ficar exagerada
    const topoEixo = Math.max(4, Math.ceil(maximo / 2) * 2)
    const passoTick = topoEixo <= 8 ? (topoEixo <= 4 ? 1 : 2) : Math.ceil(topoEixo / 4)
    const ticks = Array.from({ length: Math.floor(topoEixo / passoTick) + 1 }, (_, i) => i * passoTick)

    const x = (i: number) => MARGEM.esquerda + (pontos.length > 1 ? (i / (pontos.length - 1)) * larguraUtil : larguraUtil / 2)
    const y = (v: number) => MARGEM.topo + alturaUtil - (v / topoEixo) * alturaUtil
    const caminho = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.valor)}`).join(' ')
    const larguraFaixa = pontos.length > 1 ? larguraUtil / (pontos.length - 1) : larguraUtil

    // rótulo direto só no pico, para não poluir com número em todo ponto
    const indicePico = maximo > 0 ? pontos.findIndex((p) => p.valor === maximo) : -1
    // com muitos dias, mostra um rótulo do eixo X sim, outro não
    // rótulos do eixo X com pelo menos ~70px entre eles
    const saltoRotulo = Math.max(1, Math.ceil(pontos.length / Math.floor(larguraUtil / 70)))

    const pontoAtivo = ativo !== null ? pontos[ativo] : null

    return (
        <figure className='grafico'>
            <figcaption className='tituloGrafico'>{titulo}</figcaption>
            <div className='areaLinha' ref={area} onMouseLeave={() => setAtivo(null)}>
                <svg width={largura} height={ALTURA} viewBox={`0 0 ${largura} ${ALTURA}`} className='svgLinha' role='img'
                    aria-label={`${titulo}. Pico de ${maximo} em ${indicePico >= 0 ? pontos[indicePico].rotuloLongo : 'nenhum dia'}. Valores na tabela abaixo.`}>
                    {ticks.map((t) => (
                        <g key={t}>
                            <line className='gradeLinha' x1={MARGEM.esquerda} x2={largura - MARGEM.direita} y1={y(t)} y2={y(t)}/>
                            <text className='tickLinha' x={MARGEM.esquerda - 8} y={y(t)} textAnchor='end' dominantBaseline='middle'>{t}</text>
                        </g>
                    ))}
                    {pontos.map((p, i) => i % saltoRotulo === 0 && (
                        <text key={p.rotulo} className='tickLinha' x={x(i)} y={ALTURA - 10} textAnchor='middle'>{p.rotulo}</text>
                    ))}

                    {ativo !== null && (
                        <line className='miraLinha' x1={x(ativo)} x2={x(ativo)} y1={MARGEM.topo} y2={MARGEM.topo + alturaUtil}/>
                    )}

                    <path className='tracoLinha' d={caminho}/>
                    {pontos.map((p, i) => (
                        <circle key={p.rotulo} className='pontoLinha' cx={x(i)} cy={y(p.valor)} r={ativo === i ? 6 : 4}/>
                    ))}
                    {indicePico >= 0 && ativo === null && (
                        <text className='rotuloPico' x={x(indicePico)} y={y(maximo) - 12} textAnchor='middle'>{formatar(maximo)}</text>
                    )}

                    {/* faixas invisíveis por dia: o mouse não precisa acertar a linha */}
                    {pontos.map((p, i) => (
                        <rect key={p.rotulo} className='alvoLinha'
                            x={x(i) - larguraFaixa / 2} y={MARGEM.topo} width={larguraFaixa} height={alturaUtil}
                            onMouseEnter={() => setAtivo(i)}/>
                    ))}
                </svg>
                {pontoAtivo && ativo !== null && (
                    <div className='tooltipLinha' style={{ left: `${(x(ativo) / largura) * 100}%` }} aria-hidden='true'>
                        <strong>{pontoAtivo.rotuloLongo}</strong>
                        <span>{formatar(pontoAtivo.valor)}</span>
                    </div>
                )}
            </div>
            <details className='tabelaGrafico'>
                <summary>Ver tabela</summary>
                <table>
                    <tbody>
                        {pontos.map((p) => (
                            <tr key={p.rotulo}>
                                <th scope='row'>{p.rotuloLongo}</th>
                                <td>{formatar(p.valor)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </details>
        </figure>
    )
}
