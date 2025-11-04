// frontend/src/pages/MenuUsageReport.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { 
  ChartBarIcon, 
  UsersIcon, 
  CalendarIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const MenuUsageReport = () => {
  const [activeTab, setActiveTab] = useState('detail');
  const [loading, setLoading] = useState(true);
  const [detailLogs, setDetailLogs] = useState([]);
  const [menuSummary, setMenuSummary] = useState([]);
  const [userSummary, setUserSummary] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'detail') {
        const response = await api.get('/menu-usage/report', { params: filters });
        console.log('Detail logs:', response.data);
        setDetailLogs(response.data.data || []);
      } else if (activeTab === 'menu') {
        const response = await api.get('/menu-usage/summary/menu', { params: filters });
        console.log('Menu summary:', response.data);
        setMenuSummary(response.data.data || []);
      } else if (activeTab === 'user') {
        const response = await api.get('/menu-usage/summary/user', { params: filters });
        console.log('User summary:', response.data);
        setUserSummary(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = () => {
    fetchData();
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ລາຍງານການນຳໃຊ້ Menu</h1>
          <p className="text-gray-600 mt-1">ຕິດຕາມການເຂົ້າໃຊ້ງານຂອງຜູ້ໃຊ້</p>
        </div>
        <div className="text-sm text-gray-500">
          ທັງໝົດ: <span className="font-semibold text-gray-900">
            {activeTab === 'detail' ? detailLogs.length : 
             activeTab === 'menu' ? menuSummary.length : 
             userSummary.length}
          </span> ລາຍການ
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">ຕົວກອງ</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ວັນທີເລີ່ມຕົ້ນ
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ວັນທີສິ້ນສຸດ
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center transition"
            >
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              ຄົ້ນຫາ
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              ລ້າງຕົວກອງ
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('detail')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition ${
                activeTab === 'detail'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              ລາຍລະອຽດ
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition ${
                activeTab === 'menu'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              ສະຫຼຸບຕາມ Menu
            </button>
            <button
              onClick={() => setActiveTab('user')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition ${
                activeTab === 'user'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UsersIcon className="h-5 w-5 mr-2" />
              ສະຫຼຸບຕາມ User
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Detail Tab */}
              {activeTab === 'detail' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ວັນທີ-ເວລາ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ຜູ້ໃຊ້</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ຊື່ເຕັມ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menu</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.created_at).toLocaleString('lo-LA')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {log.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.full_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {log.menu_name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.menu_path}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {log.ip_address}
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {detailLogs.length === 0 && (
                    <div className="text-center py-12 text-gray-500">ບໍ່ມີຂໍ້ມູນ</div>
                  )}
                </div>
              )}

              {/* Menu Summary Tab */}
              {activeTab === 'menu' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menu</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ຈຳນວນການເຂົ້າໃຊ້</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ຈຳນວນຜູ້ໃຊ້</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ເຂົ້າໃຊ້ຫຼ້າສຸດ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {menuSummary.map((menu, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {menu.menu_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                              {menu.access_count}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                              {menu.unique_users}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(menu.last_access).toLocaleString('lo-LA')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {menuSummary.length === 0 && (
                    <div className="text-center py-12 text-gray-500">ບໍ່ມີຂໍ້ມູນ</div>
                  )}
                </div>
              )}

              {/* User Summary Tab */}
              {activeTab === 'user' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ຜູ້ໃຊ້</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ຊື່ເຕັມ</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ຈຳນວນການເຂົ້າໃຊ້</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">ຈຳນວນ Menu</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ເຂົ້າໃຊ້ຫຼ້າສຸດ</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userSummary.map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.full_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                              {user.total_access}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                              {user.unique_menus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.last_access).toLocaleString('lo-LA')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {userSummary.length === 0 && (
                    <div className="text-center py-12 text-gray-500">ບໍ່ມີຂໍ້ມູນ</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuUsageReport;