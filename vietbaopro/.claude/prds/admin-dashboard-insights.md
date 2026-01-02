# PRD: Admin Dashboard Insights

## Overview

**Feature Name:** Admin Dashboard Insights  
**Created:** 2026-01-02  
**Status:** Draft  
**Priority:** High  

### Problem Statement

Dashboard admin hiện tại thiếu thông tin insight về người dùng và không highlight được những việc cần xử lý ngay. Admin phải navigate qua nhiều trang để hiểu được tình hình business.

### Vision

Một dashboard thông minh cho phép admin nắm bắt tình hình business trong **5 giây đầu tiên**, biết ngay **cần làm gì tiếp theo**, và theo dõi được **trend growth** theo thời gian.

---

## Goals & Success Metrics

### 🎯 Primary Goals

1. **Tổng quan nhanh** - Admin nhìn là hiểu ngay tình hình trong 5 giây
2. **Action-oriented** - Biết ngay có bao nhiêu việc cần xử lý và navigate nhanh
3. **Data-driven** - Theo dõi trend doanh thu, khách hàng theo thời gian

### 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Time to understand business status | < 5 seconds |
| Click to action from dashboard | 1 click |
| Daily admin engagement | 2+ visits/day |

---

## User Stories

### As an Admin, I want to...

1. **See revenue overview** so that I know business performance at a glance
   - Doanh thu hôm nay vs hôm qua
   - Doanh thu tuần này vs tuần trước
   - Doanh thu tháng này vs tháng trước

2. **See order metrics** so that I can track sales activity
   - Số đơn hàng mới
   - Số đơn chờ xác nhận
   - Tỷ lệ chuyển đổi (checkout → purchase)

3. **See customer insights** so that I understand my audience
   - Khách hàng mới đăng ký (hôm nay/tuần/tháng)
   - Phân bố khách theo stage (Pipeline funnel)
   - Khách hàng hoạt động gần đây

4. **See action items** so that I know what needs immediate attention
   - Đơn hàng chờ xác nhận thanh toán (với link → /admin/orders?status=pending)
   - Hot leads chưa liên hệ (với link → /admin/pipeline?stage=hot_lead)
   - Khách bỏ checkout (với link → /admin/pipeline?stage=prospect)
   - Email đang chờ gửi (với link → /admin/emails)

---

## Feature Specifications

### Section 1: Revenue & Conversion Cards

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 💰 DOANH THU    │ │ 📦 ĐƠN HÀNG     │ │ 📈 CHUYỂN ĐỔI   │ │ 💵 GIÁ TRỊ TB   │
│                 │ │                 │ │                 │ │                 │
│ 12,500,000 ₫    │ │ 8 đơn           │ │ 4.2%            │ │ 1,562,500 ₫     │
│ ▲ +23% vs tuần  │ │ ▲ +2 vs hôm qua │ │ ▲ +0.5% vs tuần │ │ ▼ -5% vs tuần   │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Data Sources:**
- `orders` table: sum(final_price), count(*)
- `customer_pipeline` table: conversion calculation
- Time periods: today, this_week, this_month with comparison

### Section 2: Customer Insights

```
┌─────────────────────────────────────┐ ┌─────────────────────────────────────┐
│ 👥 KHÁCH HÀNG MỚI                   │ │ 📊 PHÂN BỐ PIPELINE                 │
│                                     │ │                                     │
│ Hôm nay: 5    Tuần này: 32         │ │ Visitor   ████████████████  120     │
│ Tháng này: 145  ▲ +18% vs tháng    │ │ Lead      ██████████        65      │
│                                     │ │ Prospect  ██████            35      │
│                                     │ │ Hot Lead  ████              20      │
│                                     │ │ Customer  ████████          45      │
└─────────────────────────────────────┘ └─────────────────────────────────────┘
```

**Data Sources:**
- `profiles` table: count by created_at
- `customer_pipeline` table: group by stage

### Section 3: Action Items (Cần Xử Lý)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ CẦN XỬ LÝ NGAY                                                          │
│                                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ 📦 Chờ XN   │ │ 🔥 Hot Lead │ │ 🛒 Bỏ CKO   │ │ ✉️ Email    │            │
│ │             │ │             │ │             │ │             │            │
│ │     3       │ │     8       │ │     12      │ │     25      │            │
│ │     →       │ │     →       │ │     →       │ │     →       │            │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Mỗi card hiển thị số tổng
- Icon → (arrow) navigate đến trang liên quan
- Số > 0 thì highlight màu warning
- Số = 0 thì màu success (đã xử lý hết)

