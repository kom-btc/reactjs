// frontend/src/components/Common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredPath, requireAdmin = false }) => {
  const { user, menus, loading, hasAdminAccess } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ⭐ ຖ້າຕ້ອງການສິດ admin
  if (requireAdmin && !hasAdminAccess()) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ບໍ່ມີສິດເຂົ້າເຖິງ</h2>
          <p className="text-gray-600">ທ່ານຕ້ອງຢູ່ໃນ Admin Group ເພື່ອເຂົ້າເຖິງໜ້ານີ້</p>
        </div>
      </div>
    );
  }

  if (requiredPath) {
    const hasAccess = menus?.some(menu => menu.path === requiredPath);
    
    if (!hasAccess && !hasAdminAccess()) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">ບໍ່ມີສິດເຂົ້າເຖິງ</h2>
            <p className="text-gray-600">ທ່ານບໍ່ມີສິດເຂົ້າເຖິງໜ້ານີ້</p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;