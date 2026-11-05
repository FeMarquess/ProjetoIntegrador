'use client'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { api, mensagemErro } from '@/src/services/api';
import { Funcionario } from '@/src/types/funcionario';
import { TipoAgenda } from '@/src/types/tipoAgenda';
import ConfirmarExclusao from '@/src/components/ConfirmarExclusao';

interface FormProfissional {
  id: number | null
  descricao: string
  especialidades: number[]
}

const formVazio: FormProfissional = { id: null, descricao: '', especialidades: [] }

export default function Profissionais() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [tipos, setTipos] = useState<TipoAgenda[]>([])
  const [funcionario, setFuncionario] = useState<FormProfissional>(formVazio)
  const [mensagem, setMensagem] = useState('')
  const [excluindo, setExcluindo] = useState<number | null>(null)

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
      setMensagem(mensagemErro(error))
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function alternarEspecialidade(id: number) {
    const marcadas = funcionario.especialidades
    setFuncionario({
      ...funcionario,
      especialidades: marcadas.includes(id) ? marcadas.filter((e) => e !== id) : [...marcadas, id]
    })
  }

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (funcionario.especialidades.length === 0) return setMensagem('Marque ao menos uma especialidade')

    const dados = { descricao: funcionario.descricao, especialidades: funcionario.especialidades }

    try {
      if (funcionario.id) {
        await api.put('/alterarFuncionario', dados, { params: { id: funcionario.id } })
        setMensagem('Profissional alterada')
      } else {
        await api.post('/funcionario', dados)
        setMensagem('Profissional cadastrada')
      }
      setFuncionario(formVazio)
      carregar()
    } catch (error) {
      setMensagem(mensagemErro(error))
    }
  }

  async function deletarFuncionario(id: number) {
    try {
      await api.delete('/deletarFuncionario', { params: { id: id } })
      setMensagem('Profissional excluída')
    } catch (error) {
      // ex.: profissional com agendamentos
      setMensagem(mensagemErro(error))
    }
    carregar()
  }

  function editar(f: Funcionario) {
    setMensagem('')
    setFuncionario({ id: f.id, descricao: f.descricao, especialidades: f.especialidades.map((e) => e.id) })
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
          <fieldset className='listaEspecialidades'>
            <legend>Especialidades:</legend>
            {tipos.length === 0 && <span>Nenhuma especialidade cadastrada</span>}
            {tipos.map((t) => (
              <label key={t.id}>
                <input
                  type='checkbox'
                  checked={funcionario.especialidades.includes(t.id)}
                  onChange={() => alternarEspecialidade(t.id)}/>
                {t.descricao}
              </label>
            ))}
          </fieldset>
          <Link href='/especialidades' className='linkCadastro'>+ Cadastrar especialidade</Link>
          <div>
            {funcionario.id ? <button type='button' className='botaoForm' onClick={() => setFuncionario(formVazio)}>Cancelar</button> : <span/>}
            <button type='submit' className='botaoForm'>Salvar</button>
          </div>
          <p role='status' className='mensagemCadastro'>{mensagem}</p>
        </form>
      </div>

      <div className='containerAgendaDia'>
        {funcionarios.map((f) => (
          <div className='agendaDia' key={f.id}>
            <div className='botoesCard'>
              <button className='botaoEditar' aria-label={`Editar ${f.descricao}`} onClick={() => editar(f)}><FontAwesomeIcon icon={faPen} /></button>
              <button className='botaoExcluir' aria-label={`Excluir ${f.descricao}`} onClick={() => setExcluindo(f.id)}><FontAwesomeIcon icon={faTrash} /></button>
            </div>
            <div className='containerCondeudo'>
              <h1 className='nomeCard'>{f.descricao}</h1>
              <h2>Especialidades: {f.especialidades.map((e) => e.descricao).join(', ') || '—'}</h2>
              {excluindo === f.id && (
                <ConfirmarExclusao
                  texto={`Excluir ${f.descricao}?`}
                  onCancelar={() => setExcluindo(null)}
                  onConfirmar={() => { setExcluindo(null); if (f.id != null) deletarFuncionario(f.id) }}/>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
