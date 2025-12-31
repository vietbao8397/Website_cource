// User & Auth Types
export type UserRole = "guest" | "learner" | "instructor" | "admin";

export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

// Course Types
export type CourseStatus = "draft" | "published" | "archived";

export interface Course {
    id: string;
    title: string;
    slug: string;
    description?: string;
    short_description?: string;
    thumbnail_url?: string;
    price: number;
    sale_price?: number;
    instructor_id?: string;
    instructor?: User;
    status: CourseStatus;
    youtube_preview_id?: string;
    curriculum?: Chapter[];
    created_at: string;
    updated_at: string;
}

export interface Chapter {
    id: string;
    title: string;
    lessons: Lesson[];
}

export interface Lesson {
    id: string;
    course_id: string;
    chapter_index: number;
    lesson_index: number;
    title: string;
    description?: string;
    youtube_video_id: string;
    duration_minutes?: number;
    is_preview: boolean;
    created_at: string;
}

// Order Types
export type OrderStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "bank_transfer" | "momo" | "vnpay";

export interface Order {
    id: string;
    user_id: string;
    user?: User;
    course_id: string;
    course?: Course;
    amount: number;
    status: OrderStatus;
    payment_method?: PaymentMethod;
    transaction_note?: string;
    admin_note?: string;
    created_at: string;
    updated_at: string;
}

// Enrollment Types
export interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    course?: Course;
    order_id?: string;
    progress: Record<string, boolean>; // lesson_id -> completed
    completed_at?: string;
    created_at: string;
}

export interface LessonProgress {
    id: string;
    user_id: string;
    lesson_id: string;
    completed: boolean;
    last_watched_at?: string;
    created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

// Form Types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    email: string;
    password: string;
    full_name: string;
}

export interface CheckoutFormData {
    full_name: string;
    email: string;
    phone: string;
    note?: string;
}
