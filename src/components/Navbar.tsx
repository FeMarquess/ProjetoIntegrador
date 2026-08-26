import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTasks, faCalendar } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import '../app/globals.css';

const Navbar = () => {
    return(
        <nav className="Navbar flex items-center align-center justify-between p-2 bg-purple h-[50px]">
            <button>
                <FontAwesomeIcon className='h-[30px]' icon={faBars} />
            </button>
            {/* <Pesquisa aoTermoPesquisa={setTermoPesquisa} /> */}
            <ul className='NavbarLista'>
                <li className='itemNav'>
                    <Link href='./agenda' ><FontAwesomeIcon className='h-[30px]' icon={faCalendar} /></Link>
                </li>
                <li className='itemNav'>
                    <Link href=""><FontAwesomeIcon className='h-[30px]' icon={faTasks} /></Link>
                </li>
            </ul>
        </nav>
    )

}

export default Navbar;