import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [permissions, setPermissions] = useState([]);

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
    } finally {
      setLoading(false);
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await api.put(`/groups/${editingGroup.id}`, formData);
        alert('ອັບເດດກຸ່ມສຳເລັດ');
      } else {
        await api.post('/groups', formData);
        alert('ສ້າງກຸ່ມສຳເລັດ');
      }
      setShowModal(false);
      resetForm();
      fetchGroups();
    } catch (error) {
      alert(error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບກຸ່ມນີ້?')) {
      try {
        await api.delete(`/groups/${id}`);
        alert('ລຶບກຸ່ມສຳເລັດ');
        fetchGroups();
      } catch (error) {
        alert('ເກີດຂໍ້ຜິດພາດໃນການລຶບ');
      }
    }
  };

  const handleManagePermissions = async (group) => {
    try {
      const response = await api.get(`/groups/${group.id}`);
      const groupData = response.data.data;
      
      setSelectedGroup(groupData);
      
      const permissionMap = {};
      groupData.permissions?.forEach(p => {
        permissionMap[p.id] = {
          canView: p.can_view === 1,
          canCreate: p.can_create === 1,
          canEdit: p.can_edit === 1,
          canDelete: p.can_delete === 1
        };
      });

      const allPermissions = menus.map(menu => ({
        menuId: menu.id,
        menuName: menu.name,
        canView: permissionMap[menu.id]?.canView || false,
        canCreate: permissionMap[menu.id]?.canCreate || false,
        canEdit: permissionMap[menu.id]?.canEdit || false,
        canDelete: permissionMap[menu.id]?.canDelete || false
      }));

      setPermissions(allPermissions);
      setShowPermissionModal(true);
    } catch (error) {
      alert('ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນ');
    }
  };

  const handleSavePermissions = async () => {
    try {
      await api.post(`/groups/${selectedGroup.id}/permissions`, { permissions });
      alert('ກຳນົດສິດສຳເລັດ');
      setShowPermissionModal(false);
      fetchGroups();
    } catch (error) {
      alert('ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ');
    }
  };

  const updatePermission = (menuId, field, value) => {
    setPermissions(permissions.map(p =>
      p.menuId === menuId ? { ...p, [field]: value } : p
    ));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingGroup(null);
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">ຈັດການກຸ່ມຜູ້ໃຊ້</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>ເພີ່ມກຸ່ມ</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{group.description || 'ບໍ່ມີຄຳອະທິບາຍ'}</p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleManagePermissions(group)}
                className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50"
                title="ກຳນົດສິດ"
              >
                <ShieldCheckIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setEditingGroup(group);
                  setFormData({
                    name: group.name,
                    description: group.description || ''
                  });
                  setShowModal(true);
                }}
                className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                title="ແກ້ໄຂ"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(group.id)}
                className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                title="ລຶບ"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingGroup ? 'ແກ້ໄຂກຸ່ມ' : 'ເພີ່ມກຸ່ມໃໝ່'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ຊື່ກຸ່ມ
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ຄຳອະທິບາຍ
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
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
                  {editingGroup ? 'ອັບເດດ' : 'ເພີ່ມ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              ກຳນົດສິດໃຫ້ກຸ່ມ: {selectedGroup?.name}
            </h2>
            
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {permissions.map((perm) => (
                    <tr key={perm.menuId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {perm.menuName}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ບັນທຶກ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManagement;