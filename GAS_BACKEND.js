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
const SPREADSHEET_ID = ''; // DÁN ID CỦA GOOGLE SHEET VÀO ĐÂY NẾU BẠN DÙNG SCRIPT RỜI (STANDALONE)

/**
 * Định nghĩa cấu trúc bảng (Schema)
 * Nếu bạn thêm trường mới vào đây, script sẽ tự động chèn thêm cột vào Sheet.
 */
const SCHEMA = {
  'Users': ['Email', 'PasswordHash', 'Role', 'Subscription', 'SubscriptionExpiry', 'CreatedAt', 'LastLogin'],
  'Payments': ['TransferCode', 'Email', 'PackageId', 'Amount', 'Status', 'CreatedAt', 'ApprovedAt', 'Note'],
  'UsageLogs': ['Email', 'Action', 'Timestamp', 'Details'] // Tự động sinh thêm bảng log nếu cần
};

/**
 * Hàm hỗ trợ lấy Spreadsheet an toàn
 */
function getSS() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss && SPREADSHEET_ID) {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      throw new Error("ID Spreadsheet không hợp lệ hoặc bạn không có quyền truy cập.");
    }
  }
  if (!ss) {
    throw new Error("LỖI: Không tìm thấy Spreadsheet. \nCách sửa: \n1. Mở Google Sheet của bạn -> Tiện ích mở rộng -> Apps Script và dán code vào đó. \n2. Hoặc copy ID của Sheet dán vào biến SPREADSHEET_ID ở dòng 15.");
  }
  return ss;
}

/**
 * Tự động kiểm tra và cập nhật cấu trúc các Sheet
 */
function syncSchema() {
  const ss = getSS();
  for (let sheetName in SCHEMA) {
    let sheet = ss.getSheetByName(sheetName);
    const requiredHeaders = SCHEMA[sheetName];
    
    if (!sheet) {
      // Tạo sheet mới nếu chưa có
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(requiredHeaders);
      
      // Nếu là bảng Users, tạo luôn Admin mặc định
      if (sheetName === 'Users') {
        sheet.appendRow([ADMIN_EMAIL, hashSHA256(ADMIN_PASS), 'admin', 'yearly', '2099-12-31', new Date().toISOString(), '']);
      }
    } else {
      // Kiểm tra và bổ sung cột thiếu
      const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
      requiredHeaders.forEach(header => {
        if (currentHeaders.indexOf(header) === -1) {
          sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
        }
      });
    }
  }
}

function setup() {
  syncSchema();
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
    // Tự động đồng bộ cấu trúc trước khi xử lý
    syncSchema();
    
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
    } else if (action === 'getPendingPayments') {
      result = getPendingPayments();
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("ScholarAI Backend is running. Schema is synced.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function getSheetData(sheetName) {
  const ss = getSS();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

function registerUser(email, password) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Users');
  const users = getSheetData('Users');
  
  if (users.find(u => u.Email === email)) {
    return { success: false, message: 'Email đã tồn tại' };
  }
  
  // Lấy danh sách header để đảm bảo thứ tự cột
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = headers.map(h => {
    if (h === 'Email') return email;
    if (h === 'PasswordHash') return hashSHA256(password);
    if (h === 'Role') return 'user';
    if (h === 'Subscription') return 'free';
    if (h === 'CreatedAt') return new Date().toISOString();
    return '';
  });
  
  sheet.appendRow(newRow);
  return { success: true, message: 'Đăng ký thành công', user: { email, role: 'user', subscription: 'free' } };
}

function loginUser(email, password) {
  const users = getSheetData('Users');
  const hashedPass = hashSHA256(password);
  
  const user = users.find(u => u.Email === email && u.PasswordHash === hashedPass);
  
  if (user) {
    // Cập nhật LastLogin
    const ss = getSS();
    const sheet = ss.getSheetByName('Users');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const lastLoginIdx = headers.indexOf('LastLogin');
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === email) {
        sheet.getRange(i + 1, lastLoginIdx + 1).setValue(new Date().toISOString());
        break;
      }
    }

    return { 
      success: true, 
      user: { 
        email: user.Email, 
        role: user.Role, 
        subscription: user.Subscription,
        subscriptionExpiry: user.SubscriptionExpiry
      } 
    };
  }
  return { success: false, message: 'Email hoặc mật khẩu không đúng' };
}

function forgotPassword(email) {
  const ss = getSS();
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const passIdx = headers.indexOf('PasswordHash');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      const newPass = generateRandomPassword();
      sheet.getRange(i + 1, passIdx + 1).setValue(hashSHA256(newPass));
      
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
  const ss = getSS();
  const sheet = ss.getSheetByName('Payments');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const newRow = headers.map(h => {
    if (h === 'TransferCode') return transferCode;
    if (h === 'Email') return email;
    if (h === 'PackageId') return packageId;
    if (h === 'Amount') return amount;
    if (h === 'Status') return 'pending';
    if (h === 'CreatedAt') return new Date().toISOString();
    return '';
  });
  
  sheet.appendRow(newRow);
  
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

function getPendingPayments() {
  const payments = getSheetData('Payments');
  return payments.filter(p => p.Status === 'pending').map(p => ({
    transferCode: p.TransferCode,
    email: p.Email,
    packageId: p.PackageId,
    amount: p.Amount,
    status: p.Status,
    createdAt: p.CreatedAt
  }));
}

function approvePayment(adminEmail, adminPass, transferCode) {
  const loginRes = loginUser(adminEmail, adminPass);
  if (!loginRes.success || loginRes.user.role !== 'admin') {
    return { success: false, message: 'Không có quyền truy cập' };
  }

  const ss = getSS();
  const paySheet = ss.getSheetByName('Payments');
  const payData = paySheet.getDataRange().getValues();
  const payHeaders = payData[0];
  const statusIdx = payHeaders.indexOf('Status');
  const approvedAtIdx = payHeaders.indexOf('ApprovedAt');
  
  let paymentFound = false;
  let userEmail = '';
  let packageId = '';
  
  for (let i = 1; i < payData.length; i++) {
    if (payData[i][0] === transferCode && payData[i][statusIdx] === 'pending') {
      paySheet.getRange(i + 1, statusIdx + 1).setValue('approved');
      paySheet.getRange(i + 1, approvedAtIdx + 1).setValue(new Date().toISOString());
      userEmail = payData[i][1];
      packageId = payData[i][2];
      paymentFound = true;
      break;
    }
  }
  
  if (!paymentFound) return { success: false, message: 'Không tìm thấy giao dịch hoặc đã được duyệt' };
  
  const userSheet = ss.getSheetByName('Users');
  const userData = userSheet.getDataRange().getValues();
  const userHeaders = userData[0];
  const subIdx = userHeaders.indexOf('Subscription');
  const expiryIdx = userHeaders.indexOf('SubscriptionExpiry');
  
  for (let i = 1; i < userData.length; i++) {
    if (userData[i][0] === userEmail) {
      let currentExpiry = userData[i][expiryIdx];
      let expiryDate = new Date();
      
      if (currentExpiry && new Date(currentExpiry) > new Date()) {
        expiryDate = new Date(currentExpiry);
      }
      
      if (packageId === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (packageId === 'yearly') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }
      
      userSheet.getRange(i + 1, subIdx + 1).setValue(packageId);
      userSheet.getRange(i + 1, expiryIdx + 1).setValue(expiryDate.toISOString());
      
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
