import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  // Estado para controlar el despliegue de la sección Operations
  const [isOperationsOpen, setIsOperationsOpen] = useState<boolean>(false);

  // Lista de rutas de Operations, memoizada para evitar recreaciones constantes
  const operationsPaths = useMemo(() => [
    `/network/${id}/operation/blocks`,
    `/network/${id}/explorer`,
    `#`, // Añade más rutas aquí si necesario
  ], [id]);

  // Función para determinar si una opción está activa
  const isActive = (path: string) => location.pathname === path;

  // Abrir automáticamente Operations si se está visualizando una de sus rutas
  useEffect(() => {
    const isOnOperations = operationsPaths.some((path) => location.pathname.startsWith(path));
    setIsOperationsOpen(isOnOperations);
  }, [location.pathname, operationsPaths]);

  // Toggle manual de Operations
  const toggleOperations = () => {
    setIsOperationsOpen((prev) => !prev);
  };

  return (
    <aside className="sidebar text-white">
      <h5 className="text-start ps-3">Menu</h5>
      <nav>
        <ul>
          <li className={isActive('/networks') ? 'active' : ''}>
            <Link to="/networks">Network list</Link>
          </li>
          <li className={isActive('/addnetwork') ? 'active' : ''}>
            <Link to="/addnetwork">New network</Link>
          </li>
        </ul>

        {location.pathname.includes('/network/') && (
          <ul className="sidebar-submenu">
            <h5 className="text-start ps-3">Network: {id}</h5>
            <li className={isActive(`/network/${id}`) ? 'active' : ''}>
              <Link to={`/network/${id}`}>Network details</Link>
            </li>

            {/* Operations sección desplegable */}
            <h5
              className="text-start ps-3 operations-header"
              onClick={toggleOperations}
              style={{ cursor: 'pointer' }}
            >
              Operations {isOperationsOpen ? '▼' : '▷'}
            </h5>
            {isOperationsOpen && (
              <ul className="operations-list">
                <li
                  className={isActive(`/network/${id}/operation/blocks`) ? 'active' : ''}
                >
                  <Link to={`/network/${id}/operation/blocks`}>Last blocks</Link>
                </li>
                <li
                  className={isActive(`/network/${id}/explorer`) ? 'active' : ''}
                >
                  <Link to={`/network/${id}/explorer`}>Explorer</Link>
                </li>
                <li className={isActive('#') ? 'active' : ''}>
                  <Link to={"#"}>Faucet</Link>
                </li>
              </ul>
            )}
          </ul>
        )}
      </nav>
    </aside>
  );
};
