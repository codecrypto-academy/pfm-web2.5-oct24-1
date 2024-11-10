import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';


export const Sidebar: React.FC = () =>{
    const location = useLocation();
    const { id  } = useParams<{ id: string }>();
    return(
        <aside className="sidebar text-white">
            <h5 className='text-center'>Menu</h5>
            <nav>
                <ul>
                    <li><Link to="/networklist">Network list</Link></li>
                    <li><Link to="/">New network</Link></li>
                </ul>

                {location.pathname.includes('/networkdetails') && (
                    <ul className='sidebar-submenu'>
                        <h5 className='text-center'>Network:{id} </h5>
                        <li>
                            <Link to={`/networkdetails/${id}`}>Network Details</Link>
                        </li>
                        <li><Link>Operations</Link></li>
                    </ul>

                )}
            </nav>
        </aside>
    )
}
