// Declarações de tipos globais para a aplicação

declare module '$lib/config' {
  export const API_URL: string;
  export const TOKEN_EXPIRATION: number;
  export const AUTH_COOKIE_NAME: string;
}

declare module '$lib/utils/auth' {
  export function getAuthToken(): string;
  export function getAuthHeader(): string;
  export function setAuthToken(token: string, expirationDays?: number): void;
  export function removeAuthToken(): void;
  export function isAuthenticated(): boolean;
}
