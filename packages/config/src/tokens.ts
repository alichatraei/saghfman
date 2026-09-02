/** Design tokens for «سقف من». Single source of truth for both apps. */
export const colors = {
  navy: '#08263A',
  navyAlt: '#0B3550',
  navySoft: '#123E5C',
  gold: '#D6AF70',
  goldDark: '#C69A55',
  goldSoft: '#F3E7D2',
  cream: '#FCFAF6',
  creamSoft: '#F7F2E9',
  white: '#FFFFFF',
  text: '#12171B',
  textMuted: '#667078',
  border: '#E4E7E9',
  success: '#16845B',
  danger: '#C44949',
  warning: '#B98213',
} as const;

export const radii = {
  sm: '12px',
  md: '16px',
  lg: '20px',
  pill: '999px',
} as const;

export const shadows = {
  card: '0 2px 10px rgba(8, 38, 58, 0.06)',
  cardHover: '0 12px 30px rgba(8, 38, 58, 0.12)',
  header: '0 1px 0 rgba(255,255,255,0.06)',
  panel: '0 6px 24px rgba(8, 38, 58, 0.08)',
} as const;

export const layout = {
  containerMax: 1320,
  containerPadding: 24,
  headerHeight: 88,
  headerHeightMobile: 64,
} as const;
