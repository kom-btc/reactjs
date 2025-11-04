import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  UserCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອອກຈາກລະບົບ?')) {
      logout();
      navigate('/login');
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('lo-LA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white shadow-md px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <ClockIcon className="h-5 w-5" />
            <div className="text-sm">
              <div className="font-semibold">{formatTime(currentTime)}</div>
              <div className="text-xs text-gray-500">{formatDate(currentTime)}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <UserCircleIcon className="h-6 w-6" />
            <span className="hidden sm:inline text-sm font-medium">
              {user?.fullName}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="hidden sm:inline text-sm font-medium">
              ອອກຈາກລະບົບ
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;