import { useRouter } from 'next/navigation'
import { useState } from 'react';

export default function Pesquisa () {
const [valor, setValor] = useState('') 
const router = useRouter()

console.log(valor)

async function carregar(e: React.FormEvent) {
        e.preventDefault()
try {
    router.push(`/agenda/pesquisa?descricao=${valor}`);
    } catch (error) {
    console.error(error)
    }
}

return(
    <div>
        <form onSubmit={carregar}>
            <input value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    style={{backgroundColor: 'gray', border: 'rounded', borderRadius: '6px', marginRight: '10px'}}>                        
            </input>
            <button type='submit'>Pesquisar</button>
        </form>
    </div>
    )
}