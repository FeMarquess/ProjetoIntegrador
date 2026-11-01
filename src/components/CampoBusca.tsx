import { useEffect, useState } from 'react';

export interface ItemBusca {
    id: number,
    texto: string
}

interface props {
    id: string,
    label: string,
    placeholder: string,
    // texto do item já escolhido (ex.: ao editar uma agenda)
    selecionado: string,
    buscar: (termo: string) => Promise<ItemBusca[]>,
    onSelecionar: (item: ItemBusca) => void
}

// Campo de texto que pesquisa na API enquanto digita e deixa o operador escolher um dos resultados
export default function CampoBusca({ id, label, placeholder, selecionado, buscar, onSelecionar }: props) {
    const [termo, setTermo] = useState(selecionado)
    const [resultados, setResultados] = useState<ItemBusca[]>([])
    const [aberto, setAberto] = useState(false)
    const [buscando, setBuscando] = useState(false)

    useEffect(() => {
        setTermo(selecionado)
    }, [selecionado])

    useEffect(() => {
        if (!aberto) return
        setBuscando(true)
        const espera = setTimeout(() => {
            buscar(termo)
                .then(setResultados)
                .catch((error) => console.error(error))
                .finally(() => setBuscando(false))
        }, 300)
        return () => clearTimeout(espera)
    }, [termo, aberto])

    function escolher(item: ItemBusca) {
        setTermo(item.texto)
        setAberto(false)
        onSelecionar(item)
    }

    return (
        <div className='campoBusca'>
            <label htmlFor={id}>{label}</label>
            <div className='campoBuscaInput'>
                <input
                    id={id}
                    type='search'
                    autoComplete='off'
                    placeholder={placeholder}
                    value={termo}
                    role='combobox'
                    aria-expanded={aberto}
                    aria-controls={`${id}-resultados`}
                    onFocus={() => setAberto(true)}
                    onBlur={() => setAberto(false)}
                    onChange={(e) => { setTermo(e.target.value); setAberto(true) }}/>
                {aberto && (
                    <ul id={`${id}-resultados`} role='listbox' className='resultadosBusca'>
                        {buscando && <li className='semResultado'>Buscando…</li>}
                        {!buscando && resultados.length === 0 && <li className='semResultado'>Nenhum resultado</li>}
                        {resultados.map((item) => (
                            <li
                                key={item.id}
                                role='option'
                                aria-selected={false}
                                // mousedown para escolher antes do input perder o foco
                                onMouseDown={(e) => { e.preventDefault(); escolher(item) }}>
                                {item.texto}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
