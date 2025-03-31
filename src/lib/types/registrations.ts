import type { Assignor, Procedure } from './procedures';

// Interface para procedimento no pré-registro
export interface RegistrationProcedure {
	id?: number;
	procedure: number | Procedure;
	quantity: number;
}

// Status possíveis para um pré-registro
export type RegistrationStatus = 'pending' | 'registered' | 'rejected';

// Interface para pré-registro
export interface Registration {
	id: number;
	user?: string;
	procedures: RegistrationProcedure[];
	assignor: Assignor | number;
	name: string;
	email: string;
	cpf: string;
	phone: string;
	register_link: string;
	status: RegistrationStatus;
	created_at: string;
	updated_at: string;
}

// Interface para formulário de novo pré-registro
export interface RegistrationForm {
	assignor: number;
	procedures: RegistrationProcedure[];
	name: string;
	email: string;
	cpf: string;
	phone: string;
	status: RegistrationStatus;
}

// Interface para erros de formulário de pré-registro
export interface RegistrationFormErrors {
	registration: {
		name: string;
		email: string;
		cpf: string;
		phone: string;
		assignor: string;
		procedures: string;
	};
}

// Interface para o resumo de status
export interface StatusSummary {
	pending: number;
	registered: number;
	rejected: number;
	total: number;
}

// Interface para a resposta paginada da API
export interface PaginatedResponse<T> {
	content: T[];
	page: number;
	size: number;
	total_elements: number;
	total_pages: number;
}
