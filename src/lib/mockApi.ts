import { useState, useEffect } from 'react';

// Hybrid implementation: Uses GAS Backend if URL is configured, otherwise falls back to localStorage mock

const ADMIN_EMAIL = 'phamhuyspy@gmail.com';
const ADMIN_PASS_HASH = '123456'; // Simplified for mock

const getGasUrl = () => localStorage.getItem('GAS_WEB_APP_URL');

const callGasApi = async (data: any) => {
  const url = getGasUrl();
  if (!url) return null;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error("GAS API Error:", error);
    throw new Error("Lỗi kết nối đến Google Apps Script. Vui lòng kiểm tra lại URL trong phần Cài đặt.");
  }
};

export const useMockApi = () => {
  useEffect(() => {
    // Initialize mock DB
    if (!localStorage.getItem('mock_users')) {
      const initialUsers = [
        {
          email: ADMIN_EMAIL,
          password: ADMIN_PASS_HASH,
          role: 'admin',
          subscription: 'yearly',
          subscriptionExpiry: '2099-12-31T00:00:00.000Z'
        }
      ];
      localStorage.setItem('mock_users', JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem('mock_payments')) {
      localStorage.setItem('mock_payments', JSON.stringify([]));
    }
  }, []);

  const register = async (email: string, password: string) => {
    const gasRes = await callGasApi({ action: 'register', email, password });
    if (gasRes) return gasRes;

    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        if (users.find((u: any) => u.email === email)) {
          resolve({ success: false, message: 'Email đã tồn tại' });
          return;
        }
        const newUser = { email, password, role: 'user', subscription: 'free', subscriptionExpiry: '' };
        users.push(newUser);
        localStorage.setItem('mock_users', JSON.stringify(users));
        resolve({ success: true, user: newUser });
      }, 500);
    });
  };

  const login = async (email: string, password: string) => {
    const gasRes = await callGasApi({ action: 'login', email, password });
    if (gasRes) return gasRes;

    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const user = users.find((u: any) => u.email === email && u.password === password);
        if (user) {
          resolve({ success: true, user });
        } else {
          resolve({ success: false, message: 'Email hoặc mật khẩu không đúng' });
        }
      }, 500);
    });
  };

  const forgotPassword = async (email: string) => {
    const gasRes = await callGasApi({ action: 'forgotPassword', email });
    if (gasRes) return gasRes;

    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const userIndex = users.findIndex((u: any) => u.email === email);
        if (userIndex !== -1) {
          const newPass = Math.random().toString(36).slice(-8);
          users[userIndex].password = newPass;
          localStorage.setItem('mock_users', JSON.stringify(users));
          console.log(`[MOCK EMAIL] Sent new password ${newPass} to ${email}`);
          resolve({ success: true, message: `Mật khẩu mới đã được gửi vào email (Mật khẩu mô phỏng: ${newPass})` });
        } else {
          resolve({ success: false, message: 'Không tìm thấy email' });
        }
      }, 500);
    });
  };

  const createPayment = async (email: string, packageId: string, amount: number, transferCode: string) => {
    const gasRes = await callGasApi({ action: 'createPayment', email, packageId, amount, transferCode });
    if (gasRes) return gasRes;

    return new Promise((resolve) => {
      setTimeout(() => {
        const payments = JSON.parse(localStorage.getItem('mock_payments') || '[]');
        payments.push({
          transferCode, email, packageId, amount, status: 'pending', createdAt: new Date().toISOString()
        });
        localStorage.setItem('mock_payments', JSON.stringify(payments));
        resolve({ success: true, message: 'Đã tạo yêu cầu thanh toán' });
      }, 500);
    });
  };

  const getPendingPayments = async () => {
    // Note: If using GAS, you'd need a 'getPendingPayments' action in GAS. 
    // Since we didn't add it to GAS script initially, we'll just use mock for this list,
    // OR we can add it to the GAS script later. For now, we'll try to fetch if action exists.
    const url = getGasUrl();
    if (url) {
      try {
        const response = await fetch(url, { method: 'POST', body: JSON.stringify({ action: 'getPendingPayments' }) });
        const res = await response.json();
        if (res.success) return res.payments;
      } catch (e) {
        console.error("GAS API Error:", e);
      }
    }

    return new Promise((resolve) => {
      const payments = JSON.parse(localStorage.getItem('mock_payments') || '[]');
      resolve(payments.filter((p: any) => p.status === 'pending'));
    });
  };

  const approvePayment = async (transferCode: string) => {
    const adminEmail = ADMIN_EMAIL;
    const adminPass = ADMIN_PASS_HASH; // In real GAS, we'd need the real password.

    const gasRes = await callGasApi({ action: 'approvePayment', adminEmail, adminPass, transferCode });
    if (gasRes) return gasRes;

    return new Promise((resolve) => {
      setTimeout(() => {
        const payments = JSON.parse(localStorage.getItem('mock_payments') || '[]');
        const paymentIndex = payments.findIndex((p: any) => p.transferCode === transferCode && p.status === 'pending');
        
        if (paymentIndex !== -1) {
          const payment = payments[paymentIndex];
          payment.status = 'approved';
          localStorage.setItem('mock_payments', JSON.stringify(payments));

          const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
          const userIndex = users.findIndex((u: any) => u.email === payment.email);
          if (userIndex !== -1) {
            let expiry = new Date();
            if (users[userIndex].subscriptionExpiry) {
              const currentExpiry = new Date(users[userIndex].subscriptionExpiry);
              if (currentExpiry > expiry) expiry = currentExpiry;
            }
            
            if (payment.packageId === 'monthly') {
              expiry.setMonth(expiry.getMonth() + 1);
            } else if (payment.packageId === 'yearly') {
              expiry.setFullYear(expiry.getFullYear() + 1);
            }

            users[userIndex].subscription = payment.packageId;
            users[userIndex].subscriptionExpiry = expiry.toISOString();
            localStorage.setItem('mock_users', JSON.stringify(users));
          }
          resolve({ success: true, message: 'Đã duyệt thanh toán' });
        } else {
          resolve({ success: false, message: 'Không tìm thấy giao dịch' });
        }
      }, 500);
    });
  };

  return { register, login, forgotPassword, createPayment, getPendingPayments, approvePayment };
};
