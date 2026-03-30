'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../../services/api';
import '../globals.css'
import { useRouter } from 'next/navigation';
import { Evento } from '@/.next/dev/types/eventos';

export default function eventos() {
  const [eventos, setEventos] = useState<Evento[]>([
    { id: '1', title: 'Maquiagem da Joaquina', start: '2026-03-26T10:00:00', end: '2026-03-26T10:30:00', properties: { clienteId: 1, cliente: 'Joaquina', funcionarioId: 1, funcionario: 'Maria', status: 'Maquiagem' } },
    { id: '2', title: 'Cabelo da Chiquinha', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '3', title: 'Cabelo da Chiquinha', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '4', title: 'Cabelo da Chiquinha', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '5', title: 'Cabelo da Chiquinha', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '6', title: 'Cabelo da Chiquinha', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '7', title: 'Cabelo da Chiquinha', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '8', title: 'Cabelo da Chiquinha', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '9', title: 'Cabelo da Chiquinha', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '10', title: 'Cabelo da Chiquinha', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '11', title: 'Teste', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '12', title: 'Teste', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '13', title: 'Teste', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '14', title: 'Teste', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '15', title: 'Teste', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '16', title: 'Teste', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '17', title: 'Teste', start: '2026-03-26T10:15:00', end: '2026-03-26T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } },
    { id: '12', title: 'Cabelo da Chiquinha', start: '2026-03-25T10:15:00', end: '2026-03-25T10:45:00', properties: { clienteId: 2, cliente: 'Chiquinha', funcionarioId: 1, funcionario: 'Joana', status: 'Cabelo' } }
  ]);
  const router = useRouter();

  useEffect(() => {
    async function carregar() {
      try {
        const res = await api.get('/eventos');

        if (res.data && res.data.length > 0) {
          setEventos(res.data);
        }
      } catch (error) {
        console.log("API não disponível, usando dados mockados");
      }
    }

    carregar();
  }, []);

  return (
    <div className='calendario'>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"

        events={eventos}

        eventClassNames={(arg) => {
          const status = arg.event.extendedProps.properties.status

          if (status === 'Maquiagem') return ['evento-verde']
          if (status === 'Manicure') return ['evento-amarelo']
          if (status === 'Cabelo') return ['evento-azul']

          return []
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}

        eventDidMount={(info) => {
        info.el.ondblclick = (e) => {
          e.preventDefault()
          e.stopPropagation()
            
          const params = new URLSearchParams({
            evento: JSON.stringify(info.event._def)
          })

          router.push(`/agenda/evento/${info.event.id}?${params.toString()}`)
        }}}

        dayCellDidMount={(info) => {
          info.el.addEventListener('dblclick', (e) => {
          console.log('eventos',eventos)
          const dataClicada = info.date
            .toISOString()
            .split('T')[0]

          const eventoDoDia = eventos.filter(eventos => {
            const dataEvento = eventos.start.split('T')[0]
            return dataEvento === dataClicada
          });

          console.log(eventoDoDia)

          const params = new URLSearchParams({
            date: dataClicada,
            eventos: JSON.stringify(eventoDoDia)
          })
          router.push(`/agenda/${info.dateStr}?${params.toString()}`);
        })}}
      />
    </div>
  );
}