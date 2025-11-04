// src/pages/ChangePassword.jsx
import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
      { strength: 1, text: 'ອ່ອນຫຼາຍ', color: 'bg-red-500' },
      { strength: 2, text: 'ອ່ອນ', color: 'bg-orange-500' },
      { strength: 3, text: 'ປານກາງ', color: 'bg-yellow-500' },
      { strength: 4, text: 'ດີ', color: 'bg-blue-500' },
      { strength: 5, text: 'ແຂງແຮງ', color: 'bg-green-500' }
    ];

    return levels[strength - 1] || levels[0];
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'ກະລຸນາໃສ່ລະຫັດຜ່ານປັດຈຸບັນ';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'ກະລຸນາໃສ່ລະຫັດຜ່ານໃໝ່';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'ກະລຸນາຢືນຢັນລະຫັດຜ່ານໃໝ່';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'ລະຫັດຜ່ານບໍ່ກົງກັນ';
    }

    if (formData.currentPassword === formData.newPassword && formData.newPassword) {
      newErrors.newPassword = 'ລະຫັດຜ່ານໃໝ່ຕ້ອງບໍ່ຄືກັບລະຫັດຜ່ານເກົ່າ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: data.message || 'ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ'
        });
        
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນລະຫັດຜ່ານ'
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({
        type: 'error',
        text: 'ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີເວີໄດ້'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center">
            <KeyIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              ປ່ຽນລະຫັດຜ່ານ
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            ກະລຸນາໃສ່ລະຫັດຜ່ານປັດຈຸບັນແລະລະຫັດຜ່ານໃໝ່ຂອງທ່ານ
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className="mx-6 mt-4">
            <div
              className={`p-4 rounded-md ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ລະຫັດຜ່ານປັດຈຸບັນ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                  errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ໃສ່ລະຫັດຜ່ານປັດຈຸບັນ"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.current ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ລະຫັດຜ່ານໃໝ່ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ໃສ່ລະຫັດຜ່ານໃໝ່"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Password Strength */}
            {formData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">ຄວາມແຂງແຮງ:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.strength >= 4 ? 'text-green-600' :
                    passwordStrength.strength >= 3 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
            
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <p>• ຄວາມຍາວຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ</p>
              <p>• ແນະນຳໃຫ້ມີຕົວພິມໃຫຍ່ ແລະ ຕົວພິມນ້ອຍ</p>
              <p>• ແນະນຳໃຫ້ມີຕົວເລກ ແລະ ສັນຍາລັກພິເສດ</p>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ຢືນຢັນລະຫັດຜ່ານໃໝ່ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="ໃສ່ລະຫັດຜ່ານໃໝ່ອີກຄັ້ງ"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
            
            {formData.confirmPassword && formData.newPassword && (
              <div className="mt-2 flex items-center">
                {formData.newPassword === formData.confirmPassword ? (
                  <span className="text-xs text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    ລະຫັດຜ່ານກົງກັນ
                  </span>
                ) : (
                  <span className="text-xs text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    ລະຫັດຜ່ານບໍ່ກົງກັນ
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
                setErrors({});
                setMessage({ type: '', text: '' });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ກຳລັງດຳເນີນການ...
                </>
              ) : (
                <>
                  <KeyIcon className="h-4 w-4 mr-2" />
                  ປ່ຽນລະຫັດຜ່ານ
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">
          💡 ຄຳແນະນຳດ້ານຄວາມປອດໄພ
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• ຢ່າແບ່ງປັນລະຫັດຜ່ານຂອງທ່ານກັບຜູ້ອື່ນ</li>
          <li>• ປ່ຽນລະຫັດຜ່ານເປັນປະຈຳເພື່ອຄວາມປອດໄພ</li>
          <li>• ຫ້າມໃຊ້ລະຫັດຜ່ານຊ້ຳກັນໃນຫຼາຍລະບົບ</li>
          <li>• ໃຊ້ລະຫັດຜ່ານທີ່ຊັບຊ້ອນ ແລະ ຍາກຕໍ່ການຄາດເດົາ</li>
        </ul>
      </div>
    </div>
  );
};

export default ChangePassword;