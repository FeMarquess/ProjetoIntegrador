import { useRouter } from 'next/navigation'
import { useState } from 'react';

export default function Pesquisa () {
const [valor, setValor] = useState('') 
const router = useRouter()

async function carregar(e: React.FormEvent) {
        e.preventDefault()
try {
    router.push(`/agenda/pesquisa?descricao=${encodeURIComponent(valor)}`);
    } catch (error) {
    console.error(error)
    }
}

return(
    <div className='pesquisaNav'>
        <form className='formPesquisa' role='search' onSubmit={carregar}>
            <input value={valor}
                    type='search'
                    aria-label='Pesquisar agendamentos'
                    placeholder='Buscar agendamento'
                    onChange={(e) => setValor(e.target.value)}
                    style={{backgroundColor: 'gray', border: 'rounded', borderRadius: '6px'}}>
            </input>
            <button type='submit'>Pesquisar</button>
        </form>
    </div>
    )
}