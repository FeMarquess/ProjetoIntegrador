import '../app/globals.css'
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Agenda } from '@/src/types/agenda';
import { Cliente } from '@/src/types/cliente';
import { Funcionario } from '@/src/types/funcionario';
import CampoBusca, { ItemBusca } from './CampoBusca';
import { mascaraData, mascaraHora, formatarData, formatarHora, isoParaData, montarDataHora, somarMinutos } from '@/src/utils/dataHora';

interface IparametrosAgenda {
    Editar: boolean,
    Criar: boolean,
    Aberto: boolean
}

interface props {
    params: IparametrosAgenda,
    onClose: () => void;
    agenda?: Agenda | null
    // dia já escolhido (AAAA-MM-DD), ex.: o dia aberto na agenda
    dataInicial?: string
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

// atalhos de duração em minutos
const DURACOES = [
    { minutos: 30, rotulo: '30 min' },
    { minutos: 60, rotulo: '1 h' },
    { minutos: 90, rotulo: '1h30' },
    { minutos: 120, rotulo: '2 h' }
]

// avisa as telas abertas (calendário, lista do dia, home) para recarregarem
export const EVENTO_AGENDA_ALTERADA = 'agendaAlterada'

const textoCliente = (c: Cliente) => `#${c.id} ${c.descricao}`
const textoProfissional = (f: Funcionario, especialidade: string) => `#${f.id} ${f.descricao} — ${especialidade}`

async function buscarClientes(termo: string): Promise<ItemBusca[]> {
    const res = termo
        ? await api.get('/clienteBuscarNome', { params: { descricao: termo } })
        : await api.get('/clienteBuscar')
    return (res.data as Cliente[]).map((c) => ({ id: c.id!, texto: textoCliente(c) }))
}

export function Modal({ params, onClose, agenda, dataInicial }: props,) {
    const [agendas, setAgendas] = useState<Agenda | null>(null)
    const [nomeCliente, setNomeCliente] = useState('')
    const [nomeProfissional, setNomeProfissional] = useState('')
    const [servico, setServico] = useState('')
    const [profissionais, setProfissionais] = useState<FuncionarioEspecialidade[]>([])
    const [dataTexto, setDataTexto] = useState('')
    const [horaTexto, setHoraTexto] = useState('')
    const [duracao, setDuracao] = useState<number | ''>('')
    // enquanto a descrição não for digitada à mão, ela é montada com serviço e cliente
    const [descricaoEditada, setDescricaoEditada] = useState(false)
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
            setServico('')
            setDataTexto(dataInicial ? isoParaData(dataInicial) : formatarData(new Date()))
            setHoraTexto('')
            setDuracao('')
            setDescricaoEditada(false)
        } else if (agenda) {
            setAgendas(agenda)
            const inicio = agenda.horaInicio ? new Date(agenda.horaInicio) : null
            const fim = agenda.horaFim ? new Date(agenda.horaFim) : null
            setDataTexto(inicio ? formatarData(inicio) : '')
            setHoraTexto(inicio ? formatarHora(inicio) : '')
            setDuracao(inicio && fim ? Math.round((fim.getTime() - inicio.getTime()) / 60000) : '')
            setDescricaoEditada(true)
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
            setServico(resTipo.data?.descricao || '')
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

    // descrição automática: "Cabelo — Camila Arne"
    function descricaoAutomatica(nomeServico: string, cliente: string) {
        const nome = cliente.replace(/^#\d+\s*/, '')
        return [nomeServico, nome].filter(Boolean).join(' — ')
    }

    function escolherCliente(item: ItemBusca) {
        setNomeCliente(item.texto)
        setAgendas({
            ...agendas!,
            clienteId: item.id,
            descricao: descricaoEditada ? agendas!.descricao : descricaoAutomatica(servico, item.texto)
        })
    }

    function escolherProfissional(item: ItemBusca) {
        const profissional = profissionais.find((f) => f.id === item.id)
        const nomeServico = profissional?.especialidade || ''
        setServico(nomeServico)
        setNomeProfissional(item.texto)
        // o serviço da agenda é a especialidade da profissional escolhida
        setAgendas({
            ...agendas!,
            funcionarioId: item.id,
            tipoAgendaId: profissional?.funcao || 0,
            descricao: descricaoEditada ? agendas!.descricao : descricaoAutomatica(nomeServico, nomeCliente)
        })
    }

    function diaRelativo(dias: number) {
        const data = new Date()
        data.setDate(data.getDate() + dias)
        setDataTexto(formatarData(data))
    }

    const inicio = montarDataHora(dataTexto, horaTexto)
    const fim = inicio && duracao ? somarMinutos(inicio, Number(duracao)) : null

    async function salvar(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // qual botão enviou o formulário
        const continuar = (e.nativeEvent as SubmitEvent).submitter?.getAttribute('name') === 'continuar'

        if (!agendas?.clienteId) return setErro('Pesquise e selecione um cliente')
        if (!agendas?.funcionarioId) return setErro('Pesquise e selecione uma profissional')
        if (!inicio) return setErro('Informe a data (DD/MM) e o horário de início (HH:MM)')
        if (!fim) return setErro('Informe a duração')

        const dados = {
            descricao: agendas.descricao || descricaoAutomatica(servico, nomeCliente),
            funcionarioId: agendas.funcionarioId,
            clienteId: agendas.clienteId,
            tipoAgendaId: agendas.tipoAgendaId,
            horaInicio: inicio,
            horaFim: fim
        }

        const res = params.Editar
            ? await api.put('/alterarAgenda', dados, { params: { id: agendas.id } })
            : await api.post('/agenda', dados)

        // a API devolve texto quando recusa a agenda
        if (typeof res.data === 'string' && res.data !== 'Sucesso ao alterar') return setErro(res.data)

        window.dispatchEvent(new Event(EVENTO_AGENDA_ALTERADA))

        if (continuar) {
            // próxima etapa da mesma visita: mantém cliente e data, começa quando a anterior termina
            const profissional = nomeProfissional.replace(/^#\d+\s*/, '').split(' — ')[0]
            setEtapas([...etapas, `${formatarHora(inicio)}–${formatarHora(fim)} ${servico} com ${profissional}`])
            setAgendas({
                ...agendas,
                id: 0,
                funcionarioId: 0,
                tipoAgendaId: 0,
                descricao: descricaoEditada ? agendas.descricao : ''
            })
            setNomeProfissional('')
            setServico('')
            setDataTexto(formatarData(fim))
            setHoraTexto(formatarHora(fim))
            setDuracao('')
            setErro('')
            return
        }

        onClose()
    }

    if (!params.Aberto || !agendas) return null

    return (
        <div className='ContainerCardAgenda' onClick={onClose}>
            <div className='CardAgenda' onClick={(e) => e.stopPropagation()} >
                <div className='containerFormAgenda'>
                    <h1 className='tituloFormAgenda'>{params.Editar ? 'Editar a agenda' : etapas.length ? `Etapa ${etapas.length + 1} da visita` : 'Novo agendamento'}</h1>
                    <form className='formAgenda' id='formAgendaEditar' onSubmit={salvar}>
                        <CampoBusca
                            id='agendaCliente'
                            label='Cliente:'
                            placeholder='Nome do cliente'
                            selecionado={nomeCliente}
                            buscar={buscarClientes}
                            onSelecionar={escolherCliente}/>
                        <CampoBusca
                            // nova etapa recria o campo, limpando a profissional anterior
                            key={`profissional-${etapas.length}`}
                            id='agendaProfissional'
                            label='Profissional:'
                            placeholder='Nome ou atuação (ex.: barbeiro)'
                            selecionado={nomeProfissional}
                            buscar={buscarProfissionais}
                            onSelecionar={escolherProfissional}/>
                        <div>
                            <label htmlFor='agendaData'>Data:</label>
                            <div className='campoComAtalhos'>
                                <input
                                    id='agendaData'
                                    type='text'
                                    inputMode='numeric'
                                    placeholder='DD/MM'
                                    value={dataTexto}
                                    onChange={(e) => setDataTexto(mascaraData(e.target.value))}
                                    required/>
                                <div className='atalhos'>
                                    <button type='button' className='atalho' onClick={() => diaRelativo(0)}>Hoje</button>
                                    <button type='button' className='atalho' onClick={() => diaRelativo(1)}>Amanhã</button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor='agendaHora'>Início:</label>
                            <input
                                id='agendaHora'
                                type='text'
                                inputMode='numeric'
                                placeholder='HH:MM'
                                value={horaTexto}
                                onChange={(e) => setHoraTexto(mascaraHora(e.target.value))}
                                required/>
                        </div>
                        <div>
                            <label htmlFor='agendaDuracao'>Duração:</label>
                            <div className='campoComAtalhos'>
                                <input
                                    id='agendaDuracao'
                                    type='number'
                                    min={5}
                                    step={5}
                                    placeholder='minutos'
                                    value={duracao}
                                    onChange={(e) => setDuracao(e.target.value ? Number(e.target.value) : '')}
                                    required/>
                                <div className='atalhos' role='group' aria-label='Atalhos de duração'>
                                    {DURACOES.map((d) => (
                                        <button
                                            key={d.minutos}
                                            type='button'
                                            className={`atalho ${duracao === d.minutos ? 'atalhoAtivo' : ''}`}
                                            aria-pressed={duracao === d.minutos}
                                            onClick={() => setDuracao(d.minutos)}>
                                            {d.rotulo}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className='resumoHorario' aria-live='polite'>
                            {inicio && fim ? `${formatarData(inicio)} das ${formatarHora(inicio)} às ${formatarHora(fim)}` : ''}
                        </p>
                        <div>
                            <label htmlFor='agendaDescricao'>Descrição:</label>
                            <input
                                id='agendaDescricao'
                                type='text'
                                name='descricao'
                                placeholder='Preenchida automaticamente'
                                value={agendas.descricao || ''}
                                onChange={(e) => { setDescricaoEditada(true); setAgendas({ ...agendas, descricao: e.target.value }) }}/>
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
