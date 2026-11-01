export interface ItemGrafico {
    rotulo: string,
    valor: number
}

interface props {
    titulo: string,
    itens: ItemGrafico[],
    // texto do valor, ex.: (v) => `${v} anos`
    formatar?: (valor: number) => string,
    // texto extra no tooltip, ex.: percentual do total
    detalhe?: (item: ItemGrafico) => string
}

// Barras horizontais de uma série: comprimento = valor, valor escrito na ponta, tooltip no hover/foco
export default function GraficoBarras({ titulo, itens, formatar = (v) => String(v), detalhe }: props) {
    const maximo = Math.max(...itens.map((i) => i.valor), 1)

    return (
        <figure className='grafico'>
            <figcaption className='tituloGrafico'>{titulo}</figcaption>
            {itens.length === 0 && <p className='semDados'>Sem dados</p>}
            <div className='barras' role='list'>
                {itens.map((item) => (
                    <div className='linhaBarra' role='listitem' key={item.rotulo} tabIndex={0}
                        aria-label={`${item.rotulo}: ${formatar(item.valor)}${detalhe ? `, ${detalhe(item)}` : ''}`}>
                        <span className='rotuloBarra'>{item.rotulo}</span>
                        <span className='trilhaBarra'>
                            <span className='barra' style={{ width: `${(item.valor / maximo) * 100}%` }}/>
                            <span className='valorBarra'>{formatar(item.valor)}</span>
                        </span>
                        <span className='tooltipBarra' aria-hidden='true'>
                            <strong>{item.rotulo}</strong>
                            <span>{formatar(item.valor)}</span>
                            {detalhe && <span>{detalhe(item)}</span>}
                        </span>
                    </div>
                ))}
            </div>
            {itens.length > 0 && (
                <details className='tabelaGrafico'>
                    <summary>Ver tabela</summary>
                    <table>
                        <tbody>
                            {itens.map((item) => (
                                <tr key={item.rotulo}>
                                    <th scope='row'>{item.rotulo}</th>
                                    <td>{formatar(item.valor)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </details>
            )}
        </figure>
    )
}
