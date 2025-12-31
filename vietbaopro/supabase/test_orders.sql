-- Insert 5 test orders with pending status
-- These orders will use your actual user_id and existing courses

-- First, get your user_id and course_id for reference
-- Run this to see available data:
-- SELECT id, email FROM profiles LIMIT 5;
-- SELECT id, title, slug FROM courses;

-- Insert 5 pending orders for testing
-- Replace the user_id below with your actual user ID if needed

INSERT INTO public.orders (user_id, course_id, amount, status, payment_method, customer_name, customer_email, customer_phone)
SELECT 
    p.id as user_id,
    c.id as course_id,
    CASE 
        WHEN c.sale_price IS NOT NULL THEN c.sale_price
        ELSE c.price
    END as amount,
    'pending' as status,
    'bank_transfer' as payment_method,
    test_customer.name as customer_name,
    test_customer.email as customer_email,
    test_customer.phone as customer_phone
FROM 
    (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1) p,
    (SELECT id, price, sale_price FROM courses WHERE status = 'published' LIMIT 1) c,
    (VALUES 
        ('Nguyễn Văn An', 'nguyenvanan@gmail.com', '0901111111'),
        ('Trần Thị Bình', 'tranthibinh@gmail.com', '0902222222'),
        ('Lê Hoàng Cường', 'lehoangcuong@gmail.com', '0903333333'),
        ('Phạm Minh Đức', 'phamminhduc@gmail.com', '0904444444'),
        ('Hoàng Thu Hà', 'hoangthuha@gmail.com', '0905555555')
    ) AS test_customer(name, email, phone);

-- Check results
SELECT id, customer_name, customer_email, amount, status, created_at 
FROM orders 
WHERE status = 'pending'
ORDER BY created_at DESC;
