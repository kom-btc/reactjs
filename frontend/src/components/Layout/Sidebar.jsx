// frontend/src/components/Layout/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  Bars3Icon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ViewColumnsIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const iconMap = {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  MenuIcon: Bars3Icon,
  Bars3Icon,
  ShieldCheckIcon,
  DocumentTextIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ViewColumnsIcon,
  ChartBarIcon,
  KeyIcon: Cog6ToothIcon
};

const Sidebar = ({ isSidebarOpen }) => {
  const { menus, user } = useAuth();
  const navigate = useNavigate();

  // ⭐ ແກ້ໄຂຟັງຊັນນີ້
  const logMenuAccess = async (menu) => {
    try {
      // ກວດສອບວ່າມີຂໍ້ມູນຄົບ
      if (!menu || !menu.id || !menu.path || !menu.name) {
        console.warn('⚠️ Invalid menu data:', menu);
        return;
      }

      // ສົ່ງຂໍ້ມູນທີ່ເປັນ object ທຳມະດາ (ບໍ່ stringify)
      const response = await api.post('/menu-usage/log', {
        menuId: menu.id,
        menuPath: menu.path,
        menuName: menu.name
      });

      if (response.data.success) {
        console.log(`✅ Logged menu access: ${menu.name}`);
      }
    } catch (error) {
      console.error('❌ Failed to log menu access:', error);
      // ບໍ່ block user ຖ້າ logging ລົ້ມເຫຼວ
    }
  };

  const handleMenuClick = (e, menu) => {
    e.preventDefault();
    logMenuAccess(menu);
    navigate(menu.path);
  };

  const getIcon = (iconName) => {
    const Icon = iconMap[iconName] || HomeIcon;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <aside
      className={`bg-gray-800 text-white w-64 min-h-screen p-4 transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:static z-20`}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center py-4">ລະບົບຈັດການ</h1>
        <div className="text-center text-sm text-gray-400">
          {user?.fullName}
          {user?.isAdmin && (
            <span className="ml-2 bg-yellow-600 text-white px-2 py-0.5 rounded text-xs">
              Admin
            </span>
          )}
        </div>
      </div>

      <nav className="space-y-2">
        {menus && menus.length > 0 ? (
          menus.map((menu) => (
            <NavLink
              key={menu.id}
              to={menu.path}
              onClick={(e) => handleMenuClick(e, menu)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {getIcon(menu.icon)}
              <span>{menu.name}</span>
            </NavLink>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">ບໍ່ມີເມນູທີ່ເຂົ້າເຖິງໄດ້</p>
            <p className="text-xs mt-2">ກະລຸນາຕິດຕໍ່ Admin</p>
          </div>
        )}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          Version 1.0.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;