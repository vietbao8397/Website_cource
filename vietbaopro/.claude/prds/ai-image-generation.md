# PRD: AI Image Generation

## Overview

**Feature Name:** AI Image Generation  
**Created:** 2026-01-02  
**Status:** Draft  
**Priority:** High  

### Problem Statement

Admin hiện tại phải tìm kiếm và upload ảnh thủ công cho khóa học và blog. Điều này tốn thời gian và đôi khi khó tìm được ảnh phù hợp với nội dung.

### Vision

Tích hợp Google AI (Gemini) để Admin có thể tạo ảnh thumbnail cho khóa học và ảnh minh họa cho blog chỉ bằng cách mô tả bằng text.

---

## Goals & Success Metrics

### 🎯 Primary Goals

1. **Nhanh chóng** - Tạo ảnh trong vài giây thay vì tìm kiếm hàng giờ
2. **Phù hợp** - Ảnh được tạo theo đúng mô tả, phong cách nhất quán
3. **Tiết kiệm** - Không cần mua stock photos

### 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Time to create image | < 30 seconds |
| Admin satisfaction | 80%+ images used |
| Cost per image | < $0.01 |

---

## User Stories

### As an Admin, I want to...

1. **Generate course thumbnail** từ mô tả text để tiết kiệm thời gian tìm ảnh
2. **Generate blog illustration** phù hợp với nội dung bài viết
3. **Preview and regenerate** nếu ảnh chưa đúng ý
4. **Download generated image** để sử dụng ở nơi khác
5. **Save to library** để dùng lại sau

---

## Feature Specifications

### 1. Trang AI Image Generator (`/admin/ai-images`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎨 AI Image Generator                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Mô tả ảnh bạn muốn tạo:                                                │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ A modern digital marketing workspace with AI robots, dark theme,   │ │ │
│ │ │ neon accents, professional photography style                        │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ Style: [Realistic ▼]  Size: [1024x1024 ▼]  [🎨 Tạo ảnh]                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ KẾT QUẢ                                                                     │
│                                                                             │
│ ┌─────────────────┐                                                        │
│ │                 │  Prompt: "A modern digital marketing..."              │
│ │   [Generated    │  Created: 2 phút trước                                │
│ │     Image]      │                                                        │
│ │                 │  [💾 Download]  [🗑️ Xóa]  [🔄 Tạo lại]               │
│ └─────────────────┘                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Quick Generate Button trong Course/Blog Editor

```
Thumbnail: [Chọn ảnh ▼] [🎨 Tạo bằng AI]
```

Khi click "Tạo bằng AI", mở modal với form tạo ảnh nhanh.

---

## Technical Architecture

### Google AI API

**Option 1: Gemini Pro Vision + Imagen**
- Gemini không trực tiếp tạo ảnh, cần dùng Imagen API
- Imagen đang trong preview, cần đăng ký

**Option 2: Gemini + External Image API**
- Dùng Gemini để enhance prompt
- Dùng Replicate/Stability AI để tạo ảnh

**Recommendation:** Sử dụng **Replicate API** với model **SDXL** vì:
- Dễ tích hợp, có free tier
- Chất lượng cao, nhiều style
- Cost thấp (~$0.003/image)

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/ai/generate-image` | POST | Tạo ảnh từ prompt |
| `/api/admin/ai/images` | GET | Lấy danh sách ảnh đã tạo |
| `/api/admin/ai/images/[id]` | DELETE | Xóa ảnh |

### Database Schema

```sql
CREATE TABLE generated_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt TEXT NOT NULL,
    style VARCHAR(50),
    image_url TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## UI Components

### 1. ImageGenerator Page
- Textarea for prompt
- Style selector (Realistic, Artistic, Minimal, etc.)
- Size selector (1024x1024, 1792x1024, etc.)
- Generate button
- Results grid with actions

### 2. ImageGeneratorModal
- Compact version for use in Course/Blog editors
- Same functionality, modal format

---

## Environment Variables

```
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxx
```

---

## Acceptance Criteria

- [ ] Admin có thể truy cập trang `/admin/ai-images`
- [ ] Nhập prompt và tạo ảnh thành công
- [ ] Ảnh được lưu và hiển thị trong lịch sử
- [ ] Có thể download ảnh
- [ ] Có thể xóa ảnh
- [ ] Loading state và error handling hoạt động
- [ ] Chỉ Admin mới có quyền truy cập

---

## Timeline Estimate

| Phase | Duration |
|-------|----------|
| API Integration | 2-3 hours |
| UI Components | 2-3 hours |
| Testing & Polish | 1 hour |
| **Total** | **5-7 hours** |

---

## Dependencies

- Replicate API account (free tier available)
- Supabase storage for saving images (optional)

---

## Out of Scope (v1)

- Image editing/cropping
- Batch generation
- Style training/customization
- Integration with stock photo sites
