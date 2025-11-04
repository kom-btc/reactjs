// frontend/src/components/Admin/AuditLogs.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ComputerDesktopIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    username: '',
    startDate: '',
    endDate: ''
  });

  // ⭐ ໃຊ້ useCallback ເພື່ອປ້ອງກັນການສ້າງຟັງຊັນໃໝ່ທຸກຄັ້ງ
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/audit-logs', { params: filters });
      console.log('Audit logs response:', response.data);
      if (response.data.success) {
        setLogs(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      alert('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
    } finally {
      setLoading(false);
    }
  }, [filters]); // ⭐ ເພີ່ມ filters ເປັນ dependency

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]); // ⭐ ເພີ່ມ fetchLogs ເປັນ dependency

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = () => {
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      action: '',
      username: '',
      startDate: '',
      endDate: ''
    });
  };

  // Parse details JSON
  const getDetails = (log) => {
    try {
      return JSON.parse(log.details);
    } catch {
      return {};
    }
  };

  // ສະແດງ Action Badge
  const getActionBadge = (action) => {
    const colors = {
      'LOGIN': 'bg-green-100 text-green-800',
      'LOGIN_FAILED': 'bg-red-100 text-red-800',
      'LOGOUT': 'bg-gray-100 text-gray-800',
      'CREATE': 'bg-blue-100 text-blue-800',
      'UPDATE': 'bg-yellow-100 text-yellow-800',
      'DELETE': 'bg-red-100 text-red-800',
      'VIEW': 'bg-purple-100 text-purple-800',
      'VIEW_ALL': 'bg-purple-100 text-purple-800',
      'ACCESS_MENU': 'bg-indigo-100 text-indigo-800',
      'CHANGE_PASSWORD': 'bg-orange-100 text-orange-800',
      'CHANGE_PASSWORD_FAILED': 'bg-red-100 text-red-800',
      'RESET_PASSWORD': 'bg-pink-100 text-pink-800',
      'GENERATE_TEMP_PASSWORD': 'bg-pink-100 text-pink-800'
    };

    const colorClass = colors[action] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">ບັນທຶກການເຂົ້າໃຊ້ລະບົບທັງໝົດ</p>
        </div>
        <div className="text-sm text-gray-500">
          ທັງໝົດ: <span className="font-semibold text-gray-900">{logs.length}</span> ລາຍການ
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold">ຕົວກອງ</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ທັງໝົດ</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGIN_FAILED">LOGIN_FAILED</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="VIEW_ALL">VIEW_ALL</option>
              <option value="ACCESS_MENU">ACCESS_MENU</option>
              <option value="CHANGE_PASSWORD">CHANGE_PASSWORD</option>
              <option value="RESET_PASSWORD">RESET_PASSWORD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ຜູ້ໃຊ້
            </label>
            <input
              type="text"
              name="username"
              value={filters.username}
              onChange={handleFilterChange}
              placeholder="ຊື່ຜູ້ໃຊ້"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
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

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ວັນທີ-ເວລາ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ຜູ້ໃຊ້
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-4 w-4 mr-1" />
                      IP
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <ComputerDesktopIcon className="h-4 w-4 mr-1" />
                      Computer
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => {
                  const details = getDetails(log);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleString('lo-LA', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                            <span className="text-blue-600 font-semibold text-xs">
                              {log.username?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {log.username || 'system'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-medium">
                          {log.resource}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <GlobeAltIcon className="h-4 w-4 mr-2 text-blue-500" />
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {log.ip_address}
                          </code>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-700">
                          <ComputerDesktopIcon className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-xs">
                            {details.computerName || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {details.browser || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {details.os || 'Unknown'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {logs.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">ບໍ່ມີຂໍ້ມູນ Audit Logs</p>
                <p className="text-sm text-gray-400 mt-1">ລອງປ່ຽນຕົວກອງເບິ່ງ</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;