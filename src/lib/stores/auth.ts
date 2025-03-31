import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Inicializando o armazenamento com token de cookies se estiver no navegador
const getInitialToken = () => {
	if (browser) {
		// Tentendo obter o token dos cookies primeiro
		const cookieValue = document.cookie
			.split('; ')
			.find((row) => row.startsWith('auth_token='))
			?.split('=')[1];

		if (cookieValue) return cookieValue;

		// Retornando ao sessionStorage para compatibilidade com versões anteriores
		const storedToken = sessionStorage.getItem('jwt_token');
		if (storedToken) {
			// Migrando da sessionStorage para cookies
			setAuthCookie(storedToken);
			return storedToken;
		}
	}
	return null;
};

export const authStore = writable({ token: getInitialToken() });

// Auxiliando a definir o cookie com atributos apropriados
function setAuthCookie(token: string) {
	if (browser) {
		// Definindo o cookie HttpOnly seguro com SameSite=Strict
		document.cookie = `auth_token=${token}; path=/; max-age=3600; SameSite=Strict`;
	}
}

export function setAuthToken(token: string) {
	authStore.set({ token });

	if (browser) {
		// Definido em cookie (armazenamento primário)
		setAuthCookie(token);

		// Definindo em sessionStorage para compatibilidade com versões anteriores
		sessionStorage.setItem('jwt_token', token);
	}
}

export function logout() {
	authStore.set({ token: null });

	if (browser) {
		//Limpando cookie
		document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

		// Limpando sessionStorage
		sessionStorage.removeItem('jwt_token');
	}
}

//Verificando se o usuário está autenticado
export function isAuthenticated(): boolean {
	let authenticated = false;

	// Assinatura única para obter valor atual
	authStore.subscribe((auth) => {
		authenticated = !!auth.token;
	})();

	return authenticated;
}
