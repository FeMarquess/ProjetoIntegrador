import axios from "axios";

// Endereço da API. Em produção (Vercel), defina NEXT_PUBLIC_API_URL com a URL pública da API.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"

export const api = axios.create({
  baseURL: API_URL
})

// A API responde erros com o código HTTP (400, 404, 409...) e corpo { mensagem }.
// Devolve essa mensagem para mostrar na tela, ou o texto padrão quando não houver.
export function mensagemErro(error: unknown, padrao = 'Não foi possível concluir a operação. Tente de novo.') {
  if (axios.isAxiosError(error)) {
    const mensagem = (error.response?.data as { mensagem?: unknown } | undefined)?.mensagem
    if (typeof mensagem === 'string' && mensagem) return mensagem
    if (!error.response) return 'Sem conexão com o servidor. Verifique a internet e tente de novo.'
  }
  return padrao
}
