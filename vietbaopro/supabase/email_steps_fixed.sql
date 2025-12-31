-- ============================================
-- SAMPLE EMAIL SEQUENCE STEPS - FIXED VERSION
-- Copy this entire content and run in Supabase SQL Editor
-- ============================================

-- === WELCOME NURTURE SEQUENCE ===
-- Step 1: Gửi ngay sau khi đăng ký
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_hours, subject, content, is_active)
SELECT 
    id, 1, 0,
    '🎁 Chào mừng {{name}} - Tài nguyên của bạn đã sẵn sàng!',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #d4a574;">Xin chào {{name}}! 👋</h2>
    <p>Cảm ơn bạn đã đăng ký nhận tài nguyên miễn phí từ <strong>Vietbaopro</strong>.</p>
    <p>Tài nguyên <strong>{{resource_name}}</strong> đã được gửi kèm trong email này hoặc bạn có thể tải trực tiếp từ tài khoản của mình.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <h3>💡 Mẹo sử dụng hiệu quả:</h3>
    <ul>
        <li>Đọc qua một lượt trước khi áp dụng</li>
        <li>Thực hành ngay với dự án thực tế của bạn</li>
        <li>Ghi chú lại những điểm quan trọng</li>
    </ul>
    <p>Nếu có bất kỳ câu hỏi nào, đừng ngần ngại reply email này nhé!</p>
    <p style="color: #666;">Chúc bạn học tập hiệu quả! 🚀</p>
    <p><strong>Vietbaopro Team</strong></p>
</div>',
    true
FROM public.email_sequences WHERE name = 'Welcome Nurture' LIMIT 1;

-- Step 2: Sau 24 giờ - Chia sẻ tips
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_hours, subject, content, is_active)
SELECT 
    id, 2, 24,
    '💡 3 Cách tận dụng tối đa tài nguyên bạn vừa nhận',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #d4a574;">Bạn đã bắt đầu sử dụng chưa? 🤔</h2>
    <p>Hi {{name}},</p>
    <p>Hôm qua bạn đã tải về tài nguyên từ Vietbaopro. Mình muốn chia sẻ thêm 3 cách để bạn tận dụng tối đa:</p>
    <h3>1️⃣ Áp dụng ngay - Đừng để lâu</h3>
    <p>Kiến thức chỉ có giá trị khi được áp dụng. Hãy chọn 1 phần nhỏ và thực hành ngay hôm nay.</p>
    <h3>2️⃣ Kết hợp với công việc thực tế</h3>
    <p>Đừng chỉ đọc lý thuyết - hãy đưa vào dự án đang làm để thấy kết quả.</p>
    <h3>3️⃣ Chia sẻ với đồng nghiệp</h3>
    <p>Khi dạy lại cho người khác, bạn sẽ hiểu sâu hơn.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p>Bạn có bất kỳ câu hỏi nào không? Reply email này, mình sẽ hỗ trợ!</p>
    <p><strong>Vietbaopro Team</strong></p>
</div>',
    true
FROM public.email_sequences WHERE name = 'Welcome Nurture' LIMIT 1;

-- Step 3: Sau 72 giờ - Case study
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_hours, subject, content, is_active)
SELECT 
    id, 3, 72,
    '📈 Học viên này đã tăng 300% hiệu suất - Bí quyết là gì?',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #d4a574;">Câu chuyện thành công thực tế</h2>
    <p>Hi {{name}},</p>
    <p>Mình muốn chia sẻ với bạn câu chuyện của <strong>Anh Minh</strong> - một Content Creator đã áp dụng phương pháp từ Vietbaopro:</p>
    <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #d4a574; margin: 20px 0;">
        <p><em>"Trước khi học, mình mất 4-5 tiếng cho 1 bài viết. Sau khi áp dụng framework, chỉ còn 1-2 tiếng mà chất lượng tốt hơn nhiều!"</em></p>
        <p style="color: #666;">- Anh Minh, Content Manager</p>
    </blockquote>
    <p>Bí quyết của anh Minh:</p>
    <ul>
        <li>Học từng phần nhỏ, áp dụng ngay</li>
        <li>Xây dựng quy trình riêng từ template có sẵn</li>
        <li>Đầu tư vào khóa học chuyên sâu để hiểu rõ hơn</li>
    </ul>
    <p>Bạn có muốn đạt được kết quả tương tự không? 🎯</p>
    <p><strong>Vietbaopro Team</strong></p>
</div>',
    true
FROM public.email_sequences WHERE name = 'Welcome Nurture' LIMIT 1;

-- Step 4: Sau 120 giờ (5 ngày) - Giới thiệu khóa học
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_hours, subject, content, is_active)
SELECT 
    id, 4, 120,
    '🎓 Ưu đãi đặc biệt dành riêng cho bạn - Giảm 20%',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #d4a574;">{{name}}, bạn đã sẵn sàng cho bước tiếp theo chưa?</h2>
    <p>Hi {{name}},</p>
    <p>Qua 5 ngày sử dụng tài nguyên miễn phí, mình tin bạn đã thấy được giá trị mà Vietbaopro mang lại.</p>
    <p>Nhưng đó chỉ là <strong>5% kiến thức</strong> trong hệ thống đầy đủ của chúng mình.</p>
    <h3>🎁 Ưu đãi dành riêng cho bạn:</h3>
    <div style="background: linear-gradient(135deg, #d4a574 0%, #b8956c 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
        <h3 style="margin: 0; color: white;">GIẢM 20% KHÓA HỌC</h3>
        <p style="margin: 10px 0 0 0;">Mã: <strong>WELCOME20</strong> - Hết hạn sau 48 giờ</p>
    </div>
    <p>Áp dụng cho tất cả khóa học trên Vietbaopro.</p>
    <p style="text-align: center;">
        <a href="https://vietbaopro.com/courses" style="background: #d4a574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Xem khóa học ngay →</a>
    </p>
    <p><strong>Vietbaopro Team</strong></p>
</div>',
    true
FROM public.email_sequences WHERE name = 'Welcome Nurture' LIMIT 1;

-- === CART ABANDONMENT SEQUENCE ===
-- Step 1: Sau 1 giờ
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_hours, subject, content, is_active)
SELECT 
    id, 1, 1,
    '⏰ Bạn quên gì đó? Đơn hàng đang chờ bạn hoàn tất',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #d4a574;">{{name}}, đơn hàng của bạn vẫn đang chờ!</h2>
    <p>Hi {{name}},</p>
    <p>Mình thấy bạn đã xem qua khóa học <strong>{{course_name}}</strong> nhưng chưa hoàn tất đăng ký.</p>
    <p>Có phải bạn gặp khó khăn gì không? Nếu cần hỗ trợ về:</p>
    <ul>
        <li>💳 Phương thức thanh toán</li>
        <li>❓ Thông tin khóa học</li>
        <li>📞 Cần tư vấn thêm</li>
    </ul>
    <p>Đừng ngần ngại reply email này, mình sẵn sàng hỗ trợ bạn!</p>
    <p style="text-align: center; margin: 20px 0;">
        <a href="https://vietbaopro.com/checkout" style="background: #d4a574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Hoàn tất đăng ký →</a>
    </p>
    <p><strong>Vietbaopro Team</strong></p>
</div>',
    true
FROM public.email_sequences WHERE name = 'Cart Abandonment' LIMIT 1;

-- Step 2: Sau 24 giờ
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_hours, subject, content, is_active)
SELECT 
    id, 2, 24,
    '❓ Câu hỏi thường gặp về {{course_name}}',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #d4a574;">Có phải bạn đang thắc mắc điều gì?</h2>
    <p>Hi {{name}},</p>
    <p>Mình hiểu việc quyết định đầu tư vào một khóa học không dễ dàng. Dưới đây là một số câu hỏi thường gặp:</p>
    <h3>❓ "Khóa học có phù hợp với mình không?"</h3>
    <p>→ Khóa học được thiết kế cho mọi level. Bạn có thể xem preview miễn phí trước khi quyết định.</p>
    <h3>❓ "Sau khi mua có được hỗ trợ không?"</h3>
    <p>→ Có! Bạn được hỗ trợ trực tiếp qua email và group học viên.</p>
    <h3>❓ "Thanh toán thế nào?"</h3>
    <p>→ Chuyển khoản ngân hàng hoàn toàn an toàn. Khóa học được kích hoạt ngay sau khi xác nhận thanh toán.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p>Còn câu hỏi nào khác? Reply email này, mình sẽ giải đáp ngay!</p>
    <p><strong>Vietbaopro Team</strong></p>
</div>',
    true
FROM public.email_sequences WHERE name = 'Cart Abandonment' LIMIT 1;

-- Step 3: Sau 48 giờ - Last chance offer
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_hours, subject, content, is_active)
SELECT 
    id, 3, 48,
    '🔥 Cuối cùng: Giảm thêm 10% cho {{name}} - Chỉ hôm nay!',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #d4a574;">Ưu đãi cuối cùng dành cho bạn!</h2>
    <p>Hi {{name}},</p>
    <p>Mình biết bạn quan tâm đến <strong>{{course_name}}</strong>.</p>
    <p>Để giúp bạn dễ dàng quyết định hơn, mình tặng bạn mã giảm giá đặc biệt:</p>
    <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
        <h3 style="margin: 0; color: white;">🔥 GIẢM THÊM 10%</h3>
        <p style="margin: 10px 0;">Mã: <strong>LASTCHANCE10</strong></p>
        <p style="margin: 0; font-size: 14px;">⏰ Hết hạn sau 24 giờ!</p>
    </div>
    <p>Đây là ưu đãi cuối cùng trước khi mã hết hạn.</p>
    <p style="text-align: center;">
        <a href="https://vietbaopro.com/checkout" style="background: #d4a574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Sử dụng ưu đãi ngay →</a>
    </p>
    <p><strong>Vietbaopro Team</strong></p>
</div>',
    true
FROM public.email_sequences WHERE name = 'Cart Abandonment' LIMIT 1;

-- === POST-PURCHASE CROSS-SELL SEQUENCE ===
-- Step 1: Gửi ngay sau khi mua
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_hours, subject, content, is_active)
SELECT 
    id, 1, 0,
    '🎉 Chúc mừng {{name}}! Khóa học đã được kích hoạt',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #d4a574;">🎉 Chúc mừng bạn đã đăng ký thành công!</h2>
    <p>Hi {{name}},</p>
    <p>Cảm ơn bạn đã tin tưởng và đăng ký khóa học <strong>{{course_name}}</strong>!</p>
    <p>Khóa học của bạn đã được kích hoạt. Bạn có thể bắt đầu học ngay bây giờ.</p>
    <h3>📚 Để bắt đầu:</h3>
    <ol>
        <li>Đăng nhập vào tài khoản của bạn</li>
        <li>Vào mục "Khóa học của tôi"</li>
        <li>Chọn khóa học và bắt đầu với bài đầu tiên</li>
    </ol>
    <p style="text-align: center; margin: 20px 0;">
        <a href="https://vietbaopro.com/my-learning" style="background: #d4a574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Bắt đầu học ngay →</a>
    </p>
    <h3>💡 Mẹo học hiệu quả:</h3>
    <ul>
        <li>Học đều đặn 30 phút mỗi ngày</li>
        <li>Làm bài tập sau mỗi bài học</li>
        <li>Ghi chú những điểm quan trọng</li>
    </ul>
    <p>Chúc bạn học tập hiệu quả! 🚀</p>
    <p><strong>Vietbaopro Team</strong></p>
</div>',
    true
FROM public.email_sequences WHERE name = 'Post-Purchase Cross-sell' LIMIT 1;

-- Step 2: Sau 72 giờ - Check tiến độ
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_hours, subject, content, is_active)
SELECT 
    id, 2, 72,
    '📊 {{name}}, tiến độ học của bạn thế nào rồi?',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #d4a574;">Bạn đang học tốt chứ?</h2>
    <p>Hi {{name}},</p>
    <p>3 ngày đã trôi qua kể từ khi bạn bắt đầu học <strong>{{course_name}}</strong>.</p>
    <p>Mình muốn check xem bạn đang tiến triển thế nào:</p>
    <ul>
        <li>✅ Đã hoàn thành bao nhiêu bài?</li>
        <li>❓ Có phần nào khó hiểu không?</li>
        <li>💪 Có cần mình hỗ trợ gì không?</li>
    </ul>
    <p>Nếu bạn gặp khó khăn hoặc cần giải thích thêm phần nào, reply email này nhé!</p>
    <h3>💡 Tip của ngày:</h3>
    <p>Nếu bạn cảm thấy áp lực, hãy nhớ: <em>"Học chậm mà chắc, còn hơn học nhanh mà quên"</em>.</p>
    <p>Cố lên nhé! 🚀</p>
    <p><strong>Vietbaopro Team</strong></p>
</div>',
    true
FROM public.email_sequences WHERE name = 'Post-Purchase Cross-sell' LIMIT 1;

-- Step 3: Sau 168 giờ (7 ngày) - Cross-sell
INSERT INTO public.email_sequence_steps (sequence_id, step_order, delay_hours, subject, content, is_active)
SELECT 
    id, 3, 168,
    '🎯 Khóa học liên quan có thể giúp bạn tiến xa hơn',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #d4a574;">Tiếp tục nâng cấp kỹ năng của bạn!</h2>
    <p>Hi {{name}},</p>
    <p>Bạn đã học được 1 tuần với <strong>{{course_name}}</strong>. Xuất sắc! 🎉</p>
    <p>Để giúp bạn tiếp tục phát triển, mình muốn giới thiệu một số khóa học/tài nguyên bổ sung:</p>
    <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; margin: 20px 0;">
        <h4 style="margin-top: 0;">📚 Gợi ý dành cho bạn:</h4>
        <ul>
            <li><strong>Prompt Mastery</strong> - 50+ công thức prompt sẵn dùng</li>
            <li><strong>Content Planning Pro</strong> - Lên lịch content 1 tháng trong 1 buổi</li>
        </ul>
    </div>
    <p>Với tư cách học viên, bạn được <strong>giảm 15%</strong> cho tất cả khóa học khác.</p>
    <p>Mã: <strong>STUDENT15</strong></p>
    <p style="text-align: center;">
        <a href="https://vietbaopro.com/courses" style="background: #d4a574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Khám phá thêm →</a>
    </p>
    <p><strong>Vietbaopro Team</strong></p>
</div>',
    true
FROM public.email_sequences WHERE name = 'Post-Purchase Cross-sell' LIMIT 1;

-- ============================================
-- DONE! All email steps created successfully.
-- ============================================
