import { browser } from '$app/environment';
import { AUTH_COOKIE_NAME } from '$lib/config';

/**
 * Obtém o token de autenticação dos cookies
 */
export function getAuthToken(): string {
	if (!browser) return '';

	const token =
		document.cookie
			.split('; ')
			.find((row) => row.startsWith(`${AUTH_COOKIE_NAME}=`))
			?.split('=')[1] || '';

	return token;
}

//Obtendo o cabeçalho de autorização completo no formato "Bearer [token]"

export function getAuthHeader(): string {
	const token = getAuthToken();
	if (!token) return '';

	return `Bearer ${token}`;
}

// Salvando o token de autenticação nos cookies

export function setAuthToken(token: string, expirationDays: number = 1): void {
	if (!browser) return;

	const date = new Date();
	date.setTime(date.getTime() + expirationDays * 24 * 60 * 60 * 1000);
	const expires = `expires=${date.toUTCString()}`;

	document.cookie = `${AUTH_COOKIE_NAME}=${token}; ${expires}; path=/; SameSite=Strict`;
}

//Removendo o token de autenticação dos cookies

export function removeAuthToken(): void {
	if (!browser) return;

	document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
}

//Verifica se o usuário está autenticado

export function isAuthenticated(): boolean {
	return !!getAuthToken();
}
