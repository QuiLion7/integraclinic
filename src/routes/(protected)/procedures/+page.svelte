<script lang="ts">
	import axios, { AxiosError } from 'axios';
	import {
		Plus,
		Search,
		Filter,
		Pencil,
		Trash2,
		FileText,
		FolderOpen,
		Check,
		X,
		ChevronDown
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import {
		type ProcedureCategory,
		type Procedure,
		type ProcessedProcedure,
		type ProcedureForm,
		type CategoryForm,
		type FormErrors
	} from '$lib/types/procedures';
	import ProcedureModal from '$lib/components/procedures/ProcedureModal.svelte';
	import CategoryModal from '$lib/components/procedures/CategoryModal.svelte';
	import DeleteConfirmModal from '$lib/components/procedures/DeleteConfirmModal.svelte';
	import SuccessToast from '$lib/components/procedures/SuccessToast.svelte';

	// Configurando base URL para as requisições
	const API_BASE_URL = 'https://investm-backend-divine-field-7851.fly.dev/api/v1';

	// Props da página
	export let data;

	let searchTerm = '';
	let selectedCategory = 'all';
	let isProcedureModalOpen = false;
	let isCategoryModalOpen = false;
	let isDeleteConfirmModalOpen = false;
	let selectedProcedure: Procedure | null = null;
	let selectedCategoryForEdit: ProcedureCategory | null = null;
	let selectedCategoryForDelete: ProcedureCategory | null = null;
	let isSubmitting = false;
	let error = '';
	let successMessage = '';
	let categories: ProcedureCategory[] = data.categories || [];
	let procedures: Procedure[] = data.procedures || [];
	let token = '';
	let assignorId = 0;
	let showSuccessToast = false;
	let showCategories = true;
	let toastTimeout: ReturnType<typeof setTimeout>;
	let lastAddedCategoryId: number | null = null;
	let highlightTimeout: ReturnType<typeof setTimeout>;

	// Configurando os cards de resumo
	$: summaryCards = [
		{
			title: 'Total de Procedimentos',
			value: procedures.length,
			icon: FileText,
			color: 'blue'
		},
		{
			title: 'Categorias',
			value: categories.length,
			icon: FolderOpen,
			color: 'indigo'
		},
		{
			title: 'Procedimentos Ativos',
			value: procedures.filter((p) => p.isActive).length,
			icon: Check,
			color: 'green'
		},
		{
			title: 'Procedimentos Inativos',
			value: procedures.filter((p) => !p.isActive).length,
			icon: X,
			color: 'red'
		}
	];

	// Estados de validação
	let formErrors: FormErrors = {
		procedure: {
			name: '',
			price: '',
			category: ''
		},
		category: {
			name: ''
		}
	};

	// Dados do formulário
	let newProcedure: ProcedureForm = {
		assignor: 0,
		name: '',
		description: '',
		price: '',
		isActive: true,
		category: 0
	};

	let newCategory: CategoryForm = {
		name: ''
	};

	let displayPrice = '';

	//Formatando um valor numérico para moeda brasileira (R$)
	function formatCurrency(value: string | number): string {
		const numericValue = typeof value === 'string' ? parseFloat(value) : value;
		if (isNaN(numericValue)) return 'R$ 0,00';
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
			minimumFractionDigits: 2
		}).format(numericValue);
	}

	//Formatando uma data no padrão brasileiro (dd/mm/aaaa)
	function formatDate(dateString: string): string {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	// Obtendo token do cookie e configurando dados iniciais
	onMount(async () => {
		token =
			document.cookie
				.split('; ')
				.find((row) => row.startsWith('auth_token='))
				?.split('=')[1] || '';

		// Carregando categorias e procedimentos ao iniciar
		if (token) {
			try {
				// Tente obter assignorId diretamente dos dados exportados pela rota
				if (data.user && data.user.assignor) {
					if (typeof data.user.assignor === 'object' && data.user.assignor !== null) {
						assignorId = data.user.assignor.id || 0;
					} else {
						assignorId = Number(data.user.assignor) || 0;
					}
					newProcedure.assignor = assignorId;
				}
				// Caso não obtenha dos dados da rota, use um valor padrão
				else {
					assignorId = 1; // Valor padrão
					newProcedure.assignor = assignorId;
					console.log('Usando assignorId padrão:', assignorId);
				}

				// Carregar categorias e procedimentos
				await fetchCategories();
				await fetchProcedures();
			} catch (err) {
				console.log('Erro ao carregar dados iniciais, usando configurações padrão:', err);
				assignorId = 1;
				newProcedure.assignor = assignorId;

				// Carregar categorias e procedimentos mesmo com erro
				await fetchCategories();
				await fetchProcedures();
			}
		}

		// Se houver categorias, selecionar a primeira por padrão
		if (categories.length > 0) {
			newProcedure.category = categories[0].id;
		}
	});

	// Atualizando o valor formatado quando o preço muda
	$: {
		if (newProcedure.price) {
			displayPrice = formatCurrency(newProcedure.price);
		} else {
			displayPrice = '';
		}
	}

	// Filtrando os procedimentos com base na busca e categoria selecionada
	$: filteredProcedures = procedures
		.map((proc: Procedure) => {
			// Extraindo o ID da categoria (pode ser um objeto ou um número)
			const categoryId =
				typeof proc.category === 'object' && proc.category !== null
					? Number(proc.category.id)
					: Number(proc.category);

			return {
				...proc,
				categoryId: categoryId, // Adicionando um campo auxiliar com o ID da categoria
				categoryName:
					typeof proc.category === 'object' && proc.category !== null
						? proc.category.name
						: categories.find((c: ProcedureCategory) => Number(c.id) === categoryId)?.name || '-'
			};
		})
		.filter((proc: ProcessedProcedure) => {
			const matchesSearch =
				searchTerm === '' ||
				proc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(proc.description && proc.description.toLowerCase().includes(searchTerm.toLowerCase()));

			const matchesCategory =
				selectedCategory === 'all' || proc.categoryId === parseInt(selectedCategory);

			return matchesSearch && matchesCategory;
		});

	// Função que unifica os diferentes tipos de modais
	function openModal(
		type: 'procedure' | 'category' | 'delete',
		item: Procedure | ProcedureCategory | null = null
	) {
		resetFormErrors();

		if (type === 'procedure') {
			if (item) {
				// Editando um procedimento existente
				const procedure = item as Procedure;
				selectedProcedure = { ...procedure };

				// Extraindo o ID da categoria (pode ser um objeto ou um número)
				const categoryId =
					typeof procedure.category === 'object' && procedure.category !== null
						? Number(procedure.category.id)
						: Number(procedure.category);

				// Preparando os dados do formulário
				newProcedure = {
					assignor:
						typeof procedure.assignor === 'object' ? procedure.assignor.id : procedure.assignor,
					name: procedure.name,
					description: procedure.description || '',
					price: procedure.price,
					isActive: procedure.isActive,
					category: categoryId
				};

				displayPrice = formatCurrency(procedure.price);
			} else {
				// Criando novo procedimento
				newProcedure = {
					assignor: assignorId,
					name: '',
					description: '',
					price: '',
					isActive: true,
					category: categories.length > 0 ? Number(categories[0].id) : 0
				};
				selectedProcedure = null;
				displayPrice = '';
			}
			isProcedureModalOpen = true;
		} else if (type === 'category') {
			if (item) {
				// Editando categoria existente
				const category = item as ProcedureCategory;
				newCategory = { name: category.name };
				selectedCategoryForEdit = category;
			} else {
				// Criando nova categoria
				newCategory = { name: '' };
				selectedCategoryForEdit = null;
			}
			isCategoryModalOpen = true;
		} else if (type === 'delete') {
			// Confirmação de exclusão de categoria
			selectedCategoryForDelete = item as ProcedureCategory;
			isDeleteConfirmModalOpen = true;
		}
	}

	function closeProcedureModal() {
		isProcedureModalOpen = false;
		selectedProcedure = null;
		error = '';
		resetFormErrors();
	}

	function closeCategoryModal() {
		isCategoryModalOpen = false;
		selectedCategoryForEdit = null;
		error = '';
		resetFormErrors();
	}

	function closeDeleteConfirmModal() {
		isDeleteConfirmModalOpen = false;
		selectedCategoryForDelete = null;
		error = '';
	}

	function resetFormErrors() {
		formErrors = {
			procedure: {
				name: '',
				price: '',
				category: ''
			},
			category: {
				name: ''
			}
		};
		error = '';
	}

	// Mostrando mensagem de sucesso
	function showToast(message: string) {
		successMessage = message;
		showSuccessToast = true;

		// Limpando o timeout anterior se existir
		if (toastTimeout) clearTimeout(toastTimeout);

		// Escondendo o toast após 5 segundos
		toastTimeout = setTimeout(() => {
			showSuccessToast = false;
		}, 5000);
	}

	// Destacando visualmente a categoria recém-adicionada
	function highlightNewCategory(id: number) {
		if (highlightTimeout) clearTimeout(highlightTimeout);
		lastAddedCategoryId = id;
		highlightTimeout = setTimeout(() => {
			lastAddedCategoryId = null;
		}, 5000);
	}

	// Validando os formulários
	function validateProcedureForm(): boolean {
		let isValid = true;

		// Validando nome
		if (!newProcedure.name.trim()) {
			formErrors.procedure.name = 'O nome do procedimento é obrigatório';
			isValid = false;
		} else if (newProcedure.name.length < 3) {
			formErrors.procedure.name = 'O nome deve ter pelo menos 3 caracteres';
			isValid = false;
		} else {
			formErrors.procedure.name = '';
		}

		// Validando preço
		if (!newProcedure.price) {
			formErrors.procedure.price = 'O preço é obrigatório';
			isValid = false;
		} else {
			const priceValue = parseFloat(newProcedure.price);
			if (isNaN(priceValue) || priceValue <= 0) {
				formErrors.procedure.price = 'O preço deve ser um valor positivo';
				isValid = false;
			} else {
				formErrors.procedure.price = '';
			}
		}

		// Validando categoria
		if (!newProcedure.category) {
			formErrors.procedure.category = 'Selecione uma categoria';
			isValid = false;
		} else {
			formErrors.procedure.category = '';
		}

		return isValid;
	}

	function validateCategoryForm(): boolean {
		let isValid = true;

		// Validando nome
		if (!newCategory.name.trim()) {
			formErrors.category.name = 'O nome da categoria é obrigatório';
			isValid = false;
		} else if (newCategory.name.length < 3) {
			formErrors.category.name = 'O nome deve ter pelo menos 3 caracteres';
			isValid = false;
		} else {
			// Verificando se a categoria já existe
			const categoryExists = categories.some(
				(category: ProcedureCategory) =>
					category.name.toLowerCase() === newCategory.name.toLowerCase() &&
					(!selectedCategoryForEdit || category.id !== selectedCategoryForEdit.id)
			);

			if (categoryExists) {
				formErrors.category.name = `A categoria "${newCategory.name}" já existe`;
				isValid = false;
			} else {
				formErrors.category.name = '';
			}
		}

		return isValid;
	}

	// Manipulando o preço
	function handlePriceInput(event: Event) {
		const input = event.target as HTMLInputElement;
		let cursorPosition = input.selectionStart || 0;
		const previousValue = displayPrice;

		// Removendo todos os caracteres não numéricos e preservando apenas os dígitos
		let value = input.value.replace(/\D/g, '');

		if (previousValue.length > input.value.length && cursorPosition < previousValue.length) {
			// Detectando se o usuário está apagando caracteres
			const numericPreviousValue = previousValue.replace(/\D/g, '');
			if (value.length === numericPreviousValue.length) {
				// Se o comprimento dos dígitos for o mesmo, mas o valor bruto é diferente,
				// o usuário está tentando apagar um separador (R$, ponto, vírgula)
				// Removemos então o dígito à esquerda do cursor
				const beforeCursor = value.substring(0, Math.max(0, cursorPosition - 1));
				const afterCursor = value.substring(cursorPosition);
				value = beforeCursor + afterCursor;
			}
		}

		if (value) {
			// Convertendo para centavos
			const cents = parseInt(value, 10);

			// Convertendo centavos para formato monetário (divide por 100)
			const valueAsNumber = cents / 100;

			// Formatando o valor para exibição
			displayPrice = formatCurrency(valueAsNumber);

			// Atualizando o valor real no objeto de procedimento
			newProcedure.price = valueAsNumber.toString();

			// Calculando a nova posição do cursor
			setTimeout(() => {
				// Ajustando a posição do cursor após a formatação
				const newCursorPosition = Math.max(
					displayPrice.length - (previousValue.length - cursorPosition),
					displayPrice.indexOf(',') + 1
				);
				input.setSelectionRange(newCursorPosition, newCursorPosition);
			}, 0);
		} else {
			displayPrice = '';
			newProcedure.price = '';
		}
	}
	interface ApiErrorResponse {
		detail?: string;
		error?: string;
		[key: string]: any;
	}

	//Buscando todos os procedimentos do cedente logado

	async function fetchProcedures() {
		try {
			const response = await axios.get(
				`${API_BASE_URL}/assignor/procedure/?assignor=${assignorId}`,
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);

			procedures = response.data.results || (Array.isArray(response.data) ? response.data : []);

			// Se não houver procedimentos, verificando se há algum problema
			if (procedures.length === 0) {
				console.log(
					'Nenhum procedimento encontrado. Verifique os filtros ou crie um novo procedimento.'
				);
			}
		} catch (err: unknown) {
			const axiosError = err as AxiosError<ApiErrorResponse>;
			error = axiosError.response?.data?.detail || 'Erro ao buscar procedimentos';
		}
	}

	//Buscando todas as categorias de procedimentos
	async function fetchCategories() {
		try {
			const response = await axios.get(`${API_BASE_URL}/assignor/procedure-category/`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			// Garantindo que todas as categorias tenham IDs numéricos
			categories = (response.data.results || response.data || []).map((cat: any) => ({
				...cat,
				id: Number(cat.id)
			}));
		} catch (err: unknown) {
			const axiosError = err as AxiosError<ApiErrorResponse>;
			console.error('Erro ao buscar categorias:', axiosError);
			error = axiosError.response?.data?.detail || 'Erro ao buscar categorias';
		}
	}

	//Operações de API para categorias (criar, atualizar, excluir)

	async function deleteProcedureCategory(id: number) {
		try {
			await axios.delete(`${API_BASE_URL}/assignor/procedure-category/${id}/`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			return true;
		} catch (err: unknown) {
			const axiosError = err as AxiosError<ApiErrorResponse>;
			console.error('Erro na requisição:', axiosError);
			let errorMessage = `Erro ao excluir categoria`;

			if (axiosError.response?.data?.detail) {
				errorMessage = axiosError.response.data.detail;
			} else if (axiosError.response?.data?.error) {
				errorMessage = axiosError.response.data.error;
			}

			throw new Error(errorMessage);
		}
	}

	async function createProcedureCategory(data: { name: string; assignor: number }) {
		try {
			const response = await axios.post(`${API_BASE_URL}/assignor/procedure-category/`, data, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			return response.data;
		} catch (err: unknown) {
			const axiosError = err as AxiosError<ApiErrorResponse>;
			console.error('Erro ao criar categoria:', axiosError);

			// Verificar se é um erro de categoria duplicada
			if (axiosError.response?.data?.error?.includes('already exists')) {
				throw new Error(`A categoria "${data.name}" já existe no sistema.`);
			}

			if (axiosError.response?.data?.detail) {
				throw new Error(axiosError.response.data.detail);
			}

			throw new Error('Falha ao criar categoria');
		}
	}

	async function updateProcedureCategory(id: number, data: { name: string }) {
		try {
			const response = await axios.patch(
				`${API_BASE_URL}/assignor/procedure-category/${id}/`,
				data,
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`
					}
				}
			);

			return response.data;
		} catch (err: unknown) {
			const axiosError = err as AxiosError<ApiErrorResponse>;
			console.error('Erro ao atualizar categoria:', axiosError);

			if (axiosError.response?.data?.detail) {
				throw new Error(axiosError.response.data.detail);
			}

			throw new Error('Falha ao atualizar categoria');
		}
	}

	//Operações de API para procedimentos (criar, atualizar)

	async function createProcedure(data: ProcedureForm) {
		try {
			const response = await axios.post(`${API_BASE_URL}/assignor/procedure/`, data, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			return response.data;
		} catch (err: unknown) {
			const axiosError = err as AxiosError<ApiErrorResponse>;
			console.error('Erro ao criar procedimento:', axiosError);

			if (axiosError.response?.data?.detail) {
				throw new Error(axiosError.response.data.detail);
			}

			throw new Error(`Falha ao criar procedimento: ${axiosError.message}`);
		}
	}

	async function updateProcedure(id: number, data: ProcedureForm) {
		try {
			const response = await axios.put(`${API_BASE_URL}/assignor/procedure/${id}/`, data, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				}
			});

			return response.data || { id };
		} catch (err: unknown) {
			const axiosError = err as AxiosError<ApiErrorResponse>;
			console.error('Erro ao atualizar procedimento:', axiosError);

			if (axiosError.response?.data?.detail) {
				throw new Error(axiosError.response.data.detail);
			} else if (axiosError.response?.data) {
				const errorMessages = [];
				for (const field in axiosError.response.data) {
					if (Array.isArray(axiosError.response.data[field])) {
						errorMessages.push(`${field}: ${axiosError.response.data[field].join(', ')}`);
					}
				}
				if (errorMessages.length > 0) {
					throw new Error(`Erros de validação: ${errorMessages.join('; ')}`);
				}
			}

			throw new Error(`Falha ao atualizar procedimento: ${axiosError.message}`);
		}
	}

	async function handleProcedureSubmit(e: SubmitEvent) {
		e.preventDefault();

		// Validando formulário antes de enviar
		if (!validateProcedureForm()) return;

		try {
			isSubmitting = true;
			error = '';

			if (selectedProcedure) {
				// Atualizando procedimento existente
				const completeData = {
					assignor: newProcedure.assignor || assignorId,
					name: newProcedure.name,
					description: newProcedure.description || '',
					price: newProcedure.price,
					isActive: newProcedure.isActive,
					category: newProcedure.category
				};

				await updateProcedure(selectedProcedure.id, completeData);
				showToast('Procedimento atualizado com sucesso!');
			} else {
				// Criando novo procedimento
				await createProcedure(newProcedure);
				showToast('Procedimento criado com sucesso!');
			}

			// Atualizando a lista de procedimentos
			await fetchProcedures();
			closeProcedureModal();
		} catch (err) {
			console.error('Erro detalhado:', err);
			error = err instanceof Error ? err.message : 'Erro ao salvar procedimento';
		} finally {
			isSubmitting = false;
		}
	}

	async function handleCategorySubmit(e: SubmitEvent) {
		e.preventDefault();

		// Validando formulário antes de enviar
		if (!validateCategoryForm()) return;

		try {
			isSubmitting = true;
			error = '';

			if (selectedCategoryForEdit) {
				// Atualizando categoria existente
				await updateProcedureCategory(selectedCategoryForEdit.id, newCategory);
				showToast('Categoria atualizada com sucesso!');
			} else {
				// Criando nova categoria
				const categoryPayload = {
					name: newCategory.name,
					assignor: assignorId
				};

				const categoryData = await createProcedureCategory(categoryPayload);
				showToast('Categoria criada com sucesso!');
				if (categoryData?.id) {
					highlightNewCategory(categoryData.id);
				}
			}

			// Atualizando a lista de categorias
			await fetchCategories();
			closeCategoryModal();
		} catch (err) {
			console.error('Erro detalhado:', err);
			error = err instanceof Error ? err.message : 'Erro ao salvar categoria';
		} finally {
			isSubmitting = false;
		}
	}

	async function handleCategoryDelete() {
		if (!selectedCategoryForDelete) return;

		try {
			isSubmitting = true;
			error = '';

			// Verificando se há procedimentos usando a categoria
			const proceduresUsingCategory = procedures.filter(
				(p: Procedure) => p.category === selectedCategoryForDelete?.id
			);

			if (proceduresUsingCategory.length > 0) {
				throw new Error(
					`Não é possível excluir esta categoria porque existem ${proceduresUsingCategory.length} procedimentos associados a ela.`
				);
			}

			await deleteProcedureCategory(selectedCategoryForDelete.id);
			showToast('Categoria excluída com sucesso!');

			// Atualizando a lista de categorias
			await fetchCategories();
			closeDeleteConfirmModal();
		} catch (err) {
			console.error('Erro detalhado:', err);
			if (err instanceof Error) {
				error = err.message;
				showToast(err.message);
			} else {
				error = 'Erro ao excluir categoria';
				showToast('Erro ao excluir categoria. Verifique o console para mais detalhes.');
			}
		} finally {
			isSubmitting = false;
			closeDeleteConfirmModal();
		}
	}
</script>

<ProcedureModal
	bind:isProcedureModalOpen
	bind:newProcedure
	bind:displayPrice
	bind:isSubmitting
	bind:error
	{formErrors}
	{categories}
	{selectedProcedure}
	onClose={() => closeProcedureModal()}
	onSubmit={(e) => handleProcedureSubmit(e)}
	onPriceInput={(e) => handlePriceInput(e)}
/>

<CategoryModal
	bind:isCategoryModalOpen
	bind:newCategory
	bind:isSubmitting
	bind:error
	{formErrors}
	{selectedCategoryForEdit}
	onClose={() => closeCategoryModal()}
	onSubmit={(e) => handleCategorySubmit(e)}
/>

<DeleteConfirmModal
	bind:isDeleteConfirmModalOpen
	bind:isSubmitting
	bind:error
	{selectedCategoryForDelete}
	onClose={() => closeDeleteConfirmModal()}
	onDelete={() => handleCategoryDelete()}
/>

<SuccessToast bind:showSuccessToast {successMessage} onClose={() => (showSuccessToast = false)} />

<div class="mx-auto max-w-7xl px-4 py-2 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
	<div class="flex flex-col sm:flex sm:gap-2 lg:flex-row">
		<div class="sm:flex-auto">
			<h1 class="text-xl font-semibold text-gray-900 uppercase">Procedimentos</h1>
			<p class="mt-2 text-sm text-gray-700">
				Gerencie os procedimentos e categorias disponíveis para agendamento.
			</p>
		</div>
		<div class="mt-4 sm:mt-0 sm:flex sm:items-center sm:space-x-4">
			<button
				type="button"
				class="inline-flex cursor-pointer items-center justify-center space-x-2 rounded-lg border border-sky-600 bg-white px-2 py-2 text-xs font-semibold text-sky-600 shadow-sm transition duration-200 hover:bg-sky-50 sm:text-sm"
				on:click={() => openModal('category')}
			>
				<Plus class="h-3 w-3 sm:h-5 sm:w-5" />
				<span>Nova Categoria</span>
			</button>
			<button
				type="button"
				class="inline-flex cursor-pointer items-center justify-center space-x-2 rounded-lg bg-sky-600 px-2 py-2 text-xs font-semibold text-white shadow-sm transition duration-200 hover:bg-sky-700 sm:text-sm"
				on:click={() => openModal('procedure')}
			>
				<Plus class="h-3 w-3 sm:h-5 sm:w-5" />
				<span>Novo Procedimento</span>
			</button>
		</div>
	</div>

	<!-- Mensagem de erro global -->
	{#if error}
		<div class="mt-4 rounded-md bg-red-50 p-4">
			<div class="flex">
				<div class="flex-shrink-0">
					<X class="h-5 w-5 text-red-400" />
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-red-800">
						{error}
					</h3>
				</div>
			</div>
		</div>
	{/if}

	<!-- Cards de estatísticas -->
	<div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
		{#each summaryCards as card}
			<div
				class="group relative h-[115px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
			>
				<!-- Faixa colorida no topo-->
				<div
					class="absolute top-0 right-0 left-0 h-1.5"
					class:bg-blue-500={card.color === 'blue'}
					class:bg-indigo-500={card.color === 'indigo'}
					class:bg-green-500={card.color === 'green'}
					class:bg-red-500={card.color === 'red'}
				></div>

				<div class="flex h-full flex-col justify-center p-6 pt-7">
					<div class="relative">
						<div class="flex items-center">
							<div class="flex-shrink-0">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-md"
									class:bg-blue-100={card.color === 'blue'}
									class:text-blue-600={card.color === 'blue'}
									class:bg-indigo-100={card.color === 'indigo'}
									class:text-indigo-600={card.color === 'indigo'}
									class:bg-green-100={card.color === 'green'}
									class:text-green-600={card.color === 'green'}
									class:bg-red-100={card.color === 'red'}
									class:text-red-600={card.color === 'red'}
								>
									<svelte:component this={card.icon} class="h-6 w-6" />
								</div>
							</div>
							<div class="ml-5 w-0 flex-1">
								<dl>
									<dt class="truncate text-sm font-medium text-gray-500">{card.title}</dt>
									<dd class="mt-2">
										<div class="text-2xl font-semibold text-gray-900">
											{card.value}
										</div>
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>

				<!-- Efeito de gradiente no hover -->
				<div
					class="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10"
					class:bg-gradient-to-br={true}
					class:from-blue-100={card.color === 'blue'}
					class:via-blue-50={card.color === 'blue'}
					class:from-indigo-100={card.color === 'indigo'}
					class:via-indigo-50={card.color === 'indigo'}
					class:from-green-100={card.color === 'green'}
					class:via-green-50={card.color === 'green'}
					class:from-red-100={card.color === 'red'}
					class:via-red-50={card.color === 'red'}
					class:to-transparent={true}
				></div>
			</div>
		{/each}
	</div>

	<!-- Filtros e Pesquisa -->
	<div
		class="my-6 flex flex-col justify-between gap-4 rounded-lg bg-white p-4 shadow-sm md:flex-row"
	>
		<div class="relative flex-1">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<Search class="h-5 w-5 text-gray-400" />
			</div>
			<input
				type="text"
				name="search"
				id="search"
				bind:value={searchTerm}
				class="block w-full rounded-md border-gray-300 pl-10 focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
				placeholder="Buscar por nome ou descrição..."
			/>
		</div>
		<div class="w-full flex-shrink-0 md:w-48">
			<div class="relative">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<Filter class="h-5 w-5 text-gray-400" />
				</div>
				<select
					id="category"
					name="category"
					bind:value={selectedCategory}
					class="block w-full rounded-md border-gray-300 pl-10 focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
				>
					<option value="all">Todas as categorias</option>
					{#each categories as category}
						<option value={category.id}>{category.name}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Conteúdo Principal -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
		<!-- Seção de Categorias -->
		<div class="lg:col-span-1">
			<div class="sticky top-4">
				<div class="rounded-lg bg-white shadow-sm">
					<div class="border-b border-gray-200 p-4">
						<div class="flex items-center justify-between">
							<h2 class="text-lg font-medium text-gray-900">Categorias</h2>
							<button
								type="button"
								class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
								on:click={() => (showCategories = !showCategories)}
								aria-label={showCategories ? 'Recolher categorias' : 'Expandir categorias'}
							>
								<span
									class="transform transition-transform duration-200"
									class:rotate-180={!showCategories}
								>
									<ChevronDown class="h-5 w-5" />
								</span>
							</button>
						</div>
					</div>
					{#if showCategories}
						<div class="divide-y divide-gray-200">
							{#if categories.length === 0}
								<div class="p-4 text-center text-sm text-gray-500">
									Nenhuma categoria encontrada
								</div>
							{:else}
								{#each categories as category}
									<div
										class="group relative p-4 transition-colors duration-200 hover:bg-gray-50"
										class:bg-sky-50={lastAddedCategoryId === category.id}
									>
										<div class="flex items-center">
											<div
												class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600"
											>
												<FolderOpen class="h-4 w-4" />
											</div>
											<div class="min-w-0 flex-1">
												<h3 class="truncate text-sm font-medium text-gray-900">{category.name}</h3>
												<div class="mt-1 flex items-center">
													<span
														class="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-700"
													>
														{procedures.filter((p) => {
															const categoryId =
																typeof p.category === 'object' ? p.category.id : p.category;
															return categoryId === category.id;
														}).length} procedimento{procedures.filter((p) => {
															const categoryId =
																typeof p.category === 'object' ? p.category.id : p.category;
															return categoryId === category.id;
														}).length !== 1
															? 's'
															: ''}
													</span>
												</div>
											</div>
											<div class="ml-2 flex opacity-0 transition-opacity group-hover:opacity-100">
												<button
													type="button"
													class="rounded p-1 text-sky-600 hover:bg-sky-50"
													on:click={() => openModal('category', category)}
												>
													<Pencil class="h-4 w-4" />
												</button>
												<button
													type="button"
													class="rounded p-1 text-red-600 hover:bg-red-50"
													on:click={() => openModal('delete', category)}
												>
													<Trash2 class="h-4 w-4" />
												</button>
											</div>
										</div>
									</div>
								{/each}
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Lista de Procedimentos -->
		<div class="lg:col-span-3">
			<div class="rounded-lg bg-white shadow-sm">
				<div class="border-b border-gray-200 p-4">
					<h2 class="text-lg font-medium text-gray-900">Procedimentos</h2>
				</div>
				<div class="p-4">
					{#if filteredProcedures.length === 0}
						<div class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
							<FileText class="mx-auto h-12 w-12 text-gray-400" />
							<h3 class="mt-2 text-sm font-medium text-gray-900">Nenhum procedimento encontrado</h3>
							<p class="mt-1 text-sm text-gray-500">
								{searchTerm || selectedCategory !== 'all'
									? 'Tente ajustar seus filtros de busca'
									: 'Comece criando um novo procedimento'}
							</p>
							<div class="mt-6">
								<button
									type="button"
									class="inline-flex items-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-sky-600"
									on:click={() => openModal('procedure')}
								>
									<Plus class="mr-1.5 -ml-0.5 h-5 w-5" aria-hidden="true" />
									Novo Procedimento
								</button>
							</div>
						</div>
					{:else}
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{#each filteredProcedures as procedure}
								<div
									class="group relative h-[220px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
								>
									<!-- Faixa de status no topo -->
									<div
										class="absolute top-0 right-0 left-0 h-1.5"
										class:bg-green-500={procedure.isActive}
										class:bg-red-500={!procedure.isActive}
									></div>

									<div class="flex h-[175px] flex-col p-6 pt-8">
										<div class="flex flex-col gap-2">
											<div class="flex flex-col gap-1">
												<div class="flex items-center justify-between">
													<h3 class="text-lg font-medium text-gray-900">
														<span class="truncate" title={procedure.name}>{procedure.name}</span>
													</h3>
												</div>
												<div class="flex items-center gap-2">
													<span
														class="inline-flex w-fit items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800"
													>
														{procedure.categoryName}
													</span>
													{#if procedure.isActive}
														<span
															class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
														>
															Ativo
														</span>
													{:else}
														<span
															class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
														>
															Inativo
														</span>
													{/if}
												</div>
											</div>

											<p
												class="line-clamp-2 flex-grow text-sm text-gray-500"
												title={procedure.description || 'Sem descrição'}
											>
												{procedure.description || 'Sem descrição'}
											</p>

											<div class="mt-auto flex items-center justify-between">
												<div class="text-lg font-semibold text-gray-900">
													{formatCurrency(procedure.price)}
												</div>
												<button
													type="button"
													class="rounded-full p-2 text-sky-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-sky-50"
													on:click={() => openModal('procedure', procedure)}
												>
													<Pencil class="h-4 w-4" />
												</button>
											</div>
										</div>
									</div>

									<div class="flex justify-between border-t border-gray-200 bg-gray-50 px-4 py-2">
										<div class="text-xs text-gray-500">
											Criado em: {formatDate(procedure.created_at)}
										</div>
										<div class="text-xs text-gray-500">
											Editado em: {formatDate(procedure.updated_at)}
										</div>
									</div>

									<!-- Efeito de gradiente no hover -->
									<div
										class="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10"
										class:bg-gradient-to-br={true}
										class:from-green-200={procedure.isActive}
										class:via-green-100={procedure.isActive}
										class:from-red-200={!procedure.isActive}
										class:via-red-100={!procedure.isActive}
										class:to-transparent={true}
									></div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
