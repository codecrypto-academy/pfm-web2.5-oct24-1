import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';


export const Sidebar: React.FC = () =>{
    const location = useLocation();
    const { id  } = useParams<{ id: string }>();
    return(
        <aside className="sidebar text-white ">
            <h5 className='text-start ps-3'>Menu</h5>
            <nav>
                <ul>
                    <li><Link to="/networks">Network list</Link></li>
                    <li><Link to="/">New network</Link></li>
                </ul>

                {location.pathname.includes('/network/') && (
                    <ul className='sidebar-submenu'>
                        <h5 className='text-start ps-3'>Network: {id} </h5>
                        <li>
                            <Link to={`/network/${id}`}>Network Details</Link>
                        </li>
                        <li><Link to={"#"}>Operations</Link></li>
                    </ul>

                )}
            </nav>
        </aside>
    )
}
