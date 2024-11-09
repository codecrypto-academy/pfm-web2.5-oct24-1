import React from 'react';
import { Link } from 'react-router-dom';

export const Sidebar: React.FC = () =>{
    return(
        <aside className="sidebar text-white">
            <h5 className='text-center'>Menu</h5>
            <nav>
                <ul>
                    <li><Link to="/networklist">Network list</Link></li>
                    <li><Link to="/">New network</Link></li>
                </ul>
            </nav>
        </aside>
    )
}
