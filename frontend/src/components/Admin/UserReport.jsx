import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  UserIcon,
  FunnelIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const UserReport = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAdmin, setFilterAdmin] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, groupsRes] = await Promise.all([
        api.get('/users'),
        api.get('/groups')
      ]);

      if (usersRes.data.success) {
        const usersWithGroups = await Promise.all(
          usersRes.data.data.map(async (user) => {
            try {
              const userDetail = await api.get(`/users/${user.id}`);
              return {
                ...user,
                groups: userDetail.data.data.groups || []
              };
            } catch (error) {
              return { ...user, groups: [] };
            }
          })
        );
        setUsers(usersWithGroups);
      }

      if (groupsRes.data.success) {
        setGroups(groupsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchGroup = filterGroup === '' || 
      user.groups.some(g => g.id === parseInt(filterGroup));

    const matchStatus = filterStatus === '' || 
      (filterStatus === 'active' ? user.is_active === 1 : user.is_active === 0);

    const matchAdmin = filterAdmin === '' || 
      (filterAdmin === 'admin' ? user.is_admin === 1 : user.is_admin === 0);

    return matchSearch && matchGroup && matchStatus && matchAdmin;
  });

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
    
    // Load Noto Sans Lao font (ຖ້າມີ)
    // doc.addFont('NotoSansLao-Regular.ttf', 'NotoSansLao', 'normal');
    // doc.setFont('NotoSansLao');
    
    // ຫົວລາຍງານ
    doc.setFontSize(18);
    doc.setTextColor(31, 41, 55); // gray-800
    doc.text('ລາຍງານຜູ້ໃຊ້ລະບົບ', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
    // ວັນທີ
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // gray-500
    const date = new Date().toLocaleDateString('lo-LA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`ວັນທີພິມ: ${date}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    
    // ສະຖິຕິ
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const stats = [
      `ຈຳນວນທັງໝົດ: ${filteredUsers.length} ຄົນ`,
      `ເປີດໃຊ້ງານ: ${filteredUsers.filter(u => u.is_active === 1).length} ຄົນ`,
      `Admin: ${filteredUsers.filter(u => u.is_admin === 1).length} ຄົນ`,
      `ກຸ່ມ: ${groups.length} ກຸ່ມ`
    ];
    doc.text(stats.join('  |  '), doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

    // ຕາຕະລາງ
    const tableColumn = ['ID', 'Username', 'ຊື່ເຕັມ', 'Email', 'ກຸ່ມ', 'ສະຖານະ', 'ບົດບາດ', 'ວັນທີສ້າງ'];
    const tableRows = filteredUsers.map(user => [
      user.id,
      user.username,
      user.full_name,
      user.email,
      user.groups.map(g => g.name).join(', ') || '-',
      user.is_active ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ',
      user.is_admin ? 'Admin' : 'User',
      new Date(user.created_at).toLocaleDateString('lo-LA')
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        font: 'helvetica' // ໃຊ້ font ມາດຕະຖານ
      },
      headStyles: {
        fillColor: [59, 130, 246], // blue-600
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // gray-50
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 50 },
        4: { cellWidth: 40 },
        5: { halign: 'center', cellWidth: 25 },
        6: { halign: 'center', cellWidth: 20 },
        7: { halign: 'center', cellWidth: 30 }
      },
      didDrawPage: (data) => {
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(
          `ໜ້າ ${data.pageNumber} ຈາກທັງໝົດ ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
    });

    // ບັນທຶກໄຟລ໌
    doc.save(`user_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Username', 'Full Name', 'Email', 'Groups', 'Status', 'Role', 'Created At'];
    const csvData = filteredUsers.map(user => [
      user.id,
      user.username,
      user.full_name,
      user.email,
      user.groups.map(g => g.name).join('; '),
      user.is_active ? 'Active' : 'Inactive',
      user.is_admin ? 'Admin' : 'User',
      new Date(user.created_at).toLocaleString('lo-LA')
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToJSON = () => {
    const jsonData = filteredUsers.map(user => ({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      groups: user.groups.map(g => ({ id: g.id, name: g.name })),
      isActive: user.is_active === 1,
      isAdmin: user.is_admin === 1,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));

    const reportData = {
      generatedAt: new Date().toISOString(),
      totalUsers: filteredUsers.length,
      activeUsers: filteredUsers.filter(u => u.is_active === 1).length,
      adminUsers: filteredUsers.filter(u => u.is_admin === 1).length,
      filters: {
        searchTerm,
        filterGroup: filterGroup ? groups.find(g => g.id === parseInt(filterGroup))?.name : 'All',
        filterStatus: filterStatus || 'All',
        filterAdmin: filterAdmin || 'All'
      },
      users: jsonData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ລາຍງານຜູ້ໃຊ້ລະບົບ</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');
            
            body { 
              font-family: 'Noto Sans Lao', sans-serif; 
              padding: 20px;
              color: #1f2937;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
            }
            h1 { 
              color: #1f2937; 
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            .date { 
              color: #6b7280; 
              font-size: 14px;
              margin: 5px 0;
            }
            .stats {
              display: flex;
              justify-content: center;
              gap: 30px;
              margin: 15px 0;
              font-size: 13px;
              color: #4b5563;
            }
            .stats strong {
              color: #1f2937;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 11px;
            }
            th, td { 
              border: 1px solid #e5e7eb; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #3b82f6; 
              color: white;
              font-weight: 600;
            }
            tr:nth-child(even) { 
              background-color: #f9fafb; 
            }
            tr:hover {
              background-color: #eff6ff;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 600;
            }
            .badge-active {
              background-color: #dcfce7;
              color: #166534;
            }
            .badge-inactive {
              background-color: #fee2e2;
              color: #991b1b;
            }
            .badge-admin {
              background-color: #fef3c7;
              color: #92400e;
            }
            .badge-user {
              background-color: #e5e7eb;
              color: #374151;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              padding-top: 15px;
            }
            @media print {
              button { display: none; }
              body { padding: 10px; }
            }
            @page {
              size: landscape;
              margin: 1cm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 ລາຍງານຜູ້ໃຊ້ລະບົບ</h1>
            <p class="date">ວັນທີພິມ: ${new Date().toLocaleDateString('lo-LA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <div class="stats">
              <span><strong>ຈຳນວນທັງໝົດ:</strong> ${filteredUsers.length} ຄົນ</span>
              <span><strong>ເປີດໃຊ້ງານ:</strong> ${filteredUsers.filter(u => u.is_active === 1).length} ຄົນ</span>
              <span><strong>Admin:</strong> ${filteredUsers.filter(u => u.is_admin === 1).length} ຄົນ</span>
              <span><strong>ກຸ່ມ:</strong> ${groups.length} ກຸ່ມ</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 5%;">ID</th>
                <th style="width: 12%;">Username</th>
                <th style="width: 15%;">ຊື່ເຕັມ</th>
                <th style="width: 18%;">Email</th>
                <th style="width: 18%;">ກຸ່ມ</th>
                <th style="width: 10%;">ສະຖານະ</th>
                <th style="width: 10%;">ບົດບາດ</th>
                <th style="width: 12%;">ວັນທີສ້າງ</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers.map(user => `
                <tr>
                  <td style="text-align: center;">${user.id}</td>
                  <td><strong>${user.username}</strong></td>
                  <td>${user.full_name}</td>
                  <td>${user.email}</td>
                  <td>${user.groups.map(g => g.name).join(', ') || '-'}</td>
                  <td style="text-align: center;">
                    <span class="badge ${user.is_active ? 'badge-active' : 'badge-inactive'}">
                      ${user.is_active ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                    </span>
                  </td>
                  <td style="text-align: center;">
                    <span class="badge ${user.is_admin ? 'badge-admin' : 'badge-user'}">
                      ${user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td style="text-align: center;">${new Date(user.created_at).toLocaleDateString('lo-LA')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>ລາຍງານນີ້ສ້າງໂດຍອັດຕະໂນມັດຈາກລະບົບຈັດການ</p>
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
        <h1 className="text-3xl font-bold text-gray-900">📊 ລາຍງານຜູ້ໃຊ້ລະບົບ</h1>
        <p className="text-gray-600 mt-2">ລາຍງານຂໍ້ມູນຜູ້ໃຊ້ທັງໝົດໃນລະບົບ</p>
      </div>

      {/* ສະຖິຕິ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          <div className="text-sm text-blue-700">ຜູ້ໃຊ້ທັງໝົດ</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.is_active === 1).length}
          </div>
          <div className="text-sm text-green-700">ເປີດໃຊ້ງານ</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">
            {users.filter(u => u.is_admin === 1).length}
          </div>
          <div className="text-sm text-yellow-700">Admin</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{groups.length}</div>
          <div className="text-sm text-purple-700">ກຸ່ມທັງໝົດ</div>
        </div>
      </div>

      {/* ຟິວເຕີ */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">ຟິວເຕີ ແລະ ຄົ້ນຫາ</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
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

          <div>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ທຸກກຸ່ມ</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ທຸກສະຖານະ</option>
              <option value="active">ເປີດໃຊ້ງານ</option>
              <option value="inactive">ປິດໃຊ້ງານ</option>
            </select>
          </div>

          <div>
            <select
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ທຸກບົດບາດ</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* ປຸ່ມ Export */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4">
        <div className="text-sm text-gray-600">
          ສະແດງ <span className="font-semibold text-gray-900">{filteredUsers.length}</span> ຈາກທັງໝົດ {users.length} ຄົນ
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            title="Export PDF"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>PDF</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            title="Export CSV"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>CSV</span>
          </button>
          <button
            onClick={exportToJSON}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            title="Export JSON"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>JSON</span>
          </button>
          <button
            onClick={printReport}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            title="Print Report"
          >
            <PrinterIcon className="h-5 w-5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ຕາຕະລາງ */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ຜູ້ໃຊ້</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ຊື່ເຕັມ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ກຸ່ມ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ສະຖານະ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ບົດບາດ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ວັນທີສ້າງ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.groups.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.groups.map(group => (
                          <span key={group.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {group.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">ບໍ່ມີກຸ່ມ</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_admin ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('lo-LA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="h-16 w-16 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ຕາມເງື່ອນໄຂທີ່ຄົ້ນຫາ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReport;