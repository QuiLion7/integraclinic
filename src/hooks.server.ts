import { redirect, type Handle } from '@sveltejs/kit';

// Rotas protegidas por autenticação
const protectedRoutes = ['/dashboard', '/procedures', '/registrations'];

export const handle: Handle = async ({ event, resolve }) => {
	const { url, cookies } = event;
	const path = url.pathname;

	// Verificando se a rota atual está protegida
	const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

	if (isProtectedRoute) {
		// Obtendo o token de autenticação dos cookies
		const token = cookies.get('auth_token');

		// Se nenhum token for encontrado, redirecionar para a página de login
		if (!token) {
			throw redirect(302, '/login');
		}
	}

	// Continuando o processamento da solicitação
	return await resolve(event);
};
