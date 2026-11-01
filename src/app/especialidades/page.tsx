'use client'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/src/services/api';
import { TipoAgenda } from '@/src/types/tipoAgenda';

const tipoVazio = { id: 0, descricao: '' }

export default function Especialidades() {
  const [tipos, setTipos] = useState<TipoAgenda[]>([])
  const [tipo, setTipo] = useState<TipoAgenda>(tipoVazio)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    try {
      const res = await api.get('/tipoAgendaBuscar')
      setTipos(res.data as TipoAgenda[])
    } catch (error) {
      console.error(error)
    }
  }

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const dados = { descricao: tipo.descricao }

    if (tipo.id) {
      await api.put('/alterarTipoAgenda', dados, { params: { id: tipo.id } })
      setMensagem('Especialidade alterada')
    } else {
      await api.post('/tipoAgenda', dados)
      setMensagem('Especialidade cadastrada')
    }

    setTipo(tipoVazio)
    carregar()
  }

  async function deletarTipo(id: number) {
    const res = await api.delete('/deletarTipoAgenda', { params: { id: id } })
    // a API devolve texto quando o delete falha (ex.: especialidade em uso)
    setMensagem(typeof res.data === 'string' ? res.data : 'Especialidade excluída')
    carregar()
  }

  return (
    <div>
      <h1 className='titulo'>Especialidades</h1>
      <div className='containerCadastro'>
        <form className='formAgenda formCadastro' onSubmit={salvar}>
          <h2 className='tituloFormAgenda'>{tipo.id ? `Editar especialidade #${tipo.id}` : 'Nova especialidade'}</h2>
          <div>
            <label htmlFor='descricao'>Nome:</label>
            <input
              id='descricao'
              type='text'
              value={tipo.descricao}
              onChange={(e) => setTipo({ ...tipo, descricao: e.target.value })}
              required/>
          </div>
          <div>
            {tipo.id ? <button type='button' className='botaoForm' onClick={() => setTipo(tipoVazio)}>Cancelar</button> : <span/>}
            <button type='submit' className='botaoForm'>Salvar</button>
          </div>
          <p role='status' className='mensagemCadastro'>{mensagem}</p>
        </form>
      </div>

      <div className='containerAgendaDia'>
        {tipos.map((t) => (
          <div className='agendaDia' key={t.id}>
            <div className='botoesCard'>
              <button className='botaoEditar' aria-label={`Editar ${t.descricao}`} onClick={() => { setMensagem(''); setTipo(t) }}><FontAwesomeIcon icon={faPen} /></button>
              <button className='botaoExcluir' aria-label={`Excluir ${t.descricao}`} onClick={() => deletarTipo(t.id)}><FontAwesomeIcon icon={faTrash} /></button>
            </div>
            <div className='containerCondeudo'>
              <h1>#{t.id} {t.descricao}</h1>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
