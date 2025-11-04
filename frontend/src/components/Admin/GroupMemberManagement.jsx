import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  UserGroupIcon,
  UserPlusIcon,
  UserMinusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const GroupMemberManagement = () => {
  const [groups, setGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchAllUsers();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      if (response.data.success) {
        setGroups(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setAllUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    try {
      const response = await api.get(`/groups/${groupId}/members`);
      if (response.data.success) {
        setGroupMembers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
      setGroupMembers([]);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    fetchGroupMembers(group.id);
  };

  const handleAddMember = async (userId) => {
    if (!selectedGroup) return;

    try {
      await api.post(`/groups/${selectedGroup.id}/members`, { userId });
      alert('ເພີ່ມສະມາຊິກສຳເລັດ');
      fetchGroupMembers(selectedGroup.id);
      fetchGroups(); // Refresh to update member count
      setShowAddModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedGroup) return;

    if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບສະມາຊິກນີ້ອອກຈາກກຸ່ມ?')) {
      try {
        await api.delete(`/groups/${selectedGroup.id}/members/${userId}`);
        alert('ລຶບສະມາຊິກສຳເລັດ');
        fetchGroupMembers(selectedGroup.id);
        fetchGroups(); // Refresh to update member count
      } catch (error) {
        alert(error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ');
      }
    }
  };

  const availableUsers = allUsers.filter(user => 
    !groupMembers.some(member => member.id === user.id) &&
    (user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.username.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <h1 className="text-3xl font-bold text-gray-900">ຈັດການສະມາຊິກກຸ່ມ</h1>
        <p className="text-gray-600 mt-2">Assign ຜູ້ໃຊ້ເຂົ້າກຸ່ມຕ່າງໆ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ລາຍການກຸ່ມ */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ເລືອກກຸ່ມ</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleGroupSelect(group)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedGroup?.id === group.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserGroupIcon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{group.name}</div>
                        {group.description && (
                          <div className={`text-sm ${
                            selectedGroup?.id === group.id ? 'text-blue-100' : 'text-gray-600'
                          }`}>
                            {group.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      selectedGroup?.id === group.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {group.memberCount || 0}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ລາຍການສະມາຊິກ */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedGroup ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    ສະມາຊິກກຸ່ມ: {selectedGroup.name}
                  </h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <UserPlusIcon className="h-5 w-5" />
                    <span>ເພີ່ມສະມາຊິກ</span>
                  </button>
                </div>

                {groupMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="h-16 w-16 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">ຍັງບໍ່ມີສະມາຊິກໃນກຸ່ມນີ້</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groupMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.full_name}
                              {member.is_admin === 1 && (
                                <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              @{member.username} • {member.email}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                          title="ລຶບອອກຈາກກຸ່ມ"
                        >
                          <UserMinusIcon className="h-5 w-5" />
                          <span className="text-sm">ລຶບ</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <UserGroupIcon className="h-16 w-16 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">ກະລຸນາເລືອກກຸ່ມເພື່ອຈັດການສະມາຊິກ</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              ເພີ່ມສະມາຊິກໃໝ່ເຂົ້າກຸ່ມ: {selectedGroup?.name}
            </h2>

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

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  ບໍ່ພົບຜູ້ໃຊ້ທີ່ສາມາດເພີ່ມໄດ້
                </p>
              ) : (
                availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleAddMember(user.id)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          {user.full_name}
                          {user.is_admin === 1 && (
                            <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                    <UserPlusIcon className="h-5 w-5 text-green-600" />
                  </button>
                ))
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchTerm('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ປິດ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupMemberManagement;