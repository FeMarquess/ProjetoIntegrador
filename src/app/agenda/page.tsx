'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { api } from '@/src/services/api';
import '../globals.css'
import { useRouter } from 'next/navigation';
import { EVENTO_AGENDA_ALTERADA } from '@/src/components/CardAgenda';
import { Evento } from '@/src/types/eventos';
import { Agenda } from '@/src/types/agenda';

export default function eventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    carregar();
    // recarrega quando uma agenda é criada ou editada no modal da navbar
    window.addEventListener(EVENTO_AGENDA_ALTERADA, carregar)
    return () => window.removeEventListener(EVENTO_AGENDA_ALTERADA, carregar)
  }, []);
  async function carregar() {
      try {
        const res = await api.get('/agendaBuscar');

        if (res.data && res.data.length > 0) {
          const respostaAgenda = res.data as Agenda[];
          const eventosFormatados: Evento[] = respostaAgenda.map((agenda) => {
          return {
            start: agenda.horaInicio!,
            id: agenda.id!.toString(),
            title: agenda.descricao!,
            end: agenda.horaFim!,
            properties:{
              clienteId: agenda.clienteId,
              cliente: agenda.cliente?.descricao,
              funcionarioId: agenda.funcionarioId,
              funcionario: agenda.funcionario?.descricao,
              status: agenda.tipoAgenda?.descricao
            }
          };
        });
          setEventos(eventosFormatados);
        }
      } catch (error) {
        console.log("API não disponível, usando dados mockados", error);
      }
    }

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
            id: JSON.stringify(Number(info.event.id))
          })

          router.push(`/agenda/evento/${info.event.id}?${params.toString()}`)
        }}}

        dayCellDidMount={(info) => {
          info.el.addEventListener('dblclick', (e) => {
          const dataClicada = info.date
            .toISOString()
            .split('T')[0]

          const params = new URLSearchParams({
            date: dataClicada,
          })
          router.push(`/agenda/${dataClicada}?${params.toString()}`);
        })}}
      />
    </div>
  );
}