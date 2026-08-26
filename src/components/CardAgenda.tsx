import '../app/globals.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Agenda } from '@/.next/dev/types/agenda';

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

export function Modal({ params, onClose, agenda }: props,) {
    const [agendas, setAgendas] = useState<Agenda | null>(null)
    
    useEffect(() => {
  if (params.Aberto && agenda) {
    setAgendas(agenda);
  }

  if (params.Aberto && params.Criar) {
        setAgendas(agendaVazia)
  }

  if (!params.Aberto) {
    setAgendas(null);
  }
}, [agenda, params.Aberto]);

    const agendaVazia: Agenda = {
    id: 0,
    descricao: '',
    clienteId: 0,
    funcionarioId: 0,
    tipoAgendaId: 0,
    horaInicio: null,
    horaFim: null
}

    function atualizaAgenda(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const respostaForm: Agenda = {
            id: agendas?.id || 0,
            descricao: formData.get('descricao') as string,
            clienteId: Number(formData.get('clienteId')),
            funcionarioId: Number(formData.get('funcionarioId')),
            horaInicio: new Date(formData.get('horaInicio') as string),
            horaFim: new Date(formData.get('horaFim') as string),
            tipoAgendaId: Number(formData.get('tipoAgendaId')),
        };

        editarAgenda(respostaForm)
    }
    
    function criarAgenda(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const horaInicio = formData.get('horaInicio') as string
        const horaFim = formData.get('horaFim') as string

        const respostaForm: Agenda = {
            id: agendas?.id || 0,
            descricao: formData.get('descricao') as string,
            clienteId: Number(formData.get('clienteId')),
            funcionarioId: Number(formData.get('funcionarioId')),
            horaInicio: horaInicio ? new Date(horaInicio) : null,
            horaFim: horaFim ? new Date(horaFim) : null,
            tipoAgendaId: Number(formData.get('tipoAgendaId')),
        };

        criarNovaAgenda(respostaForm)
    }

    async function editarAgenda(respostaForm: Agenda) {
        const res = await api.put('/alterarAgenda', {     
          id: agendas?.id,
          descricao: respostaForm.descricao,
          funcionarioId: respostaForm.funcionarioId,
          clienteId: respostaForm.clienteId,
          tipoAgendaId: respostaForm.tipoAgendaId,
          horaInicio: respostaForm.horaInicio,
          horaFim: respostaForm.horaFim
        },
        {
          params: { id: agendas?.id }
        })

        onClose()
    }

    async function criarNovaAgenda(respostaForm: Agenda) {

        console.log(respostaForm)
        const res = await api.post('/agenda', {     
          descricao: respostaForm.descricao,
          funcionarioId: respostaForm.funcionarioId,
          clienteId: respostaForm.clienteId,
          tipoAgendaId: respostaForm.tipoAgendaId,
          horaInicio: respostaForm.horaInicio,
          horaFim: respostaForm.horaFim
        })
    
        // onClose()
    }

    function formatarDataLocal(data: Date) {
    const pad = (n: number) => String(n).padStart(2, '0')

    return `${data.getFullYear()}-${
        pad(data.getMonth() + 1)
    }-${pad(data.getDate())}T${
        pad(data.getHours())
    }:${pad(data.getMinutes())}`
}

    if (params.Aberto) {
        if (params.Editar) {
            return (
                <div className='ContainerCardAgenda' onClick={onClose}>
                    <div className='CardAgenda' onClick={(e) => e.stopPropagation()} >
                        <div className='containerFormAgenda'>
                            <h1 className='tituloFormAgenda'>Editar a agenda</h1>
                            <form className='formAgenda' id='formAgendaEditar' onSubmit={atualizaAgenda}>
                                <div>
                                    <label>Descrição:</label>
                                    <input 
                                        type='text' 
                                        name='descricao'
                                        value={agendas?.descricao || ''} 
                                        onChange={(e) => setAgendas({ ...agendas!, descricao: e.target.value })} 
                                        required/>
                                </div>
                                <div>
                                    <label>Cliente:</label>
                                    <input 
                                        type='text' 
                                        name='clienteId'
                                        value={agendas?.clienteId || ''} 
                                        onChange={(e) => setAgendas({ ...agendas!, clienteId: Number(e.target.value) })}/>
                                </div>
                                <div>
                                    <label>Funcionario:</label>
                                    <input 
                                        type='text' 
                                        name='funcionarioId'
                                        value={agendas?.funcionarioId || ''} 
                                        onChange={(e) => setAgendas({ ...agendas!, funcionarioId: Number(e.target.value) })} 
                                        required/>
                                </div>
                                <div>
                                    <label>Início da agenda:</label>
                                    <input 
                                        style={{
                                          outline: 'none',
                                          boxShadow: 'none'
                                        }}
                                        type='datetime-local' 
                                        name='horaInicio'
                                        value={agendas?.horaInicio? formatarDataLocal(new Date(agendas.horaInicio)) : ''} 
                                        onChange={(e) => setAgendas({ ...agendas!, horaInicio: e.target.value ? new Date(e.target.value) : null })} 
                                        required/>
                                </div>
                                <div>
                                    <label>Fim da agenda:</label>
                                    <input 
                                        style={{
                                          outline: 'none',
                                          boxShadow: 'none'
                                        }}
                                        type='datetime-local' 
                                        name='horaFim'
                                        value={agendas?.horaFim? formatarDataLocal(new Date(agendas.horaFim)) : ''} 
                                        onChange={(e) => setAgendas({ ...agendas!, horaFim: e.target.value ? new Date(e.target.value) : null })} 
                                        required/>
                                </div>
                                <div>
                                    <label>Tipo de agenda:</label>
                                    <input 
                                        type='text' 
                                        name='tipoAgendaId'
                                        value={agendas?.tipoAgendaId || ''} 
                                        onChange={(e) => setAgendas({ ...agendas!, tipoAgendaId: Number(e.target.value) })} 
                                        required/>
                                </div>
                                <button type='submit' className='botaoForm'>Salvar</button>
                            </form>
                        </div>
                    </div>
                </div>
            )
        }
        if (params.Criar) {
            return (
                <div className='ContainerCardAgenda' onClick={onClose}>
                    <div className='CardAgenda' onClick={(e) => e.stopPropagation()} >
                        <div className='containerFormAgenda'>
                            <h1 className='tituloFormAgenda'>Criar a agenda</h1>
                            <form className='formAgenda' id='formAgendaEditar' onSubmit={criarAgenda}>
                                <div>
                                    <label>Descrição:</label>
                                    <input 
                                        type='text' 
                                        name='descricao'
                                        value={agendas?.descricao || ''} 
                                        onChange={(e) => setAgendas({ ...agendas!, descricao: e.target.value })} 
                                        required/>
                                </div>
                                <div>
                                    <label>Cliente:</label>
                                    <input 
                                        type='text' 
                                        name='clienteId'
                                        value={agendas?.clienteId || ''} 
                                        onChange={(e) => setAgendas({ ...agendas!, clienteId: Number(e.target.value) })}/>
                                </div>
                                <div>
                                    <label>Funcionario:</label>
                                    <input 
                                        type='text' 
                                        name='funcionarioId'
                                        value={agendas?.funcionarioId || ''} 
                                        onChange={(e) => setAgendas({ ...agendas!, funcionarioId: Number(e.target.value) })} 
                                        required/>
                                </div>
                                <div>
                                    <label>Início da agenda:</label>
                                    <input 
                                        type='datetime-local' 
                                        name='horaInicio'
                                        value={agendas?.horaInicio? formatarDataLocal(new Date(agendas.horaInicio)) : ''} 
                                        onChange={(e) => setAgendas({ ...agendas!, horaInicio: e.target.value ? new Date(e.target.value) : null })} 
                                        required/>
                                </div>
                                <div>
                                    <label>Fim da agenda:</label>
                                    <input 
                                        type='datetime-local' 
                                        name='horaFim'
                                        value={agendas?.horaFim? formatarDataLocal(new Date(agendas.horaFim)) : ''} 
                                        onChange={(e) => setAgendas({ ...agendas!, horaFim: e.target.value ? new Date(e.target.value) : null })} 
                                        required/>
                                </div>
                                <div>
                                    <label>Tipo de agenda:</label>
                                    <input 
                                        type='text' 
                                        name='tipoAgendaId'
                                        value={agendas?.tipoAgendaId || ''} 
                                        onChange={(e) => setAgendas({ ...agendas!, tipoAgendaId: Number(e.target.value) })} 
                                        required/>
                                </div>
                                <button type='submit' className='botaoForm'>Salvar</button>
                            </form>
                        </div>
                    </div>
                </div>
            )
        }
    }
    return null
}