import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const GroupMenuManagement = () => {
  const [groups, setGroups] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMenus, setGroupMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
    fetchMenus();
  }, []);

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

  const fetchMenus = async () => {
    try {
      const response = await api.get('/menus');
      if (response.data.success) {
        setMenus(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMenus = async (groupId) => {
    try {
      const response = await api.get(`/groups/${groupId}/menus`);
      if (response.data.success) {
        setGroupMenus(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching group menus:', error);
      setGroupMenus([]);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    fetchGroupMenus(group.id);
  };

  const isMenuVisible = (menuId) => {
    return groupMenus.some(m => m.id === menuId);
  };

  const toggleMenuVisibility = async (menuId, isVisible) => {
    if (!selectedGroup) return;

    try {
      if (isVisible) {
        await api.post(`/groups/${selectedGroup.id}/menus`, { menuId });
      } else {
        await api.delete(`/groups/${selectedGroup.id}/menus/${menuId}`);
      }
      
      await fetchGroupMenus(selectedGroup.id);
      alert(isVisible ? 'ເພີ່ມເມນູສຳເລັດ' : 'ລຶບເມນູສຳເລັດ');
    } catch (error) {
      alert(error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ');
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">ຈັດການເມນູຂອງກຸ່ມ</h1>
        <p className="text-gray-600 mt-2">ກຳນົດເມນູທີ່ກຸ່ມສາມາດເຫັນໄດ້</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ເລືອກກຸ່ມ</h2>
            <div className="space-y-2">
              {groups.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ຍັງບໍ່ມີກຸ່ມ</p>
              ) : (
                groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleGroupSelect(group)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedGroup?.id === group.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium">{group.name}</div>
                    {group.description && (
                      <div className={`text-sm mt-1 ${
                        selectedGroup?.id === group.id ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {group.description}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedGroup ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    ເມນູຂອງກຸ່ມ: {selectedGroup.name}
                  </h2>
                  <div className="text-sm text-gray-600">
                    {groupMenus.length}/{menus.length} ເມນູ
                  </div>
                </div>

                <div className="space-y-2">
                  {menus.map((menu) => {
                    const isVisible = isMenuVisible(menu.id);
                    return (
                      <div
                        key={menu.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          isVisible
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {isVisible ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                          ) : (
                            <XCircleIcon className="h-6 w-6 text-gray-400" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {menu.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {menu.path}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleMenuVisibility(menu.id, !isVisible)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            isVisible
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {isVisible ? (
                            <>
                              <EyeSlashIcon className="h-5 w-5" />
                              <span>ເຊື່ອງ</span>
                            </>
                          ) : (
                            <>
                              <EyeIcon className="h-5 w-5" />
                              <span>ສະແດງ</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <EyeIcon className="h-16 w-16 mx-auto" />
                </div>
                <p className="text-gray-600">ກະລຸນາເລືອກກຸ່ມເພື່ອຈັດການເມນູ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupMenuManagement;