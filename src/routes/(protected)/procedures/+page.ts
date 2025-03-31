import axios, { AxiosError } from 'axios';

export const load = async ({ parent }) => {
	// Obtendo os dados do layout pai, que inclui o token
	const { token } = await parent();

	// Configuração base do axios com URL e cabeçalhos de autenticação
	const api = axios.create({
		baseURL: 'https://investm-backend-divine-field-7851.fly.dev/api/v1',
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	try {
		// Tratamento para erro 403 ao buscar usuários
		try {
			await api.get('/users/');
		} catch (error) {
			const axiosError = error as AxiosError;
			if (axiosError.response && axiosError.response.status === 403) {
				console.info(
					'Usuário sem permissão para listar usuários. Isso é normal para usuários não-admin.'
				);
			} else {
				console.error('Erro ao buscar usuários:', error);
			}
		}

		// Buscando categorias e procedimentos em paralelo
		const [categoriesResponse, proceduresResponse] = await Promise.all([
			api.get('/assignor/procedure-category/'),
			api.get('/assignor/procedure/')
		]);

		return {
			categories: categoriesResponse.data.results || [],
			procedures: proceduresResponse.data.results || [],
			pageTitle: 'Procedimentos',
			pageDescription: 'Gerenciar procedimentos da clínica'
		};
	} catch (error: unknown) {
		console.error('Erro ao carregar dados:', error);

		// Tratando os erros com axios
		const axiosError = error as AxiosError;
		const errorMessage = axiosError.response
			? `Erro do servidor: ${axiosError.response.status}`
			: 'Não foi possível conectar ao servidor';

		// Retornando dados vazios em caso de erro
		return {
			categories: [],
			procedures: [],
			pageTitle: 'Procedimentos',
			pageDescription: 'Gerenciar procedimentos da clínica',
			error: `Não foi possível carregar os dados. ${errorMessage}`
		};
	}
};
