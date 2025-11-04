import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    icon: '',
    orderIndex: 0,
    parentId: null,
    isActive: true
  });

  useEffect(() => {
    fetchMenus();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMenu) {
        await api.put(`/menus/${editingMenu.id}`, formData);
        alert('ອັບເດດເມນູສຳເລັດ');
      } else {
        await api.post('/menus', formData);
        alert('ສ້າງເມນູສຳເລັດ');
      }
      setShowModal(false);
      resetForm();
      fetchMenus();
    } catch (error) {
      alert(error.response?.data?.message || 'ເກີດຂໍ້ຜິດພາດ');
    }
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      path: menu.path,
      icon: menu.icon || '',
      orderIndex: menu.order_index,
      parentId: menu.parent_id || null,
      isActive: menu.is_active === 1
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບເມນູນີ້?')) {
      try {
        await api.delete(`/menus/${id}`);
        alert('ລຶບເມນູສຳເລັດ');
        fetchMenus();
      } catch (error) {
        alert('ເກີດຂໍ້ຜິດພາດໃນການລຶບ');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      path: '',
      icon: '',
      orderIndex: 0,
      parentId: null,
      isActive: true
    });
    setEditingMenu(null);
  };

  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableIcons = [
    'HomeIcon',
    'UsersIcon',
    'UserGroupIcon',
    'Bars3Icon',
    'ShieldCheckIcon',
    'DocumentTextIcon',
    'UserCircleIcon',
    'Cog6ToothIcon',
    'ViewColumnsIcon',
    'ChartBarIcon',
    'FolderIcon',
    'ClipboardIcon',
    'CogIcon',
    'BellIcon',
    'InboxIcon',
    'CalendarIcon',
    'MapIcon',
    'PhotoIcon',
    'VideoCameraIcon',
    'MicrophoneIcon'
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">ຈັດການເມນູ</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>ເພີ່ມເມນູ</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາເມນູ..."
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
                  ລຳດັບ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຊື່ເມນູ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ສະຖານະ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ຈັດການ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMenus.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    ບໍ່ພົບຂໍ້ມູນເມນູ
                  </td>
                </tr>
              ) : (
                filteredMenus.map((menu) => (
                  <tr key={menu.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {menu.order_index}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {menu.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {menu.path}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {menu.icon || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        menu.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {menu.is_active ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(menu)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="ແກ້ໄຂ"
                      >
                        <PencilIcon className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(menu.id)}
                        className="text-red-600 hover:text-red-900"
                        title="ລຶບ"
                      >
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingMenu ? 'ແກ້ໄຂເມນູ' : 'ເພີ່ມເມນູໃໝ່'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ຊື່ເມນູ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ຕົວຢ່າງ: Dashboard"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Path <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ຕົວຢ່າງ: /dashboard"
                />
                <p className="text-xs text-gray-500 mt-1">ຕ້ອງເລີ່ມຕົ້ນດ້ວຍ /</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">ເລືອກ Icon</option>
                  {availableIcons.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ລຳດັບການສະແດງ
                </label>
                <input
                  type="number"
                  value={formData.orderIndex}
                  onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Menu
                </label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">ບໍ່ມີ (Menu ຫຼັກ)</option>
                  {menus.filter(m => !editingMenu || m.id !== editingMenu.id).map(menu => (
                    <option key={menu.id} value={menu.id}>{menu.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  ເປີດໃຊ້ງານເມນູນີ້
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingMenu ? 'ອັບເດດ' : 'ເພີ່ມ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;