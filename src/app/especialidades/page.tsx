'use client'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { api, mensagemErro } from '@/src/services/api';
import { TipoAgenda } from '@/src/types/tipoAgenda';
import ConfirmarExclusao from '@/src/components/ConfirmarExclusao';

const tipoVazio = { id: 0, descricao: '' }

export default function Especialidades() {
  const [tipos, setTipos] = useState<TipoAgenda[]>([])
  const [tipo, setTipo] = useState<TipoAgenda>(tipoVazio)
  const [mensagem, setMensagem] = useState('')
  const [excluindo, setExcluindo] = useState<number | null>(null)

  async function carregar() {
    try {
      const res = await api.get('/tipoAgendaBuscar')
      setTipos(res.data as TipoAgenda[])
    } catch (error) {
      console.error(error)
      setMensagem(mensagemErro(error))
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const dados = { descricao: tipo.descricao }

    try {
      if (tipo.id) {
        await api.put('/alterarTipoAgenda', dados, { params: { id: tipo.id } })
        setMensagem('Especialidade alterada')
      } else {
        await api.post('/tipoAgenda', dados)
        setMensagem('Especialidade cadastrada')
      }
      setTipo(tipoVazio)
      carregar()
    } catch (error) {
      setMensagem(mensagemErro(error))
    }
  }

  async function deletarTipo(id: number) {
    try {
      await api.delete('/deletarTipoAgenda', { params: { id: id } })
      setMensagem('Especialidade excluída')
    } catch (error) {
      // ex.: especialidade em uso por uma profissional
      setMensagem(mensagemErro(error))
    }
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
              <button className='botaoExcluir' aria-label={`Excluir ${t.descricao}`} onClick={() => setExcluindo(t.id)}><FontAwesomeIcon icon={faTrash} /></button>
            </div>
            <div className='containerCondeudo'>
              <h1 className='nomeCard'>{t.descricao}</h1>
              {excluindo === t.id && (
                <ConfirmarExclusao
                  texto={`Excluir a especialidade ${t.descricao}?`}
                  onCancelar={() => setExcluindo(null)}
                  onConfirmar={() => { setExcluindo(null); deletarTipo(t.id) }}/>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
