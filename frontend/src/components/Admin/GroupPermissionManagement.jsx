import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const GroupPermissionManagement = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
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

  const fetchGroupPermissions = async (groupId) => {
    try {
      const response = await api.get(`/groups/${groupId}/permissions`);
      if (response.data.success) {
        const permissionsData = response.data.data.map(menu => ({
          menuId: menu.id,
          menuName: menu.name,
          menuPath: menu.path,
          canView: menu.can_view === 1,
          canCreate: menu.can_create === 1,
          canEdit: menu.can_edit === 1,
          canDelete: menu.can_delete === 1
        }));
        setPermissions(permissionsData);
      }
    } catch (error) {
      console.error('Error fetching group permissions:', error);
      setPermissions([]);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    fetchGroupPermissions(group.id);
  };

  const updatePermission = (menuId, field, value) => {
    setPermissions(permissions.map(p =>
      p.menuId === menuId ? { ...p, [field]: value } : p
    ));
  };

  const handleSavePermissions = async () => {
    if (!selectedGroup) return;

    try {
      await api.post(`/groups/${selectedGroup.id}/permissions`, { permissions });
      alert('ກຳນົດສິດໃຫ້ກຸ່ມສຳເລັດ');
      fetchGroupPermissions(selectedGroup.id);
    } catch (error) {
      alert(error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ');
    }
  };

  const toggleAllPermissions = (menuId, enable) => {
    setPermissions(permissions.map(p =>
      p.menuId === menuId ? {
        ...p,
        canView: enable,
        canCreate: enable,
        canEdit: enable,
        canDelete: enable
      } : p
    ));
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
        <h1 className="text-3xl font-bold text-gray-900">ຈັດການສິດກຸ່ມຜູ້ໃຊ້</h1>
        <p className="text-gray-600 mt-2">ກຳນົດສິດການເຂົ້າເຖິງແຕ່ລະເມນູສຳລັບກຸ່ມ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ລາຍການກຸ່ມ */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ເລືອກກຸ່ມ</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
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
                    <div className="flex items-center space-x-3">
                      <UserGroupIcon className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">{group.name}</div>
                        {group.description && (
                          <div className={`text-sm ${
                            selectedGroup?.id === group.id ? 'text-blue-100' : 'text-gray-600'
                          }`}>
                            {group.description}
                          </div>
                        )}
                        <div className={`text-xs mt-1 ${
                          selectedGroup?.id === group.id ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          {group.memberCount || 0} ສະມາຊິກ
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ລາຍການສິດ */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedGroup ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    ສິດຂອງກຸ່ມ: {selectedGroup.name}
                  </h2>
                  <button
                    onClick={handleSavePermissions}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>ບັນທຶກສິດ</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ເມນູ
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          ເບິ່ງ
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          ສ້າງ
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          ແກ້ໄຂ
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          ລຶບ
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          ທັງໝົດ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {permissions.map((perm) => {
                        const allEnabled = perm.canView && perm.canCreate && perm.canEdit && perm.canDelete;
                        return (
                          <tr key={perm.menuId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {perm.menuName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {perm.menuPath}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={perm.canView}
                                onChange={(e) => updatePermission(perm.menuId, 'canView', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={perm.canCreate}
                                onChange={(e) => updatePermission(perm.menuId, 'canCreate', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={perm.canEdit}
                                onChange={(e) => updatePermission(perm.menuId, 'canEdit', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={perm.canDelete}
                                onChange={(e) => updatePermission(perm.menuId, 'canDelete', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => toggleAllPermissions(perm.menuId, !allEnabled)}
                                className={`p-1 rounded transition-colors ${
                                  allEnabled 
                                    ? 'text-green-600 hover:bg-green-50' 
                                    : 'text-gray-400 hover:bg-gray-50'
                                }`}
                                title={allEnabled ? 'ປິດທັງໝົດ' : 'ເປີດທັງໝົດ'}
                              >
                                {allEnabled ? (
                                  <CheckCircleIcon className="h-6 w-6" />
                                ) : (
                                  <XCircleIcon className="h-6 w-6" />
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <ShieldCheckIcon className="h-16 w-16 mx-auto" />
                </div>
                <p className="text-gray-600">ກະລຸນາເລືອກກຸ່ມເພື່ອຈັດການສິດ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPermissionManagement;