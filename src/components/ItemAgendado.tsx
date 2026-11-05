export default function ItemAgendado({ params }: { params: { data: string } }) {
    return(
        <h1>Eventos do dia: {params.data}</h1>
    )
}