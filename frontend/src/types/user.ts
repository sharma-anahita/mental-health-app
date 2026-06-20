export interface User {
  // Basic identity
  name: string;
  email: string;

  // Profile fields (optional)
  username?: string;
  bio?: string;
  avatarUrl?: string;
  country?: string;
  countryCode?: string;
  phoneNumber?: string;
  fullNumber?: string;
  phone?: string;
  location?: string;

  // Gamification / stats
  coins?: number;
  xp?: number;
  level?: number;
  streak?: number;

  // Store / theme ownership
  inventory?: string[];
  preferences?: {
    theme?: string;
    fontColor?: string;
    fontStyle?:
      | "Inter"
      | "Manrope"
      | "Nunito"
      | "Poppins"
      | "Merriweather"
      | "Plus Jakarta Sans"
      | "Outfit"
      | "Open Sans";
  };
}

// Use named export only; default-exporting a type triggers TS1284 when
// `verbatimModuleSyntax` is enabled. Importers should use `import type { User }`.
