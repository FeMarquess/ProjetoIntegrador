'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faPlus , faCalendar } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import '../app/globals.css';
import { useState } from 'react';
import Pesquisa from './Pesquisa';
import { Modal } from './CardAgenda';

interface IparametrosAgenda{
  Editar: boolean,
  Criar: boolean,
  Aberto: boolean
}

const Navbar = () => {
  const [parametrosAgenda, setParametrosAgenda] = useState<IparametrosAgenda>({Editar: false, Criar: false, Aberto: false})

    
  async function criarAgenda(aberto: boolean){
    setParametrosAgenda({Editar: false,  Criar: true, Aberto: aberto})
  }

  const fecharModal = () => {
  setParametrosAgenda({
    Editar: false,
    Criar: false,
    Aberto: false
  })
}

    return(
        <div>
        <nav className="Navbar flex items-center align-center justify-between p-2 bg-purple h-[50px]">
            <Link href='/' aria-label='Início'>
                <FontAwesomeIcon className='h-[30px]' icon={faHouse} />
            </Link>
                <Pesquisa/>
            <ul className='NavbarLista'>
                <li className='itemNav'>
                    <Link href='/agenda' aria-label='Agenda'><FontAwesomeIcon className='h-[30px]' icon={faCalendar} /></Link>
                </li>
                <li className='itemNav'>
                    <Link href="" aria-label='Novo agendamento' onClick={() => criarAgenda(true)}><FontAwesomeIcon className='h-[30px]' icon={faPlus} /></Link>
                </li>
            </ul>
        </nav>
                <Modal params = {parametrosAgenda} onClose = {fecharModal}/>
        </div>
    )

}

export default Navbar;