'use client'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/src/services/api';
import { Funcionario } from '@/src/types/funcionario';
import { TipoAgenda } from '@/src/types/tipoAgenda';

const funcionarioVazio: Funcionario = { id: null, descricao: '', funcao: 0 }

export default function Profissionais() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [tipos, setTipos] = useState<TipoAgenda[]>([])
  const [funcionario, setFuncionario] = useState<Funcionario>(funcionarioVazio)
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    carregar()
  }, [])

  async function carregar() {
    try {
      const [resFuncionarios, resTipos] = await Promise.all([
        api.get('/funcionarioBuscar'),
        api.get('/tipoAgendaBuscar')
      ])
      setFuncionarios(resFuncionarios.data as Funcionario[])
      setTipos(resTipos.data as TipoAgenda[])
    } catch (error) {
      console.error(error)
    }
  }

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const dados = { descricao: funcionario.descricao, funcao: funcionario.funcao }

    if (funcionario.id) {
      await api.put('/alterarFuncionario', dados, { params: { id: funcionario.id } })
      setMensagem('Profissional alterada')
    } else {
      await api.post('/funcionario', dados)
      setMensagem('Profissional cadastrada')
    }

    setFuncionario(funcionarioVazio)
    carregar()
  }

  async function deletarFuncionario(id: number) {
    const res = await api.delete('/deletarFuncionario', { params: { id: id } })
    // a API devolve texto quando o delete falha (ex.: profissional com agenda)
    setMensagem(typeof res.data === 'string' ? res.data : 'Profissional excluída')
    carregar()
  }

  function nomeTipo(id: number) {
    return tipos.find((t) => t.id === id)?.descricao || ''
  }

  return (
    <div>
      <h1 className='titulo'>Profissionais</h1>
      <div className='containerCadastro'>
        <form className='formAgenda formCadastro' onSubmit={salvar}>
          <h2 className='tituloFormAgenda'>{funcionario.id ? `Editar profissional #${funcionario.id}` : 'Nova profissional'}</h2>
          <div>
            <label htmlFor='descricao'>Nome:</label>
            <input
              id='descricao'
              type='text'
              value={funcionario.descricao}
              onChange={(e) => setFuncionario({ ...funcionario, descricao: e.target.value })}
              required/>
          </div>
          <div>
            <label htmlFor='funcao'>Especialidade:</label>
            <select
              id='funcao'
              value={funcionario.funcao || ''}
              onChange={(e) => setFuncionario({ ...funcionario, funcao: Number(e.target.value) })}
              required>
              <option value='' disabled>Selecione</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>{t.id} - {t.descricao}</option>
              ))}
            </select>
          </div>
          <div>
            {funcionario.id ? <button type='button' className='botaoForm' onClick={() => setFuncionario(funcionarioVazio)}>Cancelar</button> : <span/>}
            <button type='submit' className='botaoForm'>Salvar</button>
          </div>
          <p role='status' className='mensagemCadastro'>{mensagem}</p>
        </form>
      </div>

      <div className='containerAgendaDia'>
        {funcionarios.map((f) => (
          <div className='agendaDia' key={f.id}>
            <div className='botoesCard'>
              <button className='botaoEditar' aria-label={`Editar ${f.descricao}`} onClick={() => { setMensagem(''); setFuncionario(f) }}><FontAwesomeIcon icon={faPen} /></button>
              <button className='botaoExcluir' aria-label={`Excluir ${f.descricao}`} onClick={() => { if (f.id != null) deletarFuncionario(f.id) }}><FontAwesomeIcon icon={faTrash} /></button>
            </div>
            <div className='containerCondeudo'>
              <h1>#{f.id} {f.descricao}</h1>
              <h2>Especialidade: {f.funcao} - {nomeTipo(f.funcao)}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
