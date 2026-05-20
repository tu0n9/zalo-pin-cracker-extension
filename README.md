# Browser Extension Security PoC: DOM Extraction & Hash Analysis

Dự án này là một Proof of Concept (PoC) được phát triển cho mục đích nghiên cứu An toàn thông tin (Security Research) và Giáo dục. 
Mục tiêu của dự án là minh họa cách các tiện ích mở rộng (Browser Extensions) có thể lợi dụng quyền hạn để truy cập DOM, trích xuất dữ liệu nhạy cảm và phân tích độ an toàn của các thuật toán băm (hashing) yếu.

> ** Tuyên bố miễn trừ trách nhiệm (Disclaimer):** > Công cụ và mã nguồn trong repository này chỉ được sử dụng trong các môi trường thử nghiệm trên các ứng dụng do chính người dùng sở hữu. Tuyệt đối không sử dụng cho các mục đích thu thập dữ liệu trái phép hoặc kiểm thử hệ thống khi chưa có sự đồng ý. Người dùng tự chịu trách nhiệm cho mọi hành vi của mình.

##  Mục tiêu nghiên cứu

Dự án mô phỏng và làm rõ hai rủi ro bảo mật chính trong phát triển ứng dụng Web & Extension:
1. **DOM/Storage Access:** Phân tích cách một Extension có thể đọc được dữ liệu nhạy cảm (như mã PIN giả định) được nhập trên trình duyệt hoặc trích xuất Cookie từ Local Storage/Session.
2. **Hash Brute-force Mechanics:** Minh họa cách một kẻ tấn công có thể khôi phục lại mã PIN gốc (thường là 4-6 số) nếu hệ thống sử dụng thuật toán băm yếu (VD: MD5, SHA-1) không có Salt, thông qua phương pháp Brute-force cục bộ.

##  Cơ chế hoạt động (Mô phỏng)

1. **Content Script Injection:** Extension nhúng một script vào trang web mục tiêu (môi trường Lab).
2. **Data Extraction:** Lắng nghe các sự kiện nhập liệu trên trường (input field) hoặc đọc cookie quản lý phiên (Session Cookie).
3. **Hash Generation & Analysis:** Băm dữ liệu thu thập được và đưa vào module Brute-force để đối chiếu, từ đó tìm ra chuỗi ký tự gốc.
4. **Dashboard Integration (Tùy chọn):** Dữ liệu PoC được gửi về một Local API Dashboard để minh họa trực quan quá trình thu thập.

## Khuyến nghị bảo mật (Mitigation)

Dựa trên PoC này, các nhà phát triển Web có thể áp dụng các biện pháp phòng chống sau:
* **Sử dụng thuật toán băm an toàn:** Sử dụng `bcrypt`, `Argon2` hoặc `PBKDF2` kết hợp với **Salt** độc nhất cho mỗi người dùng thay vì MD5/SHA-1 để chống lại Brute-force và Rainbow Tables.
* **Bảo vệ Cookie:** Luôn set cờ `HttpOnly` và `Secure` cho các Session Cookies quan trọng để ngăn chặn Content Scripts của Extension/XSS đọc được dữ liệu qua `document.cookie`.
* **Cơ chế chống Brute-force:** Áp dụng Rate Limiting (giới hạn số lần thử) và Account Lockout (khóa tài khoản tạm thời) trên phía Server.

## 🛠️ Công nghệ sử dụng
* JavaScript / HTML / CSS (Cấu trúc Extension cơ bản)
* Thuật toán: Minh họa Brute-force logic.
* Tích hợp: RESTful API (giao tiếp với Dashboard quản lý PoC).
