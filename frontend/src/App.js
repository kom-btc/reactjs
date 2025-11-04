// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import UserManagement from './components/Admin/UserManagement';
import GroupManagement from './components/Admin/GroupManagement';
import GroupMenuManagement from './components/Admin/GroupMenuManagement';
import GroupMemberManagement from './components/Admin/GroupMemberManagement';
import MenuManagement from './components/Admin/MenuManagement';
import PermissionManagement from './components/Admin/PermissionManagement';
import UserReport from './components/Admin/UserReport';
import AuditLogs from './components/Admin/AuditLogs';
import ChangePassword from './pages/ChangePassword';
import MenuUsageReport from './pages/MenuUsageReport';

function App() {
  return (
    <BrowserRouter> {/* ⭐ ປ່ຽນລຳດັບ: BrowserRouter ກ່ອນ */}
      <AuthProvider> {/* ⭐ AuthProvider ຫຼັງ */}
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route
              path="users"
              element={
                <ProtectedRoute requiredPath="/users">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="user-report"
              element={
                <ProtectedRoute requiredPath="/user-report">
                  <UserReport />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="groups"
              element={
                <ProtectedRoute requiredPath="/groups">
                  <GroupManagement />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="group-menus"
              element={
                <ProtectedRoute requiredPath="/group-menus">
                  <GroupMenuManagement />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="group-permissions"
              element={
                <ProtectedRoute requiredPath="/group-permissions">
                  <PermissionManagement />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="group-members"
              element={
                <ProtectedRoute requiredPath="/group-members">
                  <GroupMemberManagement />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="menus"
              element={
                <ProtectedRoute requiredPath="/menus">
                  <MenuManagement />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute requiredPath="/audit-logs" requireAdmin={true}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />

            <Route
              path="menu-usage-report"
              element={
                <ProtectedRoute requiredPath="/menu-usage-report" requireAdmin={true}>
                  <MenuUsageReport />
                </ProtectedRoute>
              }
            />

            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;