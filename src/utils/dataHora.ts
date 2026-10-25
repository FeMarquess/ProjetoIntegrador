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
