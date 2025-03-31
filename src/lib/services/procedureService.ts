// Serviço para gerenciar procedimentos
import axios from 'axios';
import { API_URL } from '$lib/config';
import { getAuthHeader } from '$lib/utils/auth';

export interface Procedure {
	id: number;
	assignor: number;
	name: string;
	price: string;
	isActive: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface ProcedureResponse {
	results?: Procedure[];
	content?: Procedure[];
	count?: number;
	total_elements?: number;
	next?: string | null;
	previous?: string | null;
}

export interface ProcedureSummary {
	active: number;
	inactive: number;
	total: number;
}

// Verificando a estrutura da resposta
function normalizeResponse(data: unknown): ProcedureResponse {
	if (typeof data !== 'object' || data === null) {
		return {
			results: [],
			count: 0,
			next: null,
			previous: null
		};
	}

	if (Array.isArray(data)) {
		return {
			results: data as Procedure[],
			count: data.length,
			next: null,
			previous: null
		};
	}

	// Assegurando que é um objeto
	const responseData = data as Record<string, unknown>;

	// Verificando se tem a propriedade results
	if ('results' in responseData && Array.isArray(responseData.results)) {
		// Convertendo para o tipo correto com type assertion
		return {
			results: responseData.results as Procedure[],
			count:
				typeof responseData.count === 'number' ? responseData.count : responseData.results.length,
			next: responseData.next as string | null,
			previous: responseData.previous as string | null
		};
	}

	// Verificando se tem a propriedade content
	if ('content' in responseData && Array.isArray(responseData.content)) {
		return {
			results: responseData.content as Procedure[],
			count:
				typeof responseData.total_elements === 'number'
					? responseData.total_elements
					: responseData.content.length,
			next: null,
			previous: null
		};
	}

	// O formato não foi reconhecido
	console.warn('Formato de resposta não reconhecido:', responseData);
	return {
		results: [],
		count: 0,
		next: null,
		previous: null
	};
}

// Buscando todos os procedimentos
export async function getProcedures(params: {
	isActive?: boolean;
	assignor?: number;
	name?: string;
	page?: number;
	size?: number;
}): Promise<ProcedureResponse> {
	try {
		const url = `${API_URL}/assignor/procedure/`;
		const response = await axios.get(url, {
			params,
			headers: {
				'Content-Type': 'application/json',
				Authorization: getAuthHeader()
			}
		});

		return normalizeResponse(response.data);
	} catch (error) {
		console.error('Erro ao buscar procedimentos:', error);
		throw error;
	}
}

// Buscando um procedimento específico pelo ID
export async function getProcedureById(id: number): Promise<Procedure> {
	try {
		const response = await axios.get(`${API_URL}/assignor/procedure/${id}/`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: getAuthHeader()
			}
		});

		return response.data;
	} catch (error) {
		console.error('Erro ao buscar procedimento:', error);
		throw error;
	}
}

// Criando um novo procedimento
export async function createProcedure(
	data: Omit<Procedure, 'id' | 'created_at' | 'updated_at'>
): Promise<Procedure> {
	try {
		const response = await axios.post(`${API_URL}/assignor/procedure/`, data, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: getAuthHeader()
			}
		});

		return response.data;
	} catch (error) {
		console.error('Erro ao criar procedimento:', error);
		throw error;
	}
}

// Atualizando um procedimento existente
export async function updateProcedure(
	id: number,
	data: Omit<Procedure, 'id' | 'created_at' | 'updated_at'>
): Promise<Procedure> {
	try {
		const response = await axios.put(`${API_URL}/assignor/procedure/${id}/`, data, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: getAuthHeader()
			}
		});

		return response.data;
	} catch (error) {
		console.error('Erro ao atualizar procedimento:', error);
		throw error;
	}
}

// Exclui um procedimento
export async function deleteProcedure(id: number): Promise<boolean> {
	try {
		await axios.delete(`${API_URL}/assignor/procedure/${id}/`, {
			headers: {
				Authorization: getAuthHeader()
			}
		});

		return true;
	} catch (error) {
		// Com axios, podemos acessar os detalhes da resposta diretamente através de error.response
		if (axios.isAxiosError(error) && error.response?.data?.detail) {
			throw new Error(error.response.data.detail);
		}
		throw error;
	}
}

// Obtendo estatísticas de resumo do procedimento
export async function getProcedureSummary(): Promise<ProcedureSummary> {
	try {
		// Buscando todos os procedimentos
		const allProcedures = await getProcedures({});

		const procedures = allProcedures.results || [];

		// Calculando estatísticas
		const active = procedures.filter((p) => p.isActive).length;
		const inactive = procedures.filter((p) => !p.isActive).length;
		const total = procedures.length;

		const summary = {
			active,
			inactive,
			total
		};

		return summary;
	} catch (error) {
		console.error('Erro ao calcular estatísticas de procedimentos:', error);
		return {
			active: 0,
			inactive: 0,
			total: 0
		};
	}
}
