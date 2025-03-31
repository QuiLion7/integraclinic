import axios from 'axios';
import { API_URL } from '$lib/config';
import { getAuthHeader } from '$lib/utils/auth';
import type { ProcedureCategory } from '$lib/types/procedures';

export interface CategoryResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: ProcedureCategory[];
}
export interface CategoryPayload {
	name: string;
	assignor: number;
}

//Buscando todas as categorias de procedimentos

export async function getCategories(): Promise<ProcedureCategory[]> {
	try {
		const response = await axios.get(`${API_URL}/assignor/procedure-category/`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: getAuthHeader()
			}
		});

		const data: CategoryResponse = response.data;
		return data.results || [];
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Falha ao buscar categorias (Status ${error.response?.status || 'desconhecido'})`
			);
		}

		throw error;
	}
}

//Criando uma nova categoria de procedimento
export async function createCategory(data: CategoryPayload): Promise<ProcedureCategory> {
	try {
		const response = await axios.post(`${API_URL}/assignor/procedure-category/`, data, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: getAuthHeader()
			}
		});

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.data) {
			if (error.response.data.detail) {
				throw new Error(error.response.data.detail);
			}
		}

		// Erro genérico caso não seja possível obter detalhes específicos
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Falha ao criar categoria (Status ${error.response?.status || 'desconhecido'})`
			);
		}

		throw error;
	}
}

//Atualiza uma categoria existente

export async function updateCategory(
	id: number,
	data: Partial<CategoryPayload>
): Promise<ProcedureCategory> {
	try {
		const response = await axios.patch(`${API_URL}/assignor/procedure-category/${id}/`, data, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: getAuthHeader()
			}
		});

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.data) {
			if (error.response.data.detail) {
				throw new Error(error.response.data.detail);
			}
		}

		// Erro genérico caso não seja possível obter detalhes específicos
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Falha ao atualizar categoria (Status ${error.response?.status || 'desconhecido'})`
			);
		}

		throw error;
	}
}

//Exclui uma categoria

export async function deleteCategory(id: number): Promise<boolean> {
	try {
		await axios.delete(`${API_URL}/assignor/procedure-category/${id}/`, {
			headers: {
				Authorization: getAuthHeader()
			}
		});

		return true;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.data) {
			if (error.response.data.detail) {
				throw new Error(error.response.data.detail);
			}
		}

		// Erro genérico caso não seja possível obter detalhes específicos
		if (axios.isAxiosError(error)) {
			throw new Error(
				`Falha ao excluir categoria (Status ${error.response?.status || 'desconhecido'})`
			);
		}

		throw error;
	}
}
