import { describe, it, expect } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { mascaraData, mascaraHora, montarDataHora, somarMinutos, formatarData, formatarHora, isoParaData } from '@/src/utils/dataHora'
import { mascaraTelefone } from '@/src/utils/telefone'
import { rotuloStatus, classeStatus } from '@/src/utils/status'
import { mensagemErro } from '@/src/services/api'

describe('dataHora', () => {
  it('mascaraData formata enquanto digita', () => {
    expect(mascaraData('2')).toBe('2')
    expect(mascaraData('2710')).toBe('27/10')
    expect(mascaraData('27102026')).toBe('27/10/2026')
    expect(mascaraData('27/10/2026999')).toBe('27/10/2026')
  })

  it('mascaraHora formata enquanto digita', () => {
    expect(mascaraHora('08')).toBe('08')
    expect(mascaraHora('0830')).toBe('08:30')
    expect(mascaraHora('08a30')).toBe('08:30')
  })

  it('montarDataHora junta data e hora no horário local', () => {
    const data = montarDataHora('10/11/2026', '14:30')!
    expect(data.getFullYear()).toBe(2026)
    expect(data.getMonth()).toBe(10)
    expect(data.getDate()).toBe(10)
    expect(data.getHours()).toBe(14)
    expect(data.getMinutes()).toBe(30)
  })

  it('montarDataHora sem ano usa o ano atual', () => {
    expect(montarDataHora('01/02', '09:00')!.getFullYear()).toBe(new Date().getFullYear())
  })

  it('montarDataHora recusa datas e horas impossíveis', () => {
    expect(montarDataHora('31/02/2026', '10:00')).toBeNull()
    expect(montarDataHora('10/13/2026', '10:00')).toBeNull()
    expect(montarDataHora('10/11/2026', '24:00')).toBeNull()
    expect(montarDataHora('10/11/2026', '10:60')).toBeNull()
    expect(montarDataHora('10-11-2026', '10:00')).toBeNull()
    expect(montarDataHora('', '')).toBeNull()
  })

  it('somarMinutos atravessa a hora e o dia', () => {
    expect(formatarHora(somarMinutos(new Date(2026, 10, 10, 9, 45), 30))).toBe('10:15')
    expect(formatarData(somarMinutos(new Date(2026, 10, 10, 23, 30), 60))).toBe('11/11/2026')
  })

  it('isoParaData', () => {
    expect(isoParaData('2026-11-10')).toBe('10/11/2026')
  })
})

describe('mascaraTelefone', () => {
  it('formata celular e fixo', () => {
    expect(mascaraTelefone('19998216722')).toBe('(19) 99821-6722')
    expect(mascaraTelefone('1935211234')).toBe('(19) 3521-1234')
  })
  it('formata parcialmente enquanto digita', () => {
    expect(mascaraTelefone('')).toBe('')
    expect(mascaraTelefone('1')).toBe('(1')
    expect(mascaraTelefone('199')).toBe('(19) 9')
  })
  it('ignora letras e excesso de dígitos', () => {
    expect(mascaraTelefone('(19) 99821-6722 999')).toBe('(19) 99821-6722')
  })
})

describe('status', () => {
  it('todo status tem texto, para não depender só da cor', () => {
    expect(rotuloStatus.agendado).toBe('Aguardando etapa anterior')
    expect(rotuloStatus.liberado).toBe('Liberado')
    expect(rotuloStatus.em_andamento).toBe('Em andamento')
    expect(rotuloStatus.concluido).toBe('Concluído')
  })
  it('classeStatus usa agendado como padrão', () => {
    expect(classeStatus('liberado')).toBe('seloStatus status-liberado')
    expect(classeStatus(undefined)).toBe('seloStatus status-agendado')
  })
})

describe('mensagemErro', () => {
  const erroHttp = (status: number, data: unknown) =>
    new AxiosError('falhou', String(status), undefined, undefined, {
      status, statusText: '', data, headers: {}, config: { headers: new AxiosHeaders() }
    })

  it('usa a mensagem enviada pela API', () => {
    expect(mensagemErro(erroHttp(409, { mensagem: 'A profissional já tem atendimento' }))).toBe('A profissional já tem atendimento')
  })
  it('usa o texto padrão quando a API não manda mensagem', () => {
    expect(mensagemErro(erroHttp(500, ''), 'padrão')).toBe('padrão')
    expect(mensagemErro(new Error('x'), 'padrão')).toBe('padrão')
  })
  it('avisa quando não há conexão com o servidor', () => {
    expect(mensagemErro(new AxiosError('Network Error', 'ERR_NETWORK'))).toMatch(/Sem conexão/)
  })
})
