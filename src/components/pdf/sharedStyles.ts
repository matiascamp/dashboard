// Modern shared theme system
export const modernTheme = {
  // Color System
  colors: {
    // Backgrounds
    background: 'var(--background)',
    backgroundSecondary: 'var(--background-secondary)',
    backgroundTertiary: 'var(--background-tertiary)',
    
    // Foreground/Text
    foreground: 'var(--foreground)',
    foregroundSecondary: 'var(--foreground-secondary)',
    foregroundMuted: 'var(--foreground-muted)',
    
    // Primary Brand
    primary: 'var(--primary)',
    primaryForeground: 'var(--primary-foreground)',
    primaryHover: 'var(--primary-hover)',
    
    // UI Elements
    border: 'var(--border)',
    borderHover: 'var(--border-hover)',
    inputBg: 'var(--input-bg)',
    cardBg: 'var(--card-bg)',
    
    // Sidebar
    sidebarBg: 'var(--sidebar-bg)',
    sidebarForeground: 'var(--sidebar-foreground)',
    
    // Status Colors
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
  },

  // Spacing System (rem units for better scaling)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
  },

  // Typography System
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Shadow System
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
  },

  // Border Radius System
  borderRadius: {
    sm: 'var(--radius-sm)',   // 6px
    md: 'var(--radius-md)',   // 8px  
    lg: 'var(--radius-lg)',   // 12px
    xl: 'var(--radius-xl)',   // 16px
  },

  // Animation System
  animations: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },

  // Breakpoints for responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index system
  zIndex: {
    dropdown: '1000',
    modal: '1050',
    popover: '1060',
    tooltip: '1070',
    navbar: '1080',
  }
};

// Legacy support - keeping the old structure for backward compatibility
export const sharedTheme = {
  colors: {
    gray100: modernTheme.colors.backgroundTertiary,
    gray400: modernTheme.colors.foregroundMuted,
    white: modernTheme.colors.background,
    black: modernTheme.colors.foreground,
  },
  spacing: {
    p6: 24,
    p8: 32,
  },
  fontSizes: {
    xs: 10,
    sm: 12,
    base: 14,
    xl: 20,
    '3xl': 24,
  },
  fontWeights: {
    normal: 400,
    semibold: 600,
    bold: 700,
  },
};

// Utility functions for theme usage
export const getColor = (colorKey: string) => modernTheme.colors[colorKey as keyof typeof modernTheme.colors];
export const getSpacing = (spaceKey: string) => modernTheme.spacing[spaceKey as keyof typeof modernTheme.spacing];
export const getFontSize = (sizeKey: string) => modernTheme.typography.fontSize[sizeKey as keyof typeof modernTheme.typography.fontSize];
export const getShadow = (shadowKey: string) => modernTheme.shadows[shadowKey as keyof typeof modernTheme.shadows];

// CSS-in-JS helpers
export const createButtonStyles = (variant: 'primary' | 'secondary' | 'ghost' = 'primary') => {
  const baseStyles = `
    inline-flex items-center justify-center
    px-4 py-2 rounded-lg font-medium
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-[var(--primary)] hover:bg-[var(--primary-hover)]
      text-[var(--primary-foreground)]
      focus:ring-[var(--primary)]
    `,
    secondary: `
      bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)]
      text-[var(--foreground)] border border-[var(--border)]
      focus:ring-[var(--primary)]
    `,
    ghost: `
      bg-transparent hover:bg-[var(--background-tertiary)]
      text-[var(--foreground-secondary)] hover:text-[var(--foreground)]
      focus:ring-[var(--primary)]
    `
  };

  return `${baseStyles} ${variants[variant]}`;
};

export const createInputStyles = () => `
  w-full px-3 py-2
  bg-[var(--input-bg)] 
  border border-[var(--border)]
  rounded-lg
  text-[var(--foreground)]
  placeholder:text-[var(--foreground-muted)]
  focus:border-[var(--primary)]
  focus:ring-0
  transition-all duration-200
`;

export const createCardStyles = () => `
  bg-[var(--card-bg)]
  border border-[var(--border)]
  rounded-xl
  shadow-[var(--shadow-md)]
`;

// Animation classes
export const animations = {
  fadeIn: 'animate-fade-in',
  slideIn: 'animate-slide-in',
  scaleIn: 'animate-scale-in',
};

// Export everything
export default modernTheme;