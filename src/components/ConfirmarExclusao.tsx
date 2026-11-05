// Confirmação dentro do próprio card antes de excluir: evita apagar com um toque errado no celular
interface props {
  texto: string
  onConfirmar: () => void
  onCancelar: () => void
}

export default function ConfirmarExclusao({ texto, onConfirmar, onCancelar }: props) {
  return (
    <div className='confirmarExclusao' role='alertdialog' aria-label={texto}>
      <span>{texto}</span>
      <div className='botoesConfirmar'>
        <button type='button' className='botaoConfirmarCancelar' onClick={onCancelar} autoFocus>Cancelar</button>
        <button type='button' className='botaoConfirmarExcluir' onClick={onConfirmar}>Excluir</button>
      </div>
    </div>
  )
}
