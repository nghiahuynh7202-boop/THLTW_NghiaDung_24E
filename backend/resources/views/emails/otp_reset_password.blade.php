<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Mã OTP đặt lại mật khẩu</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 20px;
      color: #334155;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #B83A63 0%, #881e42 100%);
      color: #ffffff;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 28px 24px;
      text-align: center;
    }
    .otp-box {
      margin: 24px auto;
      padding: 16px 24px;
      background: #fdf2f8;
      border: 2px dashed #f472b6;
      border-radius: 12px;
      display: inline-block;
    }
    .otp-code {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #B83A63;
      font-family: 'Courier New', Courier, monospace;
    }
    .note {
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
      text-align: left;
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 14px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌸 HOA YÊU THƯƠNG</h1>
    </div>

    <div class="content">
      <h2 style="font-size: 17px; color: #1e293b; margin-top: 0;">YÊU CẦU ĐẶT LẠI MẬT KHẨU</h2>
      <p style="font-size: 13px; color: #475569; line-height: 1.5; margin: 0 0 16px;">
        Xin chào <strong>{{ $name }}</strong>,<br/>
        Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Dưới đây là mã xác thực OTP của bạn:
      </p>

      <div class="otp-box">
        <div class="otp-code">{{ $otp }}</div>
      </div>

      <div class="note">
        <strong>⚠️ Lưu ý bảo mật:</strong>
        <ul style="margin: 4px 0 0; padding-left: 18px;">
          <li>Mã OTP này có hiệu lực trong vòng <strong>15 phút</strong>.</li>
          <li>Tuyệt đối không chia sẻ mã này cho bất kỳ ai, kể cả nhân viên hỗ trợ của shop.</li>
          <li>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      Shop Hoa Yêu Thương — Hệ thống đặt hoa tươi trực tuyến uy tín
    </div>
  </div>
</body>
</html>
