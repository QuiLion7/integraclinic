import axios from 'axios';
import { API_URL } from '$lib/config';
import { getAuthHeader } from '$lib/utils/auth';

interface PreRegisterProcedure {
	procedure: number;
	quantity: number;
}

export interface PreRegister {
	id?: number;
	assignor: number;
	procedures: PreRegisterProcedure[];
	name: string;
	email: string;
	cpf: string;
	phone: string;
	status: 'pending' | 'registered' | 'rejected';
	register_link?: string;
	created_at?: string;
	updated_at?: string;
}

export interface PreRegisterWithEmailError extends PreRegister {
	_emailError?: boolean;
}

export interface PreRegisterResponse {
	results?: PreRegister[];
	content?: PreRegister[];
	count?: number;
	total_elements?: number;
	next?: string | null;
	previous?: string | null;
}

export interface StatusSummary {
	registered: number;
	pending: number;
	rejected: number;
	total: number;
}

// Interface para erros customizados da API
export interface ApiError extends Error {
	apiError?: Record<string, unknown>;
}

// Verificando a estrutura da resposta
function normalizeResponse(data: unknown): PreRegisterResponse {
	// Verificando se é um objeto
	if (typeof data !== 'object' || data === null) {
		return { results: [] };
	}

	// Verificando se é um array
	if (Array.isArray(data)) {
		return {
			results: data as PreRegister[],
			count: data.length,
			next: null,
			previous: null
		};
	}

	// Assegurando que é um objeto
	const responseData = data as Record<string, unknown>;

	// Verificando se tem a propriedade results
	if ('results' in responseData && Array.isArray(responseData.results)) {
		return responseData as PreRegisterResponse;
	}

	// Verificando se tem a propriedade content
	if ('content' in responseData && Array.isArray(responseData.content)) {
		return {
			results: responseData.content as PreRegister[],
			count:
				typeof responseData.total_elements === 'number'
					? responseData.total_elements
					: responseData.content.length,
			next: null,
			previous: null
		};
	}

	// O formato não foi reconhecido
	return { results: [] };
}

// Buscando todos os procedimentos
export async function getPreRegisters(params: {
	status?: string;
	cpf?: string;
	name?: string;
	email?: string;
	phone?: string;
	cnpj?: string;
	q?: string;
	page?: number;
	size?: number;
}): Promise<PreRegisterResponse> {
	try {
		const response = await axios.get(`${API_URL}/pre-register/`, {
			params,
			headers: {
				'Content-Type': 'application/json',
				Authorization: getAuthHeader()
			}
		});

		return normalizeResponse(response.data);
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Falha ao buscar pré-registros (Status ${error.response?.status || 'desconhecido'})`
			);
		}

		throw error;
	}
}

// Buscando um único cadastro por ID
export async function getPreRegisterById(id: number): Promise<PreRegister> {
	try {
		const response = await axios.get(`${API_URL}/pre-register/${id}/`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: getAuthHeader()
			}
		});

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Falha ao buscar registro (Status ${error.response?.status || 'desconhecido'})`
			);
		}

		throw error;
	}
}

// Criando um novo cadastro
export async function createPreRegister(
	data: Omit<PreRegister, 'id' | 'register_link' | 'created_at' | 'updated_at'>
): Promise<PreRegisterWithEmailError> {
	try {
		const response = await axios.post(`${API_URL}/pre-register/`, data, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: getAuthHeader()
			}
		});

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			const responseData = error.response.data;
			let isEmailError = false;

			// Verificando se é um erro específico de email
			if (
				responseData &&
				responseData.message_error &&
				(responseData.message_error.includes('failed to send email') ||
					responseData.message_error.includes('Failed to send email'))
			) {
				isEmailError = true;

				// Se temos o objeto do pré-cadastro na resposta, retornamos mesmo com erro de email
				if (responseData.id) {
					return { ...responseData, _emailError: true };
				}
			}

			if (!isEmailError) {
				// Criando um erro customizado com os detalhes da API
				const customError = new Error(
					`Falha ao criar pré-registro (Status ${error.response.status})`
				) as ApiError;
				customError.apiError = responseData;
				throw customError;
			}

			// Caso de erro de email sem objeto do pré-cadastro
			if (isEmailError) {
				return {
					id: 0, // ID temporário
					...data,
					register_link: '',
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
					_emailError: true
				};
			}
		}

		throw error;
	}
}

// Atualizando um cadastro
export async function updatePreRegister(
	id: number,
	data: Partial<PreRegister>
): Promise<PreRegister> {
	try {
		// Clonando os dados para não modificar o objeto original
		const cleanedData = { ...data };

		// Removendo os campos que não devem ser enviados
		delete cleanedData.id;
		delete cleanedData.register_link;
		delete cleanedData.created_at;
		delete cleanedData.updated_at;

		// Limpando formatação de CPF e telefone
		if (cleanedData.cpf) {
			cleanedData.cpf = cleanedData.cpf.replace(/\D/g, '');
		}

		if (cleanedData.phone) {
			cleanedData.phone = cleanedData.phone.replace(/\D/g, '');
		}

		// Aseegurando que o status seja um valor válido
		if (cleanedData.status) {
			if (!['pending', 'registered', 'rejected'].includes(cleanedData.status)) {
				cleanedData.status = 'pending';
			}
		}

		// Criando URL explícita com barra final para garantir compatibilidade com a API
		const url = `${API_URL}/pre-register/${id}/`;

		const response = await axios.put(url, cleanedData, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: getAuthHeader()
			}
		});

		// Usando dados da resposta ou fallback para os dados enviados
		const responseData = response.data || {
			...cleanedData,
			id,
			status: cleanedData.status || 'pending'
		};

		// Assegurando que o status seja retornado corretamente
		if (!responseData.status) {
			responseData.status = cleanedData.status || 'pending';
		}

		return responseData as PreRegister;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw {
				message: `Falha ao atualizar pré-registro (Status ${error.response.status})`,
				status: error.response.status,
				apiError: error.response.data
			};
		}

		throw error;
	}
}

// Buscando resumo de status dos cadastros
export async function getStatusSummary(): Promise<StatusSummary> {
	try {
		const response = await axios.get(`${API_URL}/pre-register/status-summary/`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: getAuthHeader()
			}
		});

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error(
				'Erro na resposta da API de resumo:',
				error.response?.status,
				error.response?.data
			);
			throw new Error(
				`Falha ao buscar resumo de status (Status ${error.response?.status || 'desconhecido'})`
			);
		}

		throw error;
	}
}