**Navigation Links:**
| Card | Link |
|------|------|
| Chờ xác nhận | `/admin/orders?status=pending_payment` |
| Hot Leads | `/admin/pipeline?stage=hot_lead` |
| Bỏ checkout | `/admin/pipeline?stage=prospect` |
| Email chờ | `/admin/emails` |

### Section 4: Recent Activity Timeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📋 HOẠT ĐỘNG GẦN ĐÂY                                                        │
│                                                                             │
│ • 10:05 - Nguyễn Văn A đã mua khóa "Content AI"          💰 2,500,000 ₫    │
│ • 09:42 - Trần Thị B đăng ký tài khoản mới               👤                │
│ • 09:30 - Lê Văn C tải tài nguyên "Prompt Template"      📥                │
│ • 08:15 - Phạm Thị D xem checkout nhưng chưa thanh toán  🔥                │
│                                                                             │
│ [Xem tất cả]                                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Data Source:**
- `customer_events` table: latest 10 events

---

## Technical Requirements

### API Endpoints Needed

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/dashboard/stats` | GET | Revenue, orders, conversion stats |
| `/api/admin/dashboard/customers` | GET | Customer insights |
| `/api/admin/dashboard/actions` | GET | Action items counts |
| `/api/admin/dashboard/activity` | GET | Recent activity timeline |

### Database Queries

1. **Revenue Stats:**
   ```sql
   SELECT 
     SUM(CASE WHEN created_at >= TODAY THEN final_price END) as today_revenue,
     SUM(CASE WHEN created_at >= THIS_WEEK THEN final_price END) as week_revenue,
     COUNT(*) as order_count
   FROM orders 
   WHERE status = 'completed'
   ```

2. **Pipeline Distribution:**
   ```sql
   SELECT stage, COUNT(*) as count 
   FROM customer_pipeline 
   GROUP BY stage
   ```

3. **Action Items:**
   ```sql
   -- Pending orders
   SELECT COUNT(*) FROM orders WHERE status = 'pending_payment'
   
   -- Hot leads
   SELECT COUNT(*) FROM customer_pipeline WHERE stage = 'hot_lead'
   
   -- Cart abandonment
   SELECT COUNT(*) FROM customer_pipeline WHERE stage = 'prospect'
   
   -- Pending emails
   SELECT COUNT(*) FROM email_queue WHERE status = 'pending'
   ```

---

## UI/UX Requirements

### Design Principles

1. **Card-based layout** - Mỗi metric một card riêng
2. **Color coding:**
   - 🟢 Green: Positive trend (▲)
   - 🔴 Red: Negative trend (▼)
   - 🟠 Orange: Needs attention (action items > 0)
3. **Responsive** - Grid 4 cols → 2 cols → 1 col
4. **Real-time feel** - Refresh data mỗi 30 giây (optional)

### Visual Hierarchy

1. **Primary (Top):** Revenue & Conversion cards
2. **Secondary:** Customer insights + Pipeline chart
3. **Tertiary:** Action items với navigation
4. **Supporting:** Recent activity timeline

---

## Out of Scope (v1)

- Charts/graphs phức tạp (line chart, bar chart)
- Export data to CSV
- Date range picker custom
- Real-time WebSocket updates
- Email/notification alerts

---

## Acceptance Criteria

- [ ] Dashboard loads trong < 2 giây
- [ ] Tất cả số liệu chính xác với database
- [ ] Action items có số đếm đúng
- [ ] Navigation hoạt động đến đúng trang với filter
- [ ] Responsive trên mobile/tablet
- [ ] Trend comparison (vs yesterday/last week) hiển thị đúng

---

## Dependencies

- Existing tables: `orders`, `profiles`, `customer_pipeline`, `customer_events`, `email_queue`
- No new database tables needed
- No external APIs needed

---

## Timeline Estimate

| Phase | Duration |
|-------|----------|
| API Development | 2-3 hours |
| Frontend Components | 3-4 hours |
| Styling & Polish | 1-2 hours |
| Testing | 1 hour |
| **Total** | **7-10 hours** |

---

## Appendix

### Current Dashboard State
- Chỉ hiển thị summary cards cơ bản
- Không có trend comparison
- Không có action items
- Không có activity timeline

### Mockup Reference
(To be added after design approval)
