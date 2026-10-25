// Formata enquanto digita: (19) 99821-6722 para celular ou (19) 3521-1234 para fixo
export function mascaraTelefone(valor: string) {
  const d = valor.replace(/\D/g, '').slice(0, 11)

  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
