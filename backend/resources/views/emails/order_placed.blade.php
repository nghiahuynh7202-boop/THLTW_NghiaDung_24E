<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Xác nhận đơn hàng</title>
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 20px;
      color: #334155;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #f68b1f 0%, #e65100 100%);
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
    .header p {
      margin: 6px 0 0;
      font-size: 13px;
      opacity: 0.95;
    }
    .content {
      padding: 24px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #fef3c7;
      color: #92400e;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: bold;
    }
    .box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 20px;
      font-size: 13px;
      line-height: 1.6;
    }
    .box-title {
      font-weight: bold;
      color: #0f172a;
      margin-bottom: 6px;
      text-transform: uppercase;
      font-size: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 13px;
    }
    th {
      background: #f1f5f9;
      color: #475569;
      text-align: left;
      padding: 10px;
      border-bottom: 2px solid #cbd5e1;
      font-size: 12px;
      text-transform: uppercase;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .total-row {
      font-size: 14px;
      font-weight: bold;
      color: #e65100;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌸 HOA YÊU THƯƠNG</h1>
      <p>Cảm ơn bạn đã tin tưởng đặt hoa tươi tại shop chúng tôi!</p>
    </div>

    <div class="content">
      <p style="font-size: 14px; margin-top: 0;">
        Xin chào <strong>{{ $order->name }}</strong>,
      </p>
      <p style="font-size: 13px; line-height: 1.6;">
        Đơn hàng <strong>#{{ $order->id }}</strong> của bạn đã được ghi nhận vào hệ thống lúc 
        <em>{{ $order->created_at ? $order->created_at->format('H:i d/m/Y') : date('H:i d/m/Y') }}</em>.
        Chúng tôi đang tiến hành chuẩn bị hoa và sẽ sớm liên hệ giao đến địa chỉ của bạn.
      </p>

      <!-- Thông tin nhận hàng -->
      <div class="box">
        <div class="box-title">📍 THÔNG TIN GIAO HÀNG</div>
        <div><strong>Người nhận:</strong> {{ $order->name }}</div>
        <div><strong>Số điện thoại:</strong> {{ $order->phone }}</div>
        <div><strong>Địa chỉ:</strong> {{ $order->address }}</div>
        @if(!empty($order->note))
          <div><strong>Ghi chú đơn hàng:</strong> {{ $order->note }}</div>
        @endif
        <div><strong>Phương thức thanh toán:</strong> 
          {{ in_array(strtoupper($order->payment_method), ['BANK_TRANSFER', 'QR']) ? 'Chuyển khoản VietQR (Tự động SePay)' : 'Thanh toán khi nhận hàng (COD)' }}
        </div>
        <div><strong>Trạng thái thanh toán:</strong> 
          @if((int)$order->payment_status === 1)
            <span style="color: #16a34a; font-weight: bold; background: #dcfce7; padding: 2px 8px; border-radius: 4px;">
              ✓ ĐÃ THANH TOÁN THÀNH CÔNG
            </span>
          @else
            <span style="color: #d97706; font-weight: bold; background: #fef3c7; padding: 2px 8px; border-radius: 4px;">
              Chờ thanh toán khi nhận hàng (COD)
            </span>
          @endif
        </div>
      </div>

      <!-- Bảng sản phẩm -->
      <table>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th class="text-center">Số lượng</th>
            <th class="text-right">Đơn giá</th>
            <th class="text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          @foreach($order->details as $item)
            <tr>
              <td>
                <strong>{{ $item->product->name ?? 'Sản phẩm #' . $item->product_id }}</strong>
              </td>
              <td class="text-center">{{ $item->qty }}</td>
              <td class="text-right">{{ number_format($item->price, 0, ',', '.') }}đ</td>
              <td class="text-right">{{ number_format($item->amount, 0, ',', '.') }}đ</td>
            </tr>
          @endforeach

          @if($order->discount_amount > 0)
            <tr>
              <td colspan="3" class="text-right">Giảm giá voucher:</td>
              <td class="text-right" style="color: #16a34a;">-{{ number_format($order->discount_amount, 0, ',', '.') }}đ</td>
            </tr>
          @endif

          @if($order->shipping_fee > 0)
            <tr>
              <td colspan="3" class="text-right">Phí vận chuyển:</td>
              <td class="text-right">+{{ number_format($order->shipping_fee, 0, ',', '.') }}đ</td>
            </tr>
          @endif

          <tr class="total-row">
            <td colspan="3" class="text-right">TỔNG CỘNG THANH TOÁN:</td>
            <td class="text-right" style="font-size: 16px;">{{ number_format($order->total, 0, ',', '.') }}đ</td>
          </tr>
        </tbody>
      </table>

      <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
        * Nếu bạn cần thay đổi thông tin người nhận hoặc thời gian giao hoa, vui lòng liên hệ ngay với Hotline 
        <strong style="color: #f68b1f;">028 7300 2010</strong> để được hỗ trợ nhanh nhất.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px;"><strong>SHOP HOA TƯƠI CAO CẤP HOA YÊU THƯƠNG</strong></p>
      <p style="margin: 0;">Hotline: 028 7300 2010 | Email: cskh@hoayeuthuong.com</p>
    </div>
  </div>
</body>
</html>
