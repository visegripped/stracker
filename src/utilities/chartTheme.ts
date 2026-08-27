import type { ResolvedTheme } from './theme';

const LIGHT = {
  text: '#2c292b',
  grid: 'rgba(44, 41, 43, 0.12)',
};

const DARK = {
  text: '#f2eee9',
  grid: 'rgba(242, 238, 233, 0.12)',
};

/** Chart.js canvas colors — keep in sync with --color-chart-* in App.css.
 *  Use the theme argument, not getComputedStyle: data-theme is applied in
 *  an effect, so CSS variables still reflect the previous theme during render.
 */
export function getChartPalette(theme: ResolvedTheme) {
  return theme === 'dark' ? DARK : LIGHT;
}

export function getChartChrome(theme: ResolvedTheme, title: string, axis?: { x?: string; y?: string }) {
  const { text, grid } = getChartPalette(theme);
  return {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: text,
          font: { size: 13 },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle' as const,
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      title: {
        display: true,
        text: title,
        color: text,
        font: { size: 16, weight: 'bold' as const },
        padding: { top: 8, bottom: 18 },
      },
    },
    scales: {
      x: {
        title: axis?.x
          ? {
              display: true,
              text: axis.x,
              color: text,
              font: { size: 13, weight: 'bold' as const },
              padding: 8,
            }
          : undefined,
        ticks: {
          color: text,
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { color: grid },
        border: { color: grid },
      },
      y: {
        title: axis?.y
          ? {
              display: true,
              text: axis.y,
              color: text,
              font: { size: 13, weight: 'bold' as const },
              padding: 8,
            }
          : undefined,
        ticks: { color: text },
        grid: { color: grid },
        border: { color: grid },
      },
    },
  };
}

export function agGridThemeClass(theme: ResolvedTheme) {
  return theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';
}
