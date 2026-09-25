# Wedding Invitation — single-page optimized

Web hiện chạy theo **một trang duy nhất (`index.html`)**:

1. tải trang → chỉ thấy bao thư đóng, **không có nút nhạc và không có nhạc nghe được**;
2. bấm bao thư → animation mở thư chạy;
3. trong chính thao tác bấm này, audio được khởi tạo ở mức gần như im lặng để giữ quyền phát nhạc trên mobile;
4. khi bao thư mở xong → bài nhạc bắt đầu lại từ đầu, fade-in và nút nhạc mới xuất hiện;
5. chữ `SAVE THE DATE`, tên cô dâu/chú rể và toàn bộ nội dung bên dưới hiện ra **mà không tải sang HTML khác**, vì vậy bao thư/ảnh không bị lệch và nhạc không bị reset;
6. reload/F5 → DOM trở lại trạng thái bao thư đóng như ban đầu.

`invitation.html` chỉ còn là redirect về `index.html` để các link cũ vẫn hoạt động.

## Nhạc

File mặc định:

`assets/wedding-music.mp3`

Muốn đổi bài, chỉ cần ghi đè file này bằng MP3 mới cùng tên. Nút góc phải dưới chỉ xuất hiện sau khi mở thư:
- đang phát → đĩa xoay;
- tạm dừng → đĩa đứng yên;
- nhạc loop liên tục.

## Tên cô dâu/chú rể và quà mừng

Sửa một nơi duy nhất trong `wedding-config.js`:
- tên chú rể / cô dâu;
- tên ngắn dùng trong gợi ý lời chúc;
- ngân hàng, số tài khoản, tên tài khoản;
- đường dẫn ảnh QR.

## Album

Ảnh album nằm trong `assets/album/`. Ảnh dưới màn hình dùng lazy-loading. Carousel chỉ tự chạy khi khu vực album thực sự ở trong viewport và dừng khi mở lightbox.

## RSVP + Sổ lưu bút

Frontend gọi:
- `POST /api/rsvp`
- `GET /api/wishes`
- `POST /api/wishes`

Các API Vercel chuyển tiếp đến Google Apps Script. Trên Vercel cần đặt Environment Variable:

`GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/.../exec`

Khi mở bằng `file://` trên máy, sổ lưu bút dùng localStorage để preview giao diện.

## Deploy Vercel

Project không cần build framework. Import repository vào Vercel và đặt `GOOGLE_SCRIPT_URL`. File `vercel.json` giữ cache dài hạn cho assets và `no-store` cho API.


## Preview khi chia sẻ Messenger / Zalo
- `assets/social-preview.jpg`: ảnh social preview 1200x630.
- Open Graph (`og:title`, `og:description`, `og:image`) đã được thêm trực tiếp trong `index.html`.
- Vì bot của Messenger/Zalo không chạy JavaScript, các nội dung preview phải nằm trong thẻ `<meta>` tĩnh, không đọc từ `wedding-config.js`.
- Nếu đổi tên cô dâu/chú rể hoặc ngày cưới, hãy sửa luôn các meta tương ứng trong `<head>` của `index.html`.
- Khi thay ảnh preview mà nền tảng vẫn hiện ảnh cũ, tăng `?v=1` thành `?v=2` trong URL `og:image` rồi deploy lại để tránh cache cũ.
