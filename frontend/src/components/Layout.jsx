import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="layout">
            <header className="header">
                <div className="header-content">
                    <div className="header-left">
                        <NavLink to="/dashboard" className="logo">
                            <span className="logo-icon">✉️</span>
                            <span className="logo-text">Plainly</span>
                        </NavLink>

                        <nav className="nav">
                            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                Dashboard
                            </NavLink>
                            <NavLink to="/emails" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                Emails
                            </NavLink>
                            <NavLink to="/automations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                Automations
                            </NavLink>
                            <NavLink to="/audience" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                Audience
                            </NavLink>
                            <NavLink to="/growth" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                Growth
                            </NavLink>
                        </nav>
                    </div>

                    <div className="header-right">
                        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            ⚙️
                        </NavLink>
                        <span className="user-name">{user?.name}</span>
                        <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
