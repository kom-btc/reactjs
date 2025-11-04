import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UsersIcon,
  UserGroupIcon,
  Bars3Icon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalMenus: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      if (user?.isAdmin) {
        const [usersRes, groupsRes, menusRes] = await Promise.all([
          api.get('/users'),
          api.get('/groups'),
          api.get('/menus')
        ]);

        setStats({
          totalUsers: usersRes.data.data?.length || 0,
          totalGroups: groupsRes.data.data?.length || 0,
          totalMenus: menusRes.data.data?.length || 0,
          recentActivities: []
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.isAdmin]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          ຍິນດີຕ້ອນຮັບ, {user?.fullName}!
        </p>
      </div>

      {user?.isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="ຈຳນວນຜູ້ໃຊ້ທັງໝົດ"
            value={stats.totalUsers}
            icon={UsersIcon}
            color="bg-blue-500"
          />
          <StatCard
            title="ຈຳນວນກຸ່ມທັງໝົດ"
            value={stats.totalGroups}
            icon={UserGroupIcon}
            color="bg-green-500"
          />
          <StatCard
            title="ຈຳນວນເມນູທັງໝົດ"
            value={stats.totalMenus}
            icon={Bars3Icon}
            color="bg-purple-500"
          />
          <StatCard
            title="ກິດຈະກຳວັນນີ້"
            value="0"
            icon={ChartBarIcon}
            color="bg-orange-500"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ຂໍ້ມູນລະບົບ
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">ຊື່ຜູ້ໃຊ້:</span>
              <span className="font-semibold">{user?.username}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">ອີເມວ:</span>
              <span className="font-semibold">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">ສິດທິ:</span>
              <span className={`font-semibold ${user?.isAdmin ? 'text-yellow-600' : 'text-blue-600'}`}>
                {user?.isAdmin ? 'Administrator' : 'User'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Session Timeout:</span>
              <span className="font-semibold text-red-600">8 ຊົ່ວໂມງ</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ຄຸນສົມບັດລະບົບ
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>ການຈັດການຜູ້ໃຊ້ ແລະ ກຸ່ມຜູ້ໃຊ້</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>ລະບົບການກຳນົດສິດເຂົ້າເຖິງແບບຍືດຫຍຸ່ນ</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>JWT Authentication ທີ່ປອດໄພ</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>ບັນທຶກກິດຈະກຳທັງໝົດ (Audit Log)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Session Timeout ອັດຕະໂນມັດ (8 ຊົ່ວໂມງ)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>ລາຍງານຜູ້ໃຊ້ແບບສົມບູນ (PDF, CSV, JSON)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;