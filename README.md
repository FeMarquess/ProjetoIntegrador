# Salão — gestão de tempo e serviços (front-end)

Interface em Next.js do Projeto Integrador. A API fica no repositório
[ProjetoIntegradorApi](https://github.com/FeMarquess/ProjetoIntegradorApi).

## Rodando

```bash
cp .env.example .env.local    # NEXT_PUBLIC_API_URL = endereço da API
npm install
npm run dev                   # http://localhost:3000
```

Na Vercel, defina `NEXT_PUBLIC_API_URL` com a URL pública da API hospedada; sem ela o site
tenta falar com `http://localhost:3333`, que só existe na máquina de quem está desenvolvendo.

## Testes

```bash
npm test          # Vitest + Testing Library
npm run lint
npm run build
```

O GitHub Actions (`.github/workflows/ci.yml`) roda lint, testes e build a cada push.

| Arquivo | O que testa |
|---|---|
| `test/utils.test.ts` | máscaras de data, hora e telefone; validação de datas; rótulos de status; mensagens de erro da API |
| `test/painel.test.tsx` | painel da profissional: botões por etapa, chamadas à API, recusa com mensagem, aviso em tempo real |
| `test/cadastros.test.tsx` | profissional com várias especialidades, histórico da cliente, conflito de horário no agendamento |

## Telas

| Rota | Função |
|---|---|
| `/` | painel do dia (atualiza em tempo real) |
| `/clientes` | cadastro de clientes e histórico de procedimentos |
| `/profissionais` | cadastro de profissionais com uma ou mais especialidades |
| `/especialidades` | cadastro dos serviços (manicure, cabelo, maquiagem…) |
| `/agenda` | calendário; duplo clique abre o dia ou o agendamento |
| `/painel` | painel da profissional: iniciar/concluir etapas, aviso e notificação quando uma etapa é liberada |
| `/indicadores` | BI: serviços mais procurados, faixas etárias, próximos agendamentos, tempo previsto × real |

**Tempo real:** as telas abrem uma conexão com `GET /eventos` da API (Server-Sent Events) e recarregam
na hora quando a agenda muda em qualquer aparelho. A atualização periódica (30 s) continua como reserva.
