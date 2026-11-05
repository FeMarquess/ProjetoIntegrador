const pad = (n: number) => String(n).padStart(2, '0')

// Formata enquanto digita: "27102026" vira "27/10/2026"
export function mascaraData(valor: string) {
  const d = valor.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

// Formata enquanto digita: "0830" vira "08:30"
export function mascaraHora(valor: string) {
  const d = valor.replace(/\D/g, '').slice(0, 4)
  if (d.length <= 2) return d
  return `${d.slice(0, 2)}:${d.slice(2)}`
}

export function formatarData(data: Date) {
  return `${pad(data.getDate())}/${pad(data.getMonth() + 1)}/${data.getFullYear()}`
}

export function formatarHora(data: Date) {
  return `${pad(data.getHours())}:${pad(data.getMinutes())}`
}

// "AAAA-MM-DD" (como vem da URL do dia) para "DD/MM/AAAA"
export function isoParaData(iso: string) {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

// Junta "DD/MM" ou "DD/MM/AAAA" com "HH:MM" no horário local; null se inválido.
// Sem ano, usa o ano atual.
export function montarDataHora(dataTexto: string, horaTexto: string): Date | null {
  const data = dataTexto.match(/^(\d{2})\/(\d{2})(?:\/(\d{4}))?$/)
  const hora = horaTexto.match(/^(\d{2}):(\d{2})$/)
  if (!data || !hora) return null

  const dia = Number(data[1]), mes = Number(data[2])
  const ano = data[3] ? Number(data[3]) : new Date().getFullYear()
  const horas = Number(hora[1]), minutos = Number(hora[2])
  if (horas > 23 || minutos > 59) return null

  const resultado = new Date(ano, mes - 1, dia, horas, minutos)
  // recusa datas que o JavaScript "corrige", como 31/02
  if (resultado.getDate() !== dia || resultado.getMonth() !== mes - 1) return null
  return resultado
}

export function somarMinutos(data: Date, minutos: number) {
  return new Date(data.getTime() + minutos * 60000)
}

// "14:00"
export function horaCurta(data: string | Date | null | undefined) {
  return data ? new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''
}

// "qua, 04/11"
export function diaCurto(data: string | Date) {
  const d = new Date(data)
  const semana = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  return `${semana}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}

// "Quarta, 04/11" (aceita "AAAA-MM-DD" da URL, lido no horário local)
export function diaLongo(data: string | Date) {
  const d = typeof data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data) ? new Date(`${data}T00:00:00`) : new Date(data)
  const semana = d.toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0]
  return `${semana.charAt(0).toUpperCase()}${semana.slice(1)}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}

// Idade completa em anos; a data de nascimento vem da API como "AAAA-MM-DD..." (meia-noite UTC)
export function idade(nascimento: string, hoje = new Date()) {
  const [ano, mes, dia] = nascimento.split('T')[0].split('-').map(Number)
  let anos = hoje.getFullYear() - ano
  if (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)) anos--
  return anos
}
