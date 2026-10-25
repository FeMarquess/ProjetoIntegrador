'use client'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { api } from '@/src/services/api';
import { Cliente } from '@/src/types/cliente';
import { mascaraTelefone } from '@/src/utils/telefone';

const clienteVazio: Cliente = { id: null, descricao: '', telefone: '', dataNascimento: '' }

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cliente, setCliente] = useState<Cliente>(clienteVazio)
  const [mensagem, setMensagem] = useState('')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    const espera = setTimeout(carregar, 300)
    return () => clearTimeout(espera)
  }, [busca])

  async function carregar() {
    try {
      const res = busca
        ? await api.get('/clienteBuscarNome', { params: { descricao: busca } })
        : await api.get('/clienteBuscar')
      setClientes(res.data as Cliente[])
    } catch (error) {
      console.error(error)
    }
  }

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const dados = {
      descricao: cliente.descricao,
      telefone: cliente.telefone || null,
      dataNascimento: cliente.dataNascimento || null
    }

    if (cliente.id) {
      await api.put('/alterarCliente', dados, { params: { id: cliente.id } })
      setMensagem('Cliente alterado')
    } else {
      await api.post('/cliente', dados)
      setMensagem('Cliente cadastrado')
    }

    setCliente(clienteVazio)
    carregar()
  }

  async function deletarCliente(id: number) {
    const res = await api.delete('/deletarCliente', { params: { id: id } })
    // a API devolve texto quando o delete falha (ex.: cliente com agenda)
    setMensagem(typeof res.data === 'string' ? res.data : 'Cliente excluído')
    carregar()
  }

  function editarCliente(c: Cliente) {
    setMensagem('')
    setCliente({
      ...c,
      telefone: mascaraTelefone(c.telefone || ''),
      dataNascimento: c.dataNascimento ? c.dataNascimento.split('T')[0] : ''
    })
  }

  return (
    <div>
      <h1 className='titulo'>Clientes</h1>
      <div className='containerCadastro'>
        <form className='formAgenda formCadastro' onSubmit={salvar}>
          <h2 className='tituloFormAgenda'>{cliente.id ? `Editar cliente #${cliente.id}` : 'Novo cliente'}</h2>
          <div>
            <label htmlFor='descricao'>Nome:</label>
            <input
              id='descricao'
              type='text'
              value={cliente.descricao}
              onChange={(e) => setCliente({ ...cliente, descricao: e.target.value })}
              required/>
          </div>
          <div>
            <label htmlFor='telefone'>Telefone:</label>
            <input
              id='telefone'
              type='tel'
              value={cliente.telefone || ''}
              placeholder='(19) 99999-9999'
              onChange={(e) => setCliente({ ...cliente, telefone: mascaraTelefone(e.target.value) })}/>
          </div>
          <div>
            <label htmlFor='dataNascimento'>Data de nascimento:</label>
            <input
              id='dataNascimento'
              type='date'
              value={cliente.dataNascimento || ''}
              onChange={(e) => setCliente({ ...cliente, dataNascimento: e.target.value })}
              required/>
          </div>
          <div>
            {cliente.id ? <button type='button' className='botaoForm' onClick={() => setCliente(clienteVazio)}>Cancelar</button> : <span/>}
            <button type='submit' className='botaoForm'>Salvar</button>
          </div>
          <p role='status' className='mensagemCadastro'>{mensagem}</p>
        </form>
      </div>

      <div className='containerCadastro'>
        <input
          type='search'
          className='buscaLista'
          aria-label='Pesquisar cliente pelo nome'
          placeholder='Pesquisar cliente pelo nome'
          value={busca}
          onChange={(e) => setBusca(e.target.value)}/>
      </div>
      {clientes.length === 0 && <p className='titulo'>Nenhum cliente encontrado</p>}

      <div className='containerAgendaDia'>
        {clientes.map((c) => (
          <div className='agendaDia' key={c.id}>
            <div className='botoesCard'>
              <button className='botaoEditar' aria-label={`Editar ${c.descricao}`} onClick={() => editarCliente(c)}><FontAwesomeIcon icon={faPen} /></button>
              <button className='botaoExcluir' aria-label={`Excluir ${c.descricao}`} onClick={() => { if (c.id != null) deletarCliente(c.id) }}><FontAwesomeIcon icon={faTrash} /></button>
            </div>
            <div className='containerCondeudo'>
              <h1>#{c.id} {c.descricao}</h1>
              <h2>Telefone: {mascaraTelefone(c.telefone || '')}</h2>
              <h2>Nascimento: {c.dataNascimento ? c.dataNascimento.split('T')[0].split('-').reverse().join('/') : ''}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
