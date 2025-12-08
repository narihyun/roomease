import { AppState } from './types';

// Predefined pastel colors for avatars
const AVATAR_COLORS = [
  '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', 
  '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF',
  '#E0BBE4', '#957DAD', '#D291BC', '#FEC8D8'
];

// Helper to generate Google-style initials avatar as SVG Data URI
export const generateInitialsAvatar = (name: string) => {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  
  // Use random color instead of name hash to differentiate users with same names
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  // Create SVG string
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="55%" font-family="'Noto Sans KR', sans-serif" font-weight="bold" font-size="50" text-anchor="middle" dominant-baseline="middle" fill="#374151">${initial}</text>
    </svg>
  `;

  // Return as Base64 Data URI
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
};

export const INITIAL_STATE: AppState = {
  isSetup: false,
  houseId: null, // Connected to DB
  houseName: '',
  currentUser: { id: '', name: '', avatar: '', isCurrentUser: true },
  roomies: [],
  tasks: [],
  stock: [],
  expenses: []
};