// Clean SVG icon components — no emojis anywhere in the codebase

type IconProps = { size?: number; color?: string; style?: React.CSSProperties };

const defaults = (props: IconProps) => ({
    width: props.size ?? 16,
    height: props.size ?? 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: props.color ?? "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: props.style,
});

export const IconBrain = (p: IconProps) => (
    <svg {...defaults(p)}>
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.16Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.16Z" />
    </svg>
);

export const IconSearch = (p: IconProps) => (
    <svg {...defaults(p)}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

export const IconEdit = (p: IconProps) => (
    <svg {...defaults(p)}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
);

export const IconScale = (p: IconProps) => (
    <svg {...defaults(p)}>
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
);

export const IconFlask = (p: IconProps) => (
    <svg {...defaults(p)}>
        <path d="M9 3h6l1 9H8L9 3Z" />
        <path d="M6 21a6 6 0 0 1 12 0H6Z" />
        <line x1="12" y1="3" x2="12" y2="12" />
    </svg>
);

export const IconHistory = (p: IconProps) => (
    <svg {...defaults(p)}>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
    </svg>
);

export const IconCheck = (p: IconProps) => (
    <svg {...defaults(p)}>
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

export const IconRefresh = (p: IconProps) => (
    <svg {...defaults(p)}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
    </svg>
);

export const IconCopy = (p: IconProps) => (
    <svg {...defaults(p)}>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
);

export const IconBot = (p: IconProps) => (
    <svg {...defaults(p)}>
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" /><path d="M20 14h2" />
        <path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
);

export const IconInbox = (p: IconProps) => (
    <svg {...defaults(p)}>
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
);

export const IconStar = (p: IconProps & { filled?: boolean }) => (
    <svg {...defaults(p)} fill={p.filled ? p.color ?? "currentColor" : "none"}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

export const IconLoader = (p: IconProps) => (
    <svg {...defaults(p)} style={{ ...p.style, animation: "spin 1s linear infinite" }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export const IconExternalLink = (p: IconProps) => (
    <svg {...defaults(p)}>
        <path d="M15 3h6v6" /><path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
);

export const IconPlus = (p: IconProps) => (
    <svg {...defaults(p)}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
);
