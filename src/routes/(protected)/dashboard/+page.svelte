<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { getAuthToken } from '$lib/utils/auth';
	import { getStatusSummary } from '$lib/services/preRegisterService';
	import { getProcedureSummary } from '$lib/services/procedureService';
	import { Loader2, Check, X, FileText, Users, PieChart } from 'lucide-svelte';
	import type { ProcedureCategory } from '$lib/types/procedures';
	import type { Procedure } from '$lib/types/procedures';

	// Propriedades recebidas da página
	export let data;

	// Estados locais
	let isLoading = false;
	let error = '';
	let proceduresByCategory: Record<string, number> = {};
	let registrationStats = { pending: 0, registered: 0, rejected: 0, total: 0 };
	let procedureStats = { active: 0, inactive: 0, total: 0 };
	let updateInterval: ReturnType<typeof setInterval>;

	$: cards = [
		// Cards de Procedimentos
		{
			title: 'Total de Procedimentos',
			value: procedureStats.total,
			icon: FileText,
			color: 'blue',
			group: 'procedures'
		},
		{
			title: 'Procedimentos Ativos',
			value: procedureStats.active,
			icon: Check,
			color: 'green',
			group: 'procedures'
		},
		{
			title: 'Procedimentos Inativos',
			value: procedureStats.inactive,
			icon: X,
			color: 'red',
			group: 'procedures'
		},
		// Cards de Cadastros
		{
			title: 'Total de Cadastros',
			value: registrationStats.total,
			icon: Users,
			color: 'blue',
			group: 'registrations'
		},
		{
			title: 'Ativos',
			value: registrationStats.registered,
			icon: Check,
			color: 'green',
			group: 'registrations'
		},
		{
			title: 'Cadastros Rejeitados',
			value: registrationStats.rejected,
			icon: X,
			color: 'red',
			group: 'registrations'
		}
	];

	// Função para calcular largura das barras de progresso
	function calculateBarWidth(value: number, total: number): string {
		if (total === 0) return '0%';
		const percentage = (value / total) * 100;
		return `${percentage}%`;
	}

	// Função que carrega os dados de estatísticas
	async function loadStats() {
		try {
			// Carregar dados de cadastros
			const summary = await getStatusSummary();
			if (summary) {
				registrationStats = summary;
			}

			// Carregar dados de procedimentos
			const procedureSummary = await getProcedureSummary();
			if (procedureSummary) {
				procedureStats = procedureSummary;
			}
		} catch (err) {
			console.error('Erro ao carregar estatísticas:', err);
		}
	}

	// Função para processar dados recebidos da página
	function processPageData() {
		// Se houver erro nos dados, mostra mensagem e encerra
		if (data.error) {
			error = data.error;
			return;
		}

		// Inicializa contador de procedimentos por categoria
		proceduresByCategory = {};

		// Verifica se os arrays necessários existem
		if (Array.isArray(data.procedures) && Array.isArray(data.categories)) {
			// Cria um contador para cada categoria
			data.categories.forEach((category: ProcedureCategory) => {
				proceduresByCategory[category.id] = 0;
			});

			// Conta quantos procedimentos existem em cada categoria
			data.procedures.forEach((procedure: Procedure) => {
				if (procedure.category) {
					// Extrai o ID da categoria (pode ser objeto ou número)
					const categoryId =
						typeof procedure.category === 'number' ? procedure.category : procedure.category.id;

					// Incrementa o contador da categoria
					if (proceduresByCategory[categoryId] !== undefined) {
						proceduresByCategory[categoryId]++;
					}
				}
			});
		}

		// Carrega estatísticas adicionais
		loadStats();
	}

	// Atualiza os dados quando a prop 'data' mudar
	$: if (data) {
		processPageData();
	}

	// Quando o componente for montado
	onMount(() => {
		// Verifica se o usuário está autenticado
		const token = getAuthToken();

		if (!token) {
			error = 'Sessão expirada ou não autenticada. Por favor, faça login novamente.';
			console.error('Token de autenticação ausente ou inválido');
			setTimeout(() => goto('/'), 2000);
			return;
		}

		// Processa os dados iniciais
		processPageData();

		// Configura atualização automática a cada 60 segundos
		updateInterval = setInterval(loadStats, 60000);
	});

	// Limpa o intervalo quando o componente for destruído
	onDestroy(() => {
		if (updateInterval) {
			clearInterval(updateInterval);
		}
	});
</script>

<div class="mx-auto max-w-7xl px-4 py-2 sm:px-6 sm:py-4 lg:px-8 lg:py-6">
	<div class="sm:flex sm:items-center">
		<div class="sm:flex-auto">
			<h1 class="text-xl font-semibold text-gray-900">Dashboard</h1>
			<p class="mt-2 text-sm text-gray-700">Visão geral do sistema Integramedic.</p>
		</div>
	</div>

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
	{:else if isLoading}
		<div class="flex justify-center py-24">
			<Loader2 class="h-8 w-8 animate-spin text-sky-600" />
		</div>
	{:else}
		<!-- Cards de estatísticas principais -->
		<div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			<!-- Gerando os cards dinamicamente com um loop -->
			{#each cards as card}
				<div
					class="group relative overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
				>
					<!-- Faixa colorida no topo -->
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

		<!-- Gráficos de estatísticas -->
		<div class="mt-8 grid grid-cols-1 gap-6">
			<div
				class="group relative w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-md"
			>
				<!-- Faixa colorida no topo -->
				<div class="absolute top-0 right-0 left-0 h-1.5 bg-blue-500"></div>

				<div class="p-6 pt-7">
					<h3 class="mb-4 text-base font-medium text-gray-900">
						<div class="flex items-center">
							<PieChart class="mr-2 h-5 w-5 text-gray-500" />
							<span>Status dos Cadastros</span>
						</div>
					</h3>

					{#if registrationStats.total === 0}
						<p class="py-6 text-center text-sm text-gray-500">Nenhum dado disponível</p>
					{:else}
						<div class="space-y-4">
							<!-- Definição dos status para loop -->
							{#each [{ label: 'Pendentes', value: registrationStats.pending, color: 'yellow' }, { label: 'Ativos', value: registrationStats.registered, color: 'green' }, { label: 'Rejeitados', value: registrationStats.rejected, color: 'red' }] as status}
								<div class="transition duration-200 hover:scale-101">
									<div class="flex items-center justify-between">
										<span class="text-sm font-medium text-{status.color}-700">{status.label}</span>
										<span class="text-sm font-medium text-gray-700">
											{status.value} ({Math.round((status.value / registrationStats.total) * 100)}%)
										</span>
									</div>
									<div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
										<div
											class="h-2 rounded-full transition-all duration-500"
											class:bg-yellow-500={status.color === 'yellow'}
											class:bg-green-500={status.color === 'green'}
											class:bg-red-500={status.color === 'red'}
											style="width: {calculateBarWidth(status.value, registrationStats.total)}"
										></div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
