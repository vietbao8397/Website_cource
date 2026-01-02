# PRD: AI Support Chatbot (Support Bot)

## Overview

**Feature Name:** AI Support Bot  
**Created:** 2026-01-02  
**Status:** Draft  
**Priority:** High  

### Problem Statement

Học viên thường gặp khó khăn hoặc có thắc mắc trong quá trình học nhưng không phải lúc nào cũng có nhân viên hỗ trợ ngay lập tức (24/7). Các câu hỏi thường lặp đi lặp lại (FAQ).

### Vision

Xây dựng một Chatbot AI thông minh (sử dụng Google Gemini) hiển thị dưới dạng Widget trên website, có khả năng trả lời các câu hỏi chung, hướng dẫn kỹ thuật, và giải đáp thắc mắc về nội dung khóa học dựa trên dữ liệu đã được huấn luyện (RAG).

---

## Goals & Success Metrics

### 🎯 Primary Goals

1.  **Instant Support:** Phản hồi ngay lập tức các thắc mắc của học viên.
2.  **Giảm tải Support:** Tự động xử lý 70-80% các câu hỏi thường gặp (FAQ).
3.  **Context-aware:** Hiểu bối cảnh khóa học để trả lời chính xác.

### 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Response time | < 3 seconds |
| Resolution rate (không cần human) | > 70% |
| User satisfaction (Thumbs up) | > 80% |

---

## User Stories

### As a Student, I want to...

1.  **Ask Questions:** Hỏi về lộ trình, giá khóa học, cách thanh toán.
2.  **Tech Support:** Hỏi cách lấy lại mật khẩu, lỗi không xem được video.
3.  **Course Content:** Hỏi về các khái niệm trong bài học (nếu bot được train).
4.  **Receive Instant Answers:** Nhận câu trả lời ngay lập tức mà không cần chờ email.

### As an Admin, I want to...

1.  **Train Knowledge Base:** Thêm các tài liệu FAQ, nội dung khóa học để bot "học".
2.  **View Chat Logs:** Xem lịch sử chat để hiểu nhu cầu học viên.

---

## Feature Specifications

### 1. Chat Widget (Floating)
- Icon nổi ở góc dưới phải màn hình.
- Click mở cửa sổ chat.
- UI: Header, Message List, Input area.

### 2. AI Processing (Google Gemini)
- Sử dụng mô hình `gemini-1.5-flash`.
- **Persona:**
  - Tên: **Sophia**.
  - Giới tính: Nữ.
  - Tính cách: Thân thiện, vui vẻ, luôn "dạ/thưa", sử dụng từ ngữ cảm thán và ngôn ngữ tự nhiên (Vd: "dạ nè", "hông được", "ấy ạ :((", "^^").

### 3. Logic Phân Quyền & Knowledge Base
Hệ thống sẽ kiểm tra trạng thái người dùng để chọn chế độ trả lời:

**A. Khách vãng lai / User chưa mua khóa học:**
- **Mục tiêu:** Consultant & Sales.
- **Behavior:**
  - Trả lời nhiệt tình nhưng chỉ ở mức tóm tắt/sơ lược.
  - Không đi sâu vào kiến thức chuyên môn (RAG).
  - Luôn khéo léo điều hướng người dùng mua khóa học để được học chi tiết và nâng cao trải nghiệm.
  - Vd: "Dạ kiến thức này chuyên sâu lắm á, trong khóa học bên em có bài giảng chi tiết về phần này luôn nè. Anh/Chị đăng ký để Sophia hỗ trợ mình tốt hơn nha ^^"

**B. Học viên (Đã mua khóa học):**
- **Mục tiêu:** Tutor & Support.
- **Behavior:**
  - Trả lời chi tiết, chuyên sâu dựa trên RAG.
  - Giải thích cặn kẽ các concept.
  - Hỗ trợ tối đa để học viên hiểu bài.

---

## UI/UX Design

### Widget State
- **Collapsed:** Icon bong bóng chat với avatar Sophia (Nữ, thân thiện).
- **Expanded:**
    - Header: "Sophia - Trợ lý ảo Vietbaopro" + Nút đóng.
    - Body:
        - Welcome message: "Dạ Sophia chào anh/chị ạ! Em có thể giúp gì cho việc học của mình hôm nay hông nè? ^^"
        - Suggested questions (Dynamic theo role).
    - Input: Text area + Nút gửi.

---

## Technical Architecture

### API Endpoint
- `/api/chat/send`: POST
    - Logic:
        1. Check Auth & Purchase Status của User.
        2. Chọn System Prompt tương ứng (Sales Mode vs Tutor Mode).
        3. Combine với Knowledge Base.
        4. Gọi Gemini API.

### System Prompt Structure (Sophia Persona)
```text
Role: Bạn là Sophia, trợ lý ảo đáng yêu của Vietbaopro.
Personality:
- Giới tính: Nữ.
- Tone: Vui vẻ, lịch sự (dạ/thưa), dùng emotion icon ^^ :(, ngôn ngữ nói tự nhiên (hông, nè, á).
- Luôn đồng cảm với khó khăn của khách hàng.

Context & Rules:
[IF GUEST]:
- Giải thích ngắn gọn, easy-to-understand.
- CTA: Gợi ý mua khóa học một cách tự nhiên.
- "Dạ cái này trong khóa Pro thầy dạy kỹ lắm ạ..."

[IF STUDENT]:
- Giải thích chuyên sâu, academic nhưng vẫn giữ giọng văn thân thiện.
- Sử dụng tối đa kiến thức trong Knowledge Base.
```

---

## Acceptance Criteria

- [ ] Widget hiển thị trên tất cả các trang (hoặc trang chỉ định).
- [ ] Chat mượt mà, loading state rõ ràng.
- [ ] Bot trả lời đúng các thông tin cơ bản (Giá, Contact).
- [ ] Bot biết từ chối các câu hỏi không liên quan.
- [ ] Giao diện Responsive trên Mobile.

---

## Development Plan

1.  **Setup API:** `/api/chat` với Gemini Client.
2.  **Create UI:** Component `ChatWidget`.
3.  **Integrate:** Gắn Widget vào `layout.tsx`.
4.  **Prompt Engineering:** Tối ưu System Prompt.
