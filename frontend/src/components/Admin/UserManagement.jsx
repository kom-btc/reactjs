// frontend/src/components/Admin/UserManagement.jsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetType, setResetType] = useState('manual');
  const [newPassword, setNewPassword] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    isAdmin: false,
    isActive: true,
    groupIds: []
  });

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      if (response.data.success) {
        setGroups(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
        alert('ອັບເດດຂໍ້ມູນສຳເລັດ');
      } else {
        await api.post('/users', formData);
        alert('ສ້າງຜູ້ໃຊ້ສຳເລັດ');
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ');
    }
  };

  const handleEdit = async (user) => {
    try {
      const response = await api.get(`/users/${user.id}`);
      const userData = response.data.data;
      setEditingUser(userData);
      setFormData({
        username: userData.username,
        password: '',
        fullName: userData.full_name,
        email: userData.email,
        isAdmin: userData.is_admin === 1,
        isActive: userData.is_active === 1,
        groupIds: userData.groups?.map(g => g.id) || []
      });
      setShowModal(true);
    } catch (error) {
      alert('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຜູ້ໃຊ້ນີ້?')) {
      try {
        await api.delete(`/users/${id}`);
        alert('ລຶບຜູ້ໃຊ້ສຳເລັດ');
        fetchUsers();
      } catch (error) {
        alert('ເກີດຂໍ້ຜິດພາດໃນການລຶບ');
      }
    }
  };

  // ເປີດ Modal Reset Password
  const handleOpenResetModal = (user, type = 'manual') => {
    setSelectedUser(user);
    setResetType(type);
    setNewPassword('');
    setTempPassword('');
    setResetMessage({ type: '', text: '' });
    setShowResetModal(true);
  };

  // Reset Password ແບບໃສ່ເອງ
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setResetMessage({
        type: 'error',
        text: 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ'
      });
      return;
    }

    setResetLoading(true);
    try {
      const response = await api.put(
        `/users/${selectedUser.id}/reset-password`,
        { newPassword }
      );

      if (response.data.success) {
        setResetMessage({ type: 'success', text: response.data.message });
        setTimeout(() => {
          setShowResetModal(false);
          setNewPassword('');
        }, 2000);
      }
    } catch (error) {
      setResetMessage({
        type: 'error',
        text: error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ'
      });
    } finally {
      setResetLoading(false);
    }
  };

  // ສ້າງລະຫັດຜ່ານຊົ່ວຄາວແບບອັດຕະໂນມັດ
  const handleGenerateTempPassword = async () => {
    setResetLoading(true);
    try {
      const response = await api.post(
        `/users/${selectedUser.id}/generate-temp-password`
      );

      if (response.data.success) {
        setTempPassword(response.data.data.tempPassword);
        setResetMessage({ type: 'success', text: response.data.message });
      }
    } catch (error) {
      setResetMessage({
        type: 'error',
        text: error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ'
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setResetMessage({ type: 'success', text: '📋 ຄັດລອກແລ້ວ!' });
    setTimeout(() => {
      setResetMessage({ type: '', text: '' });
    }, 2000);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      isAdmin: false,
      isActive: true,
      groupIds: []
    });
    setEditingUser(null);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">ຈັດການຜູ້ໃຊ້</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>ເພີ່ມຜູ້ໃຊ້</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາຜູ້ໃຊ້..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຊື່ຜູ້ໃຊ້
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຊື່ເຕັມ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ອີເມວ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ສະຖານະ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ສິດທິ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຈັດການ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_admin ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="ແກ້ໄຂ"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleOpenResetModal(user, 'manual')}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Reset ລະຫັດຜ່ານ"
                      >
                        <KeyIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleOpenResetModal(user, 'auto')}
                        className="text-purple-600 hover:text-purple-900"
                        title="ສ້າງລະຫັດຜ່ານຊົ່ວຄາວ"
                      >
                        <LockClosedIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="ລຶບ"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ແກ້ໄຂ/ເພີ່ມຜູ້ໃຊ້ */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingUser ? 'ແກ້ໄຂຜູ້ໃຊ້' : 'ເພີ່ມຜູ້ໃຊ້ໃໝ່'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ຊື່ຜູ້ໃຊ້
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ລະຫັດຜ່ານ
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ຊື່ເຕັມ
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ອີເມວ
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ກຸ່ມຜູ້ໃຊ້
                </label>
                <select
                  multiple
                  value={formData.groupIds}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                    setFormData({ ...formData, groupIds: values });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  size="4"
                >
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">ກົດ Ctrl ເພື່ອເລືອກຫຼາຍກຸ່ມ</p>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAdmin}
                    onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Admin</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">ເປີດໃຊ້ງານ</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingUser ? 'ອັບເດດ' : 'ເພີ່ມ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showResetModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {resetType === 'manual'
                    ? '🔑 Reset ລະຫັດຜ່ານ'
                    : '🔒 ສ້າງລະຫັດຜ່ານຊົ່ວຄາວ'}
                </h3>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="text-gray-400 hover:text-gray-500 text-2xl"
                >
                  &times;
                </button>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm text-gray-600">ຜູ້ໃຊ້:</p>
                <p className="text-base font-medium text-gray-900">
                  {selectedUser?.username} ({selectedUser?.full_name})
                </p>
                <p className="text-sm text-gray-500">{selectedUser?.email}</p>
              </div>

              {/* Message */}
              {resetMessage.text && (
                <div
                  className={`mb-4 p-3 rounded-md ${
                    resetMessage.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <p className="text-sm">{resetMessage.text}</p>
                </div>
              )}

              {/* Content */}
              {resetType === 'manual' ? (
                // Reset ແບບໃສ່ລະຫັດເອງ
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ລະຫັດຜ່ານໃໝ່ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ໃສ່ລະຫັດຜ່ານໃໝ່ (ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ)"
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    ⚠️ ກະລຸນາແຈ້ງລະຫັດຜ່ານນີ້ໃຫ້ຜູ້ໃຊ້ຮູ້
                  </p>
                </div>
              ) : (
                // ສ້າງລະຫັດຊົ່ວຄາວແບບອັດຕະໂນມັດ
                <div className="mb-4">
                  {tempPassword ? (
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                      <p className="text-sm text-gray-700 mb-2 font-medium">
                        ລະຫັດຜ່ານຊົ່ວຄາວ:
                      </p>
                      <div className="flex items-center justify-between bg-white p-3 rounded border border-blue-300">
                        <code className="text-lg font-mono font-bold text-blue-600 select-all">
                          {tempPassword}
                        </code>
                        <button
                          onClick={() => copyToClipboard(tempPassword)}
                          className="ml-2 p-2 text-blue-600 hover:bg-blue-100 rounded"
                          title="ຄັດລອກ"
                        >
                          <ClipboardDocumentIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800 font-medium">
                          ⚠️ ຄຳເຕືອນສຳຄັນ:
                        </p>
                        <ul className="mt-1 text-xs text-yellow-700 space-y-1">
                          <li>• ແຈ້ງລະຫັດຜ່ານນີ້ໃຫ້ຜູ້ໃຊ້ຜ່ານຊ່ອງທາງທີ່ປອດໄພ</li>
                          <li>• ແນະນຳໃຫ້ຜູ້ໃຊ້ປ່ຽນລະຫັດຜ່ານທັນທີ</li>
                          <li>• ລະຫັດຜ່ານນີ້ຈະບໍ່ສະແດງອີກຄັ້ງ</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <LockClosedIcon className="mx-auto h-16 w-16 text-gray-300" />
                      <p className="mt-3 text-sm text-gray-600">
                        ກົດປຸ່ມດ້ານລຸ່ມເພື່ອສ້າງລະຫັດຜ່ານຊົ່ວຄາວ
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        ລະບົບຈະສ້າງລະຫັດຜ່ານແບບສຸ່ມທີ່ປອດໄພ
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium"
                  disabled={resetLoading}
                >
                  {tempPassword ? 'ປິດ' : 'ຍົກເລີກ'}
                </button>
                
                {!tempPassword && (
                  <button
                    onClick={
                      resetType === 'manual'
                        ? handleResetPassword
                        : handleGenerateTempPassword
                    }
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    disabled={resetLoading}
                  >
                    {resetLoading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-4 w-4 mr-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        ກຳລັງດຳເນີນການ...
                      </span>
                    ) : resetType === 'manual' ? (
                      '✓ ຢືນຢັນ Reset'
                    ) : (
                      '🔄 ສ້າງລະຫັດຜ່ານ'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;