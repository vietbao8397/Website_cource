import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    variant?: 'gold' | 'currentColor' | 'white';
}

export const Icons = {
    Gradient: () => (
        <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
                <linearGradient id="gold-gradient-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4AF37" />
                    <stop offset="50%" stopColor="#F9E076" />
                    <stop offset="100%" stopColor="#B8860B" />
                </linearGradient>
            </defs>
        </svg>
    ),

    Rocket: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71.79-1.81.79-1.81l-3.21-3.21s-1.1.08-1.81.79z" />
            <path d="m11.5 5.5-2 2" />
            <path d="m14 10-1.5 1.5" />
            <path d="M15.5 11.5 14 13" />
            <path d="m16 8 2-2" />
            <path d="M17.5 15.5 19 14" />
            <path d="m20 12-2 2" />
            <path d="M22 2s-5.5 1.5-11.5 7.5S2 22 2 22s9.5-1.5 15.5-7.5S22 2 22 2z" />
        </svg>
    ),

    Course: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
    ),

    Resource: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    ),

    Stats: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </svg>
    ),

    Mail: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    ),

    Sparkles: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
            <path d="M4 17v2" />
            <path d="M5 18H3" />
        </svg>
    ),

    Time: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),

    Robot: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
        </svg>
    ),

    Alert: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
    ),

    Settings: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),

    Blog: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
        </svg>
    ),

    Users: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),

    Video: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" />
        </svg>
    ),

    Target: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    ),

    Check: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),

    BookOpen: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    ),

    ChevronRight: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <polyline points="9 18 15 12 9 6" />
        </svg>
    ),

    LayoutDashboard: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
    ),

    ShoppingBag: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    ),

    Home: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    ),

    X: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    ),

    MessageCircle: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
        </svg>
    ),

    Minimize2: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polyline points="4 14 10 14 10 20" />
            <polyline points="20 10 14 10 14 4" />
        </svg>
    ),

    Send: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
        </svg>
    ),

    User: ({ size = 20, variant = 'currentColor', ...props }: IconProps) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={variant === 'gold' ? 'url(#gold-gradient-icon)' : variant} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
};
