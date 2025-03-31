import { redirect } from '@sveltejs/kit';
import axios from 'axios';

export const load = async ({ cookies }) => {
	// Verificar token nos cookies
	const token = cookies.get('auth_token');

	if (!token) {
		// Redirecionar para login se não houver token
		throw redirect(302, '/');
	}

	try {
		// Verificar se o token é válido usando axios
		await axios.post(
			'https://investm-backend-divine-field-7851.fly.dev/api/v1/authentication/token/verify/',
			{ token },
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);

		// Buscar dados do usuário com axios
		let user = null;
		try {
			const userResponse = await axios.get(
				'https://investm-backend-divine-field-7851.fly.dev/api/v1/users/me/',
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);
			user = userResponse.data;
		} catch (userError) {
			console.error('Erro ao buscar dados do usuário:', userError);
		}

		// Token válido, continuar com a navegação
		return {
			token,
			user
		};
	} catch {
		// Em caso de erro na verificação, redirecionar para a página inicial
		cookies.delete('auth_token', { path: '/' });
		throw redirect(302, '/');
	}
};
