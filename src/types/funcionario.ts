import { TipoAgenda } from './tipoAgenda'

export interface Funcionario {
  id: number | null
  descricao: string
  // serviços que a profissional atende (ex.: Manicure e Cabelo)
  especialidades: TipoAgenda[]
}
