// Interface para a categoria de procedimento
export interface ProcedureCategory {
	id: number;
	name: string;
	created_at: string;
	updated_at: string;
}

// Interface para o cedente (assignor)
export interface Assignor {
	id: number;
	user: number;
	fantasy_name: string;
	social_reason: string;
	cnpj: string;
	phone: string;
	email: string;
	responsible_name: string;
	responsible_email: string;
	responsible_phone: string;
	status: string;
	created_at: string;
	updated_at: string;
	address: number;
}

// Interface para procedimento
export interface Procedure {
	id: number;
	assignor: Assignor | number;
	name: string;
	description: string;
	price: string;
	isActive: boolean;
	created_at: string;
	updated_at: string;
	category: ProcedureCategory | number;
}

// Interface para procedimento processado (com campos auxiliares)
export interface ProcessedProcedure extends Procedure {
	categoryId?: number;
	categoryName?: string;
}

// Interface para formulário de novo procedimento
export interface ProcedureForm {
	assignor: number;
	name: string;
	description: string;
	price: string;
	isActive: boolean;
	category: number;
}

// Interface para formulário de nova categoria
export interface CategoryForm {
	name: string;
}

// Interface para erros de formulário
export interface FormErrors {
	procedure: {
		name: string;
		price: string;
		category: string;
	};
	category: {
		name: string;
	};
}
