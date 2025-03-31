<script lang="ts">
	import { Plus, Search, Filter, Pencil, Loader2, X, FileText, Users, Check } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { getAuthToken } from '$lib/utils/auth';
	import RegistrationModal from '../../../lib/components/procedures/RegistrationModal.svelte';
	import {
		getPreRegisters,
		getStatusSummary,
		type PreRegister,
		type StatusSummary
	} from '$lib/services/preRegisterService';

	// Props da página
	export let data;

	let searchTerm = '';
	let statusFilter: string = 'all';
	let isModalOpen = false;
	let modalMode: 'create' | 'edit' | 'analyze' = 'create';
	let selectedRegistration: PreRegister | undefined = undefined;
	let registrations: PreRegister[] = [];
	let statusSummary: StatusSummary = { pending: 0, registered: 0, rejected: 0, total: 0 };
	let isLoading = false;
	let error = '';
	let successMessage = '';
	let showSuccessToast = false;
	let toastTimeout: ReturnType<typeof setTimeout>;
	let tokenInfo = { token: '', isValid: false };

	// Definindo a configuração dos cards de resumo
	$: summaryCards = [
		{
			title: 'Total de Cadastros',
			value: statusSummary.total,
			icon: FileText,
			color: 'blue',
			group: 'registrations'
		},
		{
			title: 'Pendentes',
			value: statusSummary.pending,
			icon: Loader2,
			color: 'yellow',
			group: 'registrations'
		},
		{
			title: 'Ativos',
			value: statusSummary.registered,
			icon: Check,
			color: 'green',
			group: 'registrations'
		},
		{
			title: 'Rejeitados',
			value: statusSummary.rejected,
			icon: X,
			color: 'red',
			group: 'registrations'
		}
	];

	// Definindo a configuração de status para exibição
	const statusConfig = {
		pending: {
			color: 'bg-yellow-100 text-yellow-800',
			label: 'Pendente'
		},
		registered: {
			color: 'bg-green-100 text-green-800',
			label: 'Ativo'
		},
		rejected: {
			color: 'bg-red-100 text-red-800',
			label: 'Rejeitado'
		}
	};

	onMount(() => {
		// Verificando o token de autenticação
		const token = getAuthToken();
		tokenInfo = { token, isValid: !!token };

		if (!tokenInfo.isValid) {
			error = 'Sessão expirada ou não autenticada. Por favor, faça login novamente.';
			setTimeout(() => goto('/'), 2000);
			return;
		}

		// Verificando os dados no servidor
		if (data.error) {
			error = data.error;
		}

		// Se tivermos dados no servidor, vamos usar
		if (Array.isArray(data.registrations) && data.registrations.length > 0) {
			registrations = data.registrations;
		} else {
			// Se não tivermos os dados no servidor, tentamos buscar via client-side
			fetchData();
		}

		// Carregando o resumo de status
		if (data.statusSummary) {
			statusSummary = data.statusSummary;
		}
	});

	function formatDate(dateString: string): string {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	// Filtrando os registros
	$: filteredRegistrations = registrations.filter((registration) => {
		// Verificando se o registro corresponde à busca
		const matchesSearch =
			!searchTerm ||
			(registration.name && registration.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(registration.cpf && registration.cpf.includes(searchTerm)) ||
			(registration.email && registration.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(registration.phone && registration.phone.includes(searchTerm));

		// Verificando se o registro corresponde ao filtro de status
		const matchesStatus = statusFilter === 'all' || registration.status === statusFilter;

		// Retornando verdadeiro se ambas as condições forem atendidas
		return matchesSearch && matchesStatus;
	});

	// Buscando os dados de cadastros e resumo de status
	async function fetchData() {
		isLoading = true;
		error = '';

		try {
			// Carregando cadastros
			const preRegisterResponse = await getPreRegisters({});

			if (preRegisterResponse && Array.isArray(preRegisterResponse.results)) {
				registrations = preRegisterResponse.results;
			} else if (Array.isArray(preRegisterResponse)) {
				registrations = preRegisterResponse;
			} else {
				console.error('Formato inesperado da resposta da API:', preRegisterResponse);
				error = 'Formato de resposta inesperado da API';
			}

			// Carregando resumo de status
			const summary = await getStatusSummary();
			if (summary) {
				statusSummary = summary;
			}
		} catch (err: any) {
			console.error('Erro ao buscar dados:', err);
			error = err.message || 'Erro ao carregar dados. Por favor, tente novamente.';
		} finally {
			isLoading = false;
		}
	}

	function openModal(mode: 'create' | 'edit' | 'analyze', registration?: PreRegister) {
		modalMode = mode;
		selectedRegistration = registration ? { ...registration } : undefined;
		isModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
		selectedRegistration = undefined;
	}

	function showToast(message: string, type: 'success' | 'error' = 'success') {
		successMessage = message;
		showSuccessToast = true;

		// Escondendo o toast automaticamente após 5 segundos
		clearTimeout(toastTimeout);
		toastTimeout = setTimeout(() => {
			showSuccessToast = false;
		}, 5000);
	}

	function closeToast() {
		showSuccessToast = false;
		clearTimeout(toastTimeout);
	}

	// Processando operação de conclusão com sucesso
	async function handleSuccess(message: string, data?: any) {
		closeModal();

		showToast(message, 'success');

		// Aguardando antes de recarregar os dados
		setTimeout(async () => {
			try {
				// Limpando os filtros
				statusFilter = 'all';
				searchTerm = '';

				// Recarregando os dados
				await fetchData();
			} catch (error) {
				console.error('Erro ao recarregar dados:', error);
				showToast('Erro ao atualizar lista de pré-registros', 'error');
			}
		}, 1000);
	}
</script>

<!-- Se o usuário não não estiver autenticado, mostrar mensagem -->
{#if !tokenInfo.isValid}
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<div class="rounded-md bg-red-50 p-4">
			<div class="flex">
				<div class="flex-shrink-0">
					<X class="h-5 w-5 text-red-400" />
				</div>
				<div class="ml-3">
					<h3 class="text-sm font-medium text-red-800">
						Sessão expirada ou não autenticada. Redirecionando para a página de login...
					</h3>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="mx-auto max-w-7xl px-4 py-2 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
		<!-- Cabeçalho da página -->
		<div class="sm:flex sm:items-center">
			<div class="sm:flex-auto">
				<h1 class="text-xl font-semibold text-gray-900 uppercase">Cadastros</h1>
				<p class="mt-2 text-sm text-gray-700">
					Gerenciamento de cadastros de pacientes no sistema.
				</p>
			</div>
			<div class="mt-4 sm:mt-0 sm:flex sm:items-center sm:space-x-4">
				<button
					type="button"
					class="inline-flex cursor-pointer items-center justify-center space-x-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-sky-700"
					on:click={() => openModal('create')}
				>
					<Plus class="h-5 w-5" />
					<span>Novo Cadastro</span>
				</button>
			</div>
		</div>

		<div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{#each summaryCards as card}
				<div
					class="group relative overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
				>
					<!-- Faixa colorida no topo-->
					<div
						class="absolute top-0 right-0 left-0 h-1.5"
						class:bg-blue-500={card.color === 'blue'}
						class:bg-green-500={card.color === 'green'}
						class:bg-yellow-500={card.color === 'yellow'}
						class:bg-red-500={card.color === 'red'}
					></div>

					<div class="p-6 pt-7">
						<div class="relative">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<div
										class="flex h-12 w-12 items-center justify-center rounded-md"
										class:bg-blue-100={card.color === 'blue'}
										class:text-blue-600={card.color === 'blue'}
										class:bg-green-100={card.color === 'green'}
										class:text-green-600={card.color === 'green'}
										class:bg-yellow-100={card.color === 'yellow'}
										class:text-yellow-600={card.color === 'yellow'}
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
						class:from-green-100={card.color === 'green'}
						class:via-green-50={card.color === 'green'}
						class:from-yellow-100={card.color === 'yellow'}
						class:via-yellow-50={card.color === 'yellow'}
						class:from-red-100={card.color === 'red'}
						class:via-red-50={card.color === 'red'}
						class:to-transparent={true}
					></div>
				</div>
			{/each}
		</div>

		<!-- Filtros e busca -->
		<div
			class="my-6 flex flex-col justify-between gap-4 rounded-lg bg-white p-4 shadow-sm md:flex-row"
		>
			<div class="relative flex-1">
				<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<Search class="h-5 w-5 text-gray-400" />
				</div>
				<input
					type="text"
					class="block w-full rounded-md border-gray-300 pl-10 focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
					placeholder="Buscar por nome, CPF, email ou telefone..."
					bind:value={searchTerm}
				/>
			</div>
			<div class="w-full flex-shrink-0 md:w-48">
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Filter class="h-5 w-5 text-gray-400" />
					</div>
					<select
						bind:value={statusFilter}
						class="block w-full rounded-md border-gray-300 pl-10 focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
					>
						<option value="all">Todos os Status</option>
						<option value="pending">Pendentes</option>
						<option value="registered">Ativos</option>
						<option value="rejected">Rejeitados</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Conteúdo principal - Cards ou mensagens -->
		<div class="mt-8">
			{#if isLoading}
				<!-- Indicador de carregamento -->
				<div class="flex justify-center py-12">
					<Loader2 class="h-12 w-12 animate-spin text-sky-600" />
				</div>
			{:else if error}
				<!-- Mensagem de erro -->
				<div class="rounded-md bg-red-50 p-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<X class="h-5 w-5 text-red-400" />
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-red-800">{error}</h3>
						</div>
					</div>
				</div>
			{:else if !registrations || registrations.length === 0}
				<!-- Sem registros -->
				<div class="rounded-lg border border-gray-300 bg-white p-6 text-center">
					<p class="text-gray-500">Nenhum cadastro encontrado.</p>
					<p class="mt-2 text-sm text-gray-400">
						Os cadastros aparecerão aqui quando forem criados.
					</p>
				</div>
			{:else if filteredRegistrations.length === 0}
				<!-- Sem registros que correspondam aos filtros -->
				<div class="rounded-lg border border-gray-300 bg-white p-6 text-center">
					<p class="text-gray-500">Nenhum cadastro encontrado com os filtros atuais.</p>
					<p class="mt-2 text-sm text-gray-400">Tente ajustar seus critérios de busca.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each filteredRegistrations as registration (registration.id)}
						<div
							class="group relative overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
						>
							<!-- Faixa de status no topo -->
							<div
								class="absolute top-0 right-0 left-0 h-1.5"
								class:bg-green-500={registration.status === 'registered'}
								class:bg-yellow-500={registration.status === 'pending'}
								class:bg-red-500={registration.status === 'rejected'}
								class:bg-gray-500={!registration.status}
							></div>

							<div class="p-6 pt-8">
								<!-- Cabeçalho com Nome e Status -->
								<div class="mb-4 flex items-center justify-between">
									<h3 class="max-w-[70%] truncate pr-2 text-lg font-semibold text-gray-900">
										{registration.name || 'Sem nome'}
									</h3>

									{#if registration.status}
										<span
											class={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[registration.status]?.color || 'bg-gray-100 text-gray-800'}`}
										>
											{statusConfig[registration.status]?.label || registration.status}
										</span>
									{:else}
										<span
											class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800"
										>
											Desconhecido
										</span>
									{/if}
								</div>

								<!-- Informações do Usuário -->
								<div class="flex items-start space-x-4">
									<!-- Avatar -->
									<div class="flex-shrink-0">
										<div
											class={`flex h-14 w-14 items-center justify-center rounded-full 
												${
													registration.status === 'registered'
														? 'bg-green-100 text-green-600'
														: registration.status === 'pending'
															? 'bg-yellow-100 text-yellow-600'
															: 'bg-red-100 text-red-600'
												}`}
										>
											<Users class="h-7 w-7" />
										</div>
									</div>

									<!-- Dados principais -->
									<div class="min-w-0 flex-1">
										<div class="space-y-2">
											{#if registration.cpf}
												<div class="flex items-start">
													<span
														class="inline-block w-20 flex-shrink-0 text-xs font-medium text-gray-500"
														>CPF:</span
													>
													<span class="text-sm font-medium text-gray-700">{registration.cpf}</span>
												</div>
											{/if}

											{#if registration.email}
												<div class="flex items-start">
													<span
														class="inline-block w-20 flex-shrink-0 text-xs font-medium text-gray-500"
														>Email:</span
													>
													<span class="max-w-[180px] truncate text-sm text-gray-700"
														>{registration.email}</span
													>
												</div>
											{/if}

											{#if registration.phone}
												<div class="flex items-start">
													<span
														class="inline-block w-20 flex-shrink-0 text-xs font-medium text-gray-500"
														>Telefone:</span
													>
													<span class="text-sm text-gray-700">{registration.phone}</span>
												</div>
											{/if}
										</div>
									</div>
								</div>

								<!-- Linha divisória -->
								<div class="mt-5 border-t border-gray-100 pt-4">
									<!-- Botões de Ação -->
									<div class="flex items-center justify-between">
										<!-- Informações de data -->
										<div class="flex flex-col text-xs text-gray-400">
											{#if registration.created_at}
												<span>
													Criado em: {formatDate(registration.created_at)}
												</span>
											{/if}
											{#if registration.updated_at && registration.updated_at !== registration.created_at}
												<span class="mt-0.5">
													Editado em: {formatDate(registration.updated_at)}
												</span>
											{/if}
										</div>

										<!-- Botão de edição -->
										<button
											type="button"
											class={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium 
												${
													registration.status === 'registered'
														? 'bg-green-50 text-green-700 hover:bg-green-100'
														: registration.status === 'pending'
															? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
															: 'bg-red-50 text-red-700 hover:bg-red-100'
												}`}
											on:click={() => openModal('edit', registration)}
										>
											<Pencil class="mr-1.5 h-3.5 w-3.5" />
											Editar
										</button>
									</div>
								</div>
							</div>

							<!-- Efeito de gradiente no hover -->
							<div
								class="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10"
								class:bg-gradient-to-br={true}
								class:from-green-200={registration.status === 'registered'}
								class:via-green-100={registration.status === 'registered'}
								class:from-yellow-200={registration.status === 'pending'}
								class:via-yellow-100={registration.status === 'pending'}
								class:from-red-200={registration.status === 'rejected'}
								class:via-red-100={registration.status === 'rejected'}
								class:from-gray-200={!registration.status}
								class:via-gray-100={!registration.status}
								class:to-transparent={true}
							></div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Modal de registro -->
	{#if isModalOpen}
		<RegistrationModal
			isOpen={isModalOpen}
			mode={modalMode}
			registration={selectedRegistration}
			assignors={data.assignors || []}
			procedures={data.procedures || []}
			onClose={closeModal}
			onSuccess={handleSuccess}
		/>
	{/if}

	<!-- Toast de notificação -->
	{#if showSuccessToast}
		<div
			class="fixed right-4 bottom-4 z-50 rounded-md bg-green-50 p-4 shadow-lg"
			transition:fade={{ duration: 200 }}
		>
			<div class="flex">
				<div class="flex-shrink-0">
					<svg
						class="h-5 w-5 text-green-400"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm font-medium text-green-800">{successMessage}</p>
				</div>
				<div class="ml-auto pl-3">
					<div class="-mx-1.5 -my-1.5">
						<button
							type="button"
							class="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50 focus:outline-none"
							on:click={closeToast}
						>
							<span class="sr-only">Fechar</span>
							<X class="h-5 w-5" />
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}
