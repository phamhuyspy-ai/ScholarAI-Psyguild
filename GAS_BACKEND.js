/**
 * HƯỚNG DẪN CÀI ĐẶT GOOGLE APPS SCRIPT:
 * 1. Truy cập https://script.google.com/ và tạo dự án mới.
 * 2. Copy toàn bộ nội dung file này dán vào trình chỉnh sửa.
 * 3. Chạy hàm `setup()` lần đầu tiên để tạo các Sheet cần thiết và tài khoản Admin.
 * 4. Chọn Deploy (Triển khai) > New deployment (Triển khai mới).
 * 5. Chọn type là "Web app" (Ứng dụng web).
 * 6. Execute as: "Me" (Tôi).
 * 7. Who has access: "Anyone" (Bất kỳ ai).
 * 8. Copy URL Web App và dán vào phần Cài đặt trong ứng dụng React của bạn.
 */

const ADMIN_EMAIL = 'phamhuyspy@gmail.com';
const ADMIN_PASS = 'Love@7304';

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Users Sheet
  let usersSheet = ss.getSheetByName('Users');
  if (!usersSheet) {
    usersSheet = ss.insertSheet('Users');
    usersSheet.appendRow(['Email', 'PasswordHash', 'Role', 'Subscription', 'SubscriptionExpiry', 'CreatedAt']);
    usersSheet.appendRow([ADMIN_EMAIL, hashSHA256(ADMIN_PASS), 'admin', 'yearly', '2099-12-31', new Date().toISOString()]);
  }
  
  // Payments Sheet
  let paymentsSheet = ss.getSheetByName('Payments');
  if (!paymentsSheet) {
    paymentsSheet = ss.insertSheet('Payments');
    paymentsSheet.appendRow(['TransferCode', 'Email', 'PackageId', 'Amount', 'Status', 'CreatedAt', 'ApprovedAt']);
  }
}

function hashSHA256(input) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
  let txtHash = '';
  for (let i = 0; i < rawHash.length; i++) {
    let hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += '0';
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}

function generateRandomPassword() {
  return Math.random().toString(36).slice(-8);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result = { success: false, message: 'Invalid action' };

    if (action === 'register') {
      result = registerUser(data.email, data.password);
    } else if (action === 'login') {
      result = loginUser(data.email, data.password);
    } else if (action === 'forgotPassword') {
      result = forgotPassword(data.email);
    } else if (action === 'createPayment') {
      result = createPayment(data.email, data.packageId, data.amount, data.transferCode);
    } else if (action === 'approvePayment') {
      result = approvePayment(data.adminEmail, data.adminPass, data.transferCode);
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("ScholarAI Backend is running.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function registerUser(email, password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      return { success: false, message: 'Email đã tồn tại' };
    }
  }
  
  sheet.appendRow([email, hashSHA256(password), 'user', 'free', '', new Date().toISOString()]);
  return { success: true, message: 'Đăng ký thành công', user: { email, role: 'user', subscription: 'free' } };
}

function loginUser(email, password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  const hashedPass = hashSHA256(password);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email && data[i][1] === hashedPass) {
      return { 
        success: true, 
        user: { 
          email: data[i][0], 
          role: data[i][2], 
          subscription: data[i][3],
          subscriptionExpiry: data[i][4]
        } 
      };
    }
  }
  return { success: false, message: 'Email hoặc mật khẩu không đúng' };
}

function forgotPassword(email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      const newPass = generateRandomPassword();
      sheet.getRange(i + 1, 2).setValue(hashSHA256(newPass));
      
      MailApp.sendEmail({
        to: email,
        subject: "Mật khẩu mới của bạn - ScholarAI",
        body: "Mật khẩu mới của bạn là: " + newPass + "\nVui lòng đăng nhập và đổi mật khẩu nếu cần."
      });
      
      return { success: true, message: 'Mật khẩu mới đã được gửi vào email của bạn' };
    }
  }
  return { success: false, message: 'Không tìm thấy email' };
}

function createPayment(email, packageId, amount, transferCode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Payments');
  
  sheet.appendRow([transferCode, email, packageId, amount, 'pending', new Date().toISOString(), '']);
  
  // Gửi email cho admin
  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: "Yêu cầu thanh toán mới - ScholarAI",
    body: "Có một yêu cầu thanh toán mới:\n" +
          "Email: " + email + "\n" +
          "Gói: " + packageId + "\n" +
          "Số tiền: " + amount + "\n" +
          "Mã chuyển khoản: " + transferCode + "\n\n" +
          "Vui lòng kiểm tra tài khoản ngân hàng và duyệt trên hệ thống."
  });
  
  return { success: true, message: 'Đã tạo yêu cầu thanh toán' };
}

function approvePayment(adminEmail, adminPass, transferCode) {
  // Xác thực admin
  const loginRes = loginUser(adminEmail, adminPass);
  if (!loginRes.success || loginRes.user.role !== 'admin') {
    return { success: false, message: 'Không có quyền truy cập' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const paySheet = ss.getSheetByName('Payments');
  const payData = paySheet.getDataRange().getValues();
  
  let paymentFound = false;
  let userEmail = '';
  let packageId = '';
  
  for (let i = 1; i < payData.length; i++) {
    if (payData[i][0] === transferCode && payData[i][4] === 'pending') {
      paySheet.getRange(i + 1, 5).setValue('approved');
      paySheet.getRange(i + 1, 7).setValue(new Date().toISOString());
      userEmail = payData[i][1];
      packageId = payData[i][2];
      paymentFound = true;
      break;
    }
  }
  
  if (!paymentFound) return { success: false, message: 'Không tìm thấy giao dịch hoặc đã được duyệt' };
  
  // Cập nhật user
  const userSheet = ss.getSheetByName('Users');
  const userData = userSheet.getDataRange().getValues();
  
  for (let i = 1; i < userData.length; i++) {
    if (userData[i][0] === userEmail) {
      let currentExpiry = userData[i][4];
      let expiryDate = new Date();
      
      if (currentExpiry && new Date(currentExpiry) > new Date()) {
        expiryDate = new Date(currentExpiry);
      }
      
      if (packageId === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (packageId === 'yearly') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }
      
      userSheet.getRange(i + 1, 4).setValue(packageId);
      userSheet.getRange(i + 1, 5).setValue(expiryDate.toISOString());
      
      // Gửi email thông báo cho user
      MailApp.sendEmail({
        to: userEmail,
        subject: "Thanh toán thành công - ScholarAI",
        body: "Thanh toán của bạn cho gói " + packageId + " đã được xác nhận.\n" +
              "Tài khoản của bạn có hạn sử dụng đến: " + expiryDate.toLocaleDateString() + "\n\n" +
              "Cảm ơn bạn đã sử dụng dịch vụ!"
      });
      
      return { success: true, message: 'Đã duyệt thanh toán và cập nhật tài khoản' };
    }
  }
  
  return { success: false, message: 'Lỗi cập nhật user' };
}
