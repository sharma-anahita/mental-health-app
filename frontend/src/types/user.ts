export interface User {
  // Basic identity
  name: string;
  email: string;

  // Profile fields (optional)
  username?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  location?: string;

  // Gamification / stats
  coins?: number;
  xp?: number;
  level?: number;
  streak?: number;
}

export default User;
