import '../app/globals.css'
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Agenda } from '@/src/types/agenda';
import { Cliente } from '@/src/types/cliente';
import { Funcionario } from '@/src/types/funcionario';
import CampoBusca, { ItemBusca } from './CampoBusca';

interface IparametrosAgenda {
    Editar: boolean,
    Criar: boolean,
    Aberto: boolean
}

interface props {
    params: IparametrosAgenda,
    onClose: () => void;
    agenda?: Agenda | null
}

interface FuncionarioEspecialidade extends Funcionario {
    especialidade: string
}

const agendaVazia: Agenda = {
    id: 0,
    descricao: '',
    clienteId: 0,
    funcionarioId: 0,
    tipoAgendaId: 0,
    horaInicio: null,
    horaFim: null
}

// avisa as telas abertas (calendário, lista do dia, home) para recarregarem
export const EVENTO_AGENDA_ALTERADA = 'agendaAlterada'

const hora = (data: Date | null) => data ? new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''

const textoCliente = (c: Cliente) => `#${c.id} ${c.descricao}`
const textoProfissional = (f: Funcionario, especialidade: string) => `#${f.id} ${f.descricao} — ${especialidade}`

async function buscarClientes(termo: string): Promise<ItemBusca[]> {
    const res = termo
        ? await api.get('/clienteBuscarNome', { params: { descricao: termo } })
        : await api.get('/clienteBuscar')
    return (res.data as Cliente[]).map((c) => ({ id: c.id!, texto: textoCliente(c) }))
}

export function Modal({ params, onClose, agenda }: props,) {
    const [agendas, setAgendas] = useState<Agenda | null>(null)
    const [nomeCliente, setNomeCliente] = useState('')
    const [nomeProfissional, setNomeProfissional] = useState('')
    const [profissionais, setProfissionais] = useState<FuncionarioEspecialidade[]>([])
    const [erro, setErro] = useState('')
    // etapas já salvas nesta visita, ao usar "Salvar e adicionar próxima etapa"
    const [etapas, setEtapas] = useState<string[]>([])

    useEffect(() => {
        setErro('')
        setEtapas([])
        if (!params.Aberto) {
            setAgendas(null)
            return
        }


        if (params.Criar) {
            setAgendas(agendaVazia)
            setNomeCliente('')
            setNomeProfissional('')
        } else if (agenda) {
            setAgendas(agenda)
            carregarNomes(agenda)
        }
    }, [agenda, params.Aberto]);

    // ao editar, mostra nos campos de busca o cliente e a profissional que já estão na agenda
    async function carregarNomes(agenda: Agenda) {
        try {
            const [resCliente, resFuncionario, resTipo] = await Promise.all([
                api.get('/clienteBuscarId', { params: { id: agenda.clienteId } }),
                api.get('/funcionarioBuscarId', { params: { id: agenda.funcionarioId } }),
                api.get('/tipoAgendaBuscarId', { params: { id: agenda.tipoAgendaId } })
            ])
            if (resCliente.data?.id) setNomeCliente(textoCliente(resCliente.data))
            if (resFuncionario.data?.id) setNomeProfissional(textoProfissional(resFuncionario.data, resTipo.data?.descricao || ''))
        } catch (error) {
            console.error(error)
        }
    }

    async function buscarProfissionais(termo: string): Promise<ItemBusca[]> {
        const res = await api.get('/funcionarioBuscarEspecialidade', { params: { descricao: termo } })
        const lista = res.data as FuncionarioEspecialidade[]
        setProfissionais(lista)
        return lista.map((f) => ({ id: f.id!, texto: textoProfissional(f, f.especialidade) }))
    }

    function escolherProfissional(item: ItemBusca) {
        const profissional = profissionais.find((f) => f.id === item.id)
        // o serviço da agenda é a especialidade da profissional escolhida
        setAgendas({ ...agendas!, funcionarioId: item.id, tipoAgendaId: profissional?.funcao || 0 })
    }

    async function salvar(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // qual botão enviou o formulário
        const continuar = (e.nativeEvent as SubmitEvent).submitter?.getAttribute('name') === 'continuar'

        if (!agendas?.clienteId) return setErro('Pesquise e selecione um cliente')
        if (!agendas?.funcionarioId) return setErro('Pesquise e selecione uma profissional')
        if (agendas.horaInicio && agendas.horaFim && new Date(agendas.horaFim) <= new Date(agendas.horaInicio)) {
            return setErro('O fim da agenda deve ser depois do início')
        }

        const dados = {
            descricao: agendas.descricao,
            funcionarioId: agendas.funcionarioId,
            clienteId: agendas.clienteId,
            tipoAgendaId: agendas.tipoAgendaId,
            horaInicio: agendas.horaInicio,
            horaFim: agendas.horaFim
        }

        const res = params.Editar
            ? await api.put('/alterarAgenda', dados, { params: { id: agendas.id } })
            : await api.post('/agenda', dados)

        // a API devolve texto quando recusa a agenda
        if (typeof res.data === 'string' && res.data !== 'Sucesso ao alterar') return setErro(res.data)

        window.dispatchEvent(new Event(EVENTO_AGENDA_ALTERADA))

        if (continuar) {
            // próxima etapa da mesma visita: mantém descrição e cliente, começa quando a anterior termina
            const salva = res.data as Agenda
            setEtapas([...etapas, `${hora(agendas.horaInicio)}–${hora(agendas.horaFim)} ${salva.tipoAgenda?.descricao || ''} com ${salva.funcionario?.descricao || ''}`])
            setAgendas({ ...agendas, id: 0, funcionarioId: 0, tipoAgendaId: 0, horaInicio: agendas.horaFim, horaFim: null })
            setNomeProfissional('')
            setErro('')
            return
        }

        onClose()
    }

    function formatarDataLocal(data: Date) {
    const pad = (n: number) => String(n).padStart(2, '0')

    return `${data.getFullYear()}-${
        pad(data.getMonth() + 1)
    }-${pad(data.getDate())}T${
        pad(data.getHours())
    }:${pad(data.getMinutes())}`
}

    if (!params.Aberto || !agendas) return null

    return (
        <div className='ContainerCardAgenda' onClick={onClose}>
            <div className='CardAgenda' onClick={(e) => e.stopPropagation()} >
                <div className='containerFormAgenda'>
                    <h1 className='tituloFormAgenda'>{params.Editar ? 'Editar a agenda' : etapas.length ? `Etapa ${etapas.length + 1} da visita` : 'Criar a agenda'}</h1>
                    <form className='formAgenda' id='formAgendaEditar' onSubmit={salvar}>
                        <div>
                            <label htmlFor='agendaDescricao'>Descrição:</label>
                            <input
                                id='agendaDescricao'
                                type='text'
                                name='descricao'
                                value={agendas.descricao || ''}
                                onChange={(e) => setAgendas({ ...agendas, descricao: e.target.value })}
                                required/>
                        </div>
                        <CampoBusca
                            id='agendaCliente'
                            label='Cliente:'
                            placeholder='Nome do cliente'
                            selecionado={nomeCliente}
                            buscar={buscarClientes}
                            onSelecionar={(item) => setAgendas({ ...agendas, clienteId: item.id })}/>
                        <CampoBusca
                            // nova etapa recria o campo, limpando a profissional anterior
                            key={`profissional-${etapas.length}`}
                            id='agendaProfissional'
                            label='Profissional:'
                            placeholder='Atuação (ex.: barbeiro)'
                            selecionado={nomeProfissional}
                            buscar={buscarProfissionais}
                            onSelecionar={escolherProfissional}/>
                        <div>
                            <label htmlFor='agendaInicio'>Início da agenda:</label>
                            <input
                                id='agendaInicio'
                                type='datetime-local'
                                name='horaInicio'
                                value={agendas.horaInicio ? formatarDataLocal(new Date(agendas.horaInicio)) : ''}
                                onChange={(e) => setAgendas({ ...agendas, horaInicio: e.target.value ? new Date(e.target.value) : null })}
                                required/>
                        </div>
                        <div>
                            <label htmlFor='agendaFim'>Fim da agenda:</label>
                            <input
                                id='agendaFim'
                                type='datetime-local'
                                name='horaFim'
                                value={agendas.horaFim ? formatarDataLocal(new Date(agendas.horaFim)) : ''}
                                onChange={(e) => setAgendas({ ...agendas, horaFim: e.target.value ? new Date(e.target.value) : null })}
                                required/>
                        </div>
                        <p role='alert' className='mensagemCadastro'>{erro}</p>
                        {etapas.length > 0 && (
                            <div className='etapasVisita' role='status'>
                                <strong>Etapas já agendadas nesta visita:</strong>
                                <ol>
                                    {etapas.map((etapa, i) => <li key={i}>{etapa}</li>)}
                                </ol>
                                <span>Adicione a etapa {etapas.length + 1} ou clique em Salvar para terminar.</span>
                            </div>
                        )}
                        <div className='botoesModal'>
                            <button type='submit' name='salvar' className='botaoForm'>Salvar</button>
                            {params.Criar && (
                                <button type='submit' name='continuar' className='botaoForm botaoDestaque'>Salvar e adicionar próxima etapa</button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
