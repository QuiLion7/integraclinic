import type { PageLoad } from './$types';
import axios, { AxiosError } from 'axios';

export const load: PageLoad = async ({ parent }) => {
	// Obtém os dados do layout pai, que inclui o token e o usuário
	const { token, user } = await parent();

	let userCount = 0;
	let categories = [];
	let procedures = [];

	try {
		// Buscar informações de usuários
		try {
			const userResponse = await axios.get(
				'https://investm-backend-divine-field-7851.fly.dev/api/v1/users/',
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			// Verificar se temos uma contagem total ou precisamos contar o array
			userCount =
				userResponse.data.count ||
				(Array.isArray(userResponse.data.results) ? userResponse.data.results.length : 0);
		} catch (error) {
			// Verificar se é um erro de permissão (403)
			const axiosError = error as AxiosError;
			if (axiosError.response && axiosError.response.status === 403) {
				console.info(
					'Usuário sem permissão para listar usuários. Isso é normal para usuários não-admin.'
				);
				userCount = 1; // Assumimos pelo menos o usuário atual
			} else {
				console.error('Erro ao buscar usuários:', error);
			}
		}

		// Obter o ID do assignor do usuário
		let assignorId = null;
		if (user && user.assignor) {
			assignorId = typeof user.assignor === 'object' ? user.assignor.id : user.assignor;
		}

		// Buscar categorias de procedimentos
		try {
			const categoriesResponse = await axios.get(
				'https://investm-backend-divine-field-7851.fly.dev/api/v1/assignor/procedure-category/',
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);
			categories = categoriesResponse.data.results || [];
		} catch (error) {
			console.error('Erro ao buscar categorias:', error);
		}

		// Buscar procedimentos com o assignor do usuário logado
		try {
			const proceduresResponse = await axios.get(
				`https://investm-backend-divine-field-7851.fly.dev/api/v1/assignor/procedure/${assignorId ? `?assignor=${assignorId}` : ''}`,
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);
			procedures = proceduresResponse.data.results || [];
		} catch (error) {
			console.error('Erro ao buscar procedimentos:', error);
		}

		// Retornamos os dados para a página
		return {
			userCount,
			categories,
			procedures,
			pageTitle: 'Dashboard',
			pageDescription: 'Visão geral do sistema'
		};
	} catch (err) {
		console.error('Erro ao carregar dados do dashboard:', err);
		return {
			userCount: 0,
			categories: [],
			procedures: [],
			error: 'Falha ao carregar dados da dashboard. Por favor, tente novamente mais tarde.',
			pageTitle: 'Dashboard',
			pageDescription: 'Visão geral do sistema'
		};
	}
};
