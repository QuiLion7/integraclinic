import type { PageLoad } from './$types';
import axios from 'axios';

export const load: PageLoad = async ({ parent }) => {
	// Obtém os dados do layout pai, que inclui o token
	const { token } = await parent();

	// Configuração base do axios
	const api = axios.create({
		baseURL: 'https://investm-backend-divine-field-7851.fly.dev/api/v1',
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	try {
		// Buscar cadastros
		const registrationsResponse = await api.get('/pre-register/');

		// Buscar procedimentos ativos
		const proceduresResponse = await api.get('/assignor/procedure/', {
			params: { isActive: true }
		});

		// Buscando assignors
		const assignorsResponse = await api.get('/assignor/');

		let statusSummary = { pending: 0, registered: 0, rejected: 0, total: 0 };

		// Buscando resumo de status
		try {
			const statusSummaryResponse = await api.get('/pre-register/status-summary/');

			statusSummary = statusSummaryResponse.data;
		} catch (statusError) {
			console.error('Erro na resposta da API de resumo de status:', statusError);
		}

		// Verificando se os dados estão em data.results ou diretamente em data
		const registrations = Array.isArray(registrationsResponse.data.results)
			? registrationsResponse.data.results
			: Array.isArray(registrationsResponse.data)
				? registrationsResponse.data
				: [];

		const procedures = Array.isArray(proceduresResponse.data.results)
			? proceduresResponse.data.results
			: Array.isArray(proceduresResponse.data)
				? proceduresResponse.data
				: [];

		const assignors = Array.isArray(assignorsResponse.data.results)
			? assignorsResponse.data.results
			: Array.isArray(assignorsResponse.data)
				? assignorsResponse.data
				: [];

		return {
			registrations,
			procedures,
			assignors,
			statusSummary,
			pageTitle: 'Pré-Cadastros',
			pageDescription: 'Gerenciar pré-cadastros de pacientes'
		};
	} catch (error) {
		console.error('Erro ao carregar dados de pré-cadastros:', error);

		// Retornando dados vazios em caso de erro
		return {
			registrations: [],
			procedures: [],
			assignors: [],
			statusSummary: { pending: 0, registered: 0, rejected: 0, total: 0 },
			pageTitle: 'Pré-Cadastros',
			pageDescription: 'Gerenciar pré-cadastros de pacientes',
			error: 'Não foi possível carregar os dados. Por favor, tente novamente mais tarde.'
		};
	}
};
