import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const PermissionManagement = () => {
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

  const selectAllMenus = (enable) => {
    setPermissions(permissions.map(p => ({
      ...p,
      canView: enable,
      canCreate: enable,
      canEdit: enable,
      canDelete: enable
    })));
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
        <p className="text-gray-600 mt-2">ກຳນົດສິດການເຂົ້າເຖິງແຕ່ລະເມນູສຳລັບກຸ່ມຜູ້ໃຊ້</p>
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 <strong>ຂັ້ນຕອນການໃຊ້ງານ:</strong>
          </p>
          <ol className="text-sm text-blue-700 ml-4 mt-1 space-y-1">
            <li>1. ເລືອກກຸ່ມຜູ້ໃຊ້ທີ່ຕ້ອງການກຳນົດສິດ</li>
            <li>2. ກຳນົດສິດໃຫ້ແຕ່ລະເມນູ (ເບິ່ງ, ສ້າງ, ແກ້ໄຂ, ລຶບ)</li>
            <li>3. ກົດປຸ່ມ "ບັນທຶກສິດ" ເພື່ອບັນທຶກການປ່ຽນແປງ</li>
            <li>4. ຜູ້ໃຊ້ທີ່ຢູ່ໃນກຸ່ມນັ້ນຈະໄດ້ຮັບສິດອັດຕະໂນມັດ</li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ລາຍການກຸ່ມ */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ເລືອກກຸ່ມ</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {groups.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">ຍັງບໍ່ມີກຸ່ມ</p>
                  <p className="text-sm text-gray-400 mt-1">ສ້າງກຸ່ມໃໝ່ທີ່ Group Management</p>
                </div>
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
                        {group.memberCount || 0} ຄົນ
                      </span>
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
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      ສິດຂອງກຸ່ມ: {selectedGroup.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedGroup.memberCount || 0} ສະມາຊິກຈະໄດ້ຮັບສິດເຫຼົ່ານີ້
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => selectAllMenus(true)}
                      className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      ເລືອກທັງໝົດ
                    </button>
                    <button
                      onClick={() => selectAllMenus(false)}
                      className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      ຍົກເລີກທັງໝົດ
                    </button>
                    <button
                      onClick={handleSavePermissions}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ShieldCheckIcon className="h-5 w-5" />
                      <span>ບັນທຶກສິດ</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ເມນູ
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          <div>ເບິ່ງ</div>
                          <div className="text-xs font-normal normal-case text-gray-400">(View)</div>
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          <div>ສ້າງ</div>
                          <div className="text-xs font-normal normal-case text-gray-400">(Create)</div>
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          <div>ແກ້ໄຂ</div>
                          <div className="text-xs font-normal normal-case text-gray-400">(Edit)</div>
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          <div>ລຶບ</div>
                          <div className="text-xs font-normal normal-case text-gray-400">(Delete)</div>
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          ທັງໝົດ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {permissions.map((perm) => {
                        const allEnabled = perm.canView && perm.canCreate && perm.canEdit && perm.canDelete;
                        const someEnabled = perm.canView || perm.canCreate || perm.canEdit || perm.canDelete;
                        
                        return (
                          <tr 
                            key={perm.menuId} 
                            className={`hover:bg-gray-50 ${someEnabled ? 'bg-green-50' : ''}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                {someEnabled && (
                                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                )}
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {perm.menuName}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {perm.menuPath}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={perm.canView}
                                onChange={(e) => updatePermission(perm.menuId, 'canView', e.target.checked)}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={perm.canCreate}
                                onChange={(e) => updatePermission(perm.menuId, 'canCreate', e.target.checked)}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={perm.canEdit}
                                onChange={(e) => updatePermission(perm.menuId, 'canEdit', e.target.checked)}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="checkbox"
                                checked={perm.canDelete}
                                onChange={(e) => updatePermission(perm.menuId, 'canDelete', e.target.checked)}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => toggleAllPermissions(perm.menuId, !allEnabled)}
                                className={`p-1 rounded transition-colors ${
                                  allEnabled 
                                    ? 'text-green-600 hover:bg-green-100' 
                                    : 'text-gray-400 hover:bg-gray-100'
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

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>ໝາຍເຫດ:</strong> ການປ່ຽນແປງສິດຂອງກຸ່ມຈະມີຜົນກັບສະມາຊິກທັງໝົດໃນກຸ່ມ. 
                    ຖ້າຕ້ອງການກຳນົດສິດສະເພາະບຸກຄົນ, ໃຫ້ໄປທີ່ User Management.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <ShieldCheckIcon className="h-16 w-16 mx-auto" />
                </div>
                <p className="text-gray-600 text-lg">ກະລຸນາເລືອກກຸ່ມເພື່ອຈັດການສິດ</p>
                <p className="text-gray-500 text-sm mt-2">
                  ເລືອກກຸ່ມຈາກລາຍການດ້ານຊ້າຍ
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ສະຖິຕິສະຫຼຸບ */}
      {selectedGroup && permissions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">ສະຫຼຸບສິດທີ່ກຳນົດ</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {permissions.filter(p => p.canView).length}
              </div>
              <div className="text-sm text-blue-700">ເມນູທີ່ເບິ່ງໄດ້</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {permissions.filter(p => p.canCreate).length}
              </div>
              <div className="text-sm text-green-700">ເມນູທີ່ສ້າງໄດ້</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {permissions.filter(p => p.canEdit).length}
              </div>
              <div className="text-sm text-yellow-700">ເມນູທີ່ແກ້ໄຂໄດ້</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">
                {permissions.filter(p => p.canDelete).length}
              </div>
              <div className="text-sm text-red-700">ເມນູທີ່ລຶບໄດ້</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;