// Unique Theme Styling per Job Role / Category
export const categoryTheme = {
  Software: {
    color: '#00f2fe',
    bg: 'rgba(0, 242, 254, 0.12)',
    border: 'rgba(0, 242, 254, 0.4)',
    glow: '0 0 12px rgba(0, 242, 254, 0.25)',
    label: 'Software & Web',
    badgeClass: 'badge-software'
  },
  'Data Science': {
    color: '#c084fc',
    bg: 'rgba(192, 132, 252, 0.12)',
    border: 'rgba(192, 132, 252, 0.4)',
    glow: '0 0 12px rgba(192, 132, 252, 0.25)',
    label: 'Data Science & AI',
    badgeClass: 'badge-data-science'
  },
  Mechanical: {
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.4)',
    glow: '0 0 12px rgba(251, 191, 36, 0.25)',
    label: 'Mechanical Engineering',
    badgeClass: 'badge-mechanical'
  },
  Electrical: {
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(52, 211, 153, 0.4)',
    glow: '0 0 12px rgba(52, 211, 153, 0.25)',
    label: 'Electrical & Telemetry',
    badgeClass: 'badge-electrical'
  },
  Civil: {
    color: '#ff4d6d',
    bg: 'rgba(255, 77, 109, 0.12)',
    border: 'rgba(255, 77, 109, 0.4)',
    glow: '0 0 12px rgba(255, 77, 109, 0.25)',
    label: 'Civil & Structural',
    badgeClass: 'badge-civil'
  },
  Business: {
    color: '#60a5fa',
    bg: 'rgba(96, 165, 250, 0.12)',
    border: 'rgba(96, 165, 250, 0.4)',
    glow: '0 0 12px rgba(96, 165, 250, 0.25)',
    label: 'Business & Growth',
    badgeClass: 'badge-business'
  },
  Finance: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.4)',
    glow: '0 0 12px rgba(16, 185, 129, 0.25)',
    label: 'Finance & Banking',
    badgeClass: 'badge-finance'
  },
  Marketing: {
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.4)',
    glow: '0 0 12px rgba(249, 115, 22, 0.25)',
    label: 'Marketing & Sales',
    badgeClass: 'badge-marketing'
  },
  Healthcare: {
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.4)',
    glow: '0 0 12px rgba(236, 72, 153, 0.25)',
    label: 'Healthcare & Pharma',
    badgeClass: 'badge-healthcare'
  },
  Design: {
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.4)',
    glow: '0 0 12px rgba(168, 85, 247, 0.25)',
    label: 'Design & Creative',
    badgeClass: 'badge-design'
  },
  HR: {
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.4)',
    glow: '0 0 12px rgba(6, 182, 212, 0.25)',
    label: 'HR & People Ops',
    badgeClass: 'badge-hr'
  }
};

export const getCategoryStyle = (category) => {
  const cat = categoryTheme[category] || categoryTheme.Software;
  return {
    color: cat.color,
    backgroundColor: cat.bg,
    border: `1px solid ${cat.border}`,
    boxShadow: cat.glow
  };
};
