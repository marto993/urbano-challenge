import { BookOpen, Home, LogOut, Users } from 'react-feather';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import useAuth from '../../hooks/useAuth';
import authService from '../../services/AuthService';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  className: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const history = useHistory();

  const { authenticatedUser, setAuthenticatedUser } = useAuth();

  const handleLogout = async () => {
    await authService.logout();
    setAuthenticatedUser(null);
    history.push('/login');
  };

  const sidebarStyles = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${process.env.PUBLIC_URL}/assets/sidemenu-bg.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className={'sidebar ' + className} style={sidebarStyles}>
      <div className="flex justify-center items-center py-8 px-4">
        <Link to="/" className="no-underline text-primary-white">
          <img src={`${process.env.PUBLIC_URL}/assets/urbano-logo-white.png`} alt="Urbano" className="h-16 w-auto" />
        </Link>
      </div>
      <nav className="mt-8 flex flex-col gap-4 px-4 flex-grow">
        <SidebarItem to="/">
          <Home /> Dashboard
        </SidebarItem>
        <SidebarItem to="/courses">
          <BookOpen /> Courses
        </SidebarItem>
        {authenticatedUser.role === 'admin' ? (
          <SidebarItem to="/users">
            <Users /> Users
          </SidebarItem>
        ) : null}
      </nav>
      <button
        className="text-red-500 rounded-md p-3 transition-colors flex gap-3 justify-center items-center font-semibold focus:outline-none px-4"
        onClick={handleLogout}
      >
        <LogOut /> Logout
      </button>
    </div>
  );
}
