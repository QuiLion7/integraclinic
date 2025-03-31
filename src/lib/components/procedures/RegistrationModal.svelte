<script lang="ts">
	import { X, Loader2 } from 'lucide-svelte';
	import {
		createPreRegister,
		updatePreRegister,
		type PreRegister
	} from '$lib/services/preRegisterService';

	import type { Procedure } from '$lib/types/procedures';
	import type { Assignor } from '$lib/types/procedures';

	export let isOpen = false;
	export let mode: 'create' | 'edit' | 'analyze' = 'create';
	export let registration: PreRegister | undefined = undefined;
	export let assignors: Assignor[] = [];
	export let procedures: Procedure[] = [];
	export let currentAssignorId: number = 0;
	export let onClose = () => {};
	export let onSuccess = (message: string, data?: any) => {};

	// Estado do formulário simplificado
	let form = {
		assignor: 0,
		procedures: [{ procedure: 0, quantity: 1 }],
		name: '',
		email: '',
		cpf: '',
		phone: '',
		status: 'pending' as 'pending' | 'registered' | 'rejected'
	};

	let isLoading = false;
	let error = '';

	// Função simplificada para limpar CPF (apenas números)
	function limparCPF(cpf: string): string {
		return cpf ? cpf.replace(/\D/g, '') : '';
	}

	// Função simplificada para inicializar o formulário
	function initializeForm() {
		if (isOpen && registration && (mode === 'edit' || mode === 'analyze')) {
			// Extrair ID do procedimento, simplificando a lógica
			let procedureId = 0;
			if (registration.procedures?.length > 0) {
				const proc = registration.procedures[0];
				procedureId =
					typeof proc.procedure === 'object' && proc.procedure
						? (proc.procedure as any).id
						: (proc.procedure as number);
			}

			// Extrair ID do convênio, simplificando a lógica
			const assignorId =
				typeof registration.assignor === 'object' && registration.assignor
					? (registration.assignor as any).id
					: (registration.assignor as number);

			// Preencher o formulário com dados existentes
			form = {
				assignor: assignorId,
				procedures: [{ procedure: procedureId, quantity: 1 }],
				name: registration.name || '',
				email: registration.email || '',
				cpf: registration.cpf || '',
				phone: registration.phone || '',
				status: registration.status || 'pending'
			};
		} else if (isOpen && mode === 'create') {
			// Resetar formulário para novo cadastro
			form = {
				assignor: currentAssignorId || 0,
				procedures: [{ procedure: 0, quantity: 1 }],
				name: '',
				email: '',
				cpf: '',
				phone: '',
				status: 'pending'
			};
			error = '';
		}
	}

	// Inicializar quando o modal abrir ou registro mudar
	$: if (isOpen) {
		initializeForm();
	}

	// Validação básica do formulário (simplificada)
	function validateForm() {
		if (!form.name) return 'Nome é obrigatório';

		if (!form.email) return 'Email é obrigatório';
		if (!/\S+@\S+\.\S+/.test(form.email)) return 'Email inválido';

		if (!form.cpf) return 'CPF é obrigatório';
		if (limparCPF(form.cpf).length !== 11) return 'CPF deve ter 11 dígitos';

		if (!form.phone) return 'Telefone é obrigatório';
		const phoneDigits = form.phone.replace(/\D/g, '');
		if (phoneDigits.length < 10 || phoneDigits.length > 11) {
			return 'Telefone deve ter entre 10 e 11 dígitos';
		}

		if (!form.procedures[0].procedure) return 'Selecione um procedimento válido';

		return '';
	}

	// Envio do formulário (simplificado)
	async function handleSubmit() {
		const validationError = validateForm();
		if (validationError) {
			error = validationError;
			return;
		}

		isLoading = true;
		error = '';

		try {
			// Preparar dados para envio
			const formToSubmit = {
				...form,
				cpf: limparCPF(form.cpf),
				phone: form.phone.replace(/\D/g, '')
			};

			// Simplificado: remover campos desnecessários
			if (mode === 'create') {
				const result = await createPreRegister(formToSubmit);
				onSuccess('Pré-cadastro criado com sucesso!', result);
				form = {
					assignor: currentAssignorId || 0,
					procedures: [{ procedure: 0, quantity: 1 }],
					name: '',
					email: '',
					cpf: '',
					phone: '',
					status: 'pending'
				};
				close();
			} else if (mode === 'edit' && registration?.id) {
				const updatedRegistration = await updatePreRegister(registration.id, formToSubmit);
				onSuccess('Pré-cadastro atualizado com sucesso!', updatedRegistration);
				close();
			}
		} catch (err: any) {
			// Tratamento de erro simplificado
			error = err.message || 'Erro ao salvar pré-cadastro. Por favor, tente novamente.';
		} finally {
			isLoading = false;
		}
	}

	function close() {
		onClose();
	}
</script>

{#if isOpen}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-500/70"
	>
		<div class="relative w-full max-w-2xl p-4">
			<div class="relative rounded-lg bg-white shadow-xl">
				<!-- Cabeçalho do modal -->
				<div class="flex items-center justify-between rounded-t-lg border-b p-4">
					<h3 class="text-xl font-semibold text-gray-900">
						{#if mode === 'create'}
							Novo Pré-Cadastro
						{:else if mode === 'edit'}
							Editar Pré-Cadastro
						{:else}
							Detalhes do Pré-Cadastro {#if registration?.id}#{registration.id}{/if}
						{/if}
					</h3>
					<button
						class="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
						on:click={close}
					>
						<X size={20} />
					</button>
				</div>

				<div class="p-6">
					<!-- Mensagem de erro -->
					{#if error}
						<div class="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
							{error}
						</div>
					{/if}

					<!-- Informações adicionais para modo analyze -->
					{#if mode === 'analyze' && registration?.register_link}
						<div class="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
							<div><strong>Link de Registro:</strong> {registration.register_link}</div>
							{#if registration?.created_at}
								<div>
									<strong>Criado em:</strong>
									{new Date(registration.created_at).toLocaleString('pt-BR')}
								</div>
							{/if}
							{#if registration?.updated_at}
								<div>
									<strong>Atualizado em:</strong>
									{new Date(registration.updated_at).toLocaleString('pt-BR')}
								</div>
							{/if}
						</div>
					{/if}

					<form on:submit|preventDefault={handleSubmit}>
						<!-- Nome -->
						<div class="mb-4">
							<label for="name" class="mb-2 block text-sm font-medium text-gray-700">Nome</label>
							<input
								type="text"
								id="name"
								bind:value={form.name}
								disabled={mode === 'analyze'}
								class="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-sky-500 focus:ring-sky-500 disabled:bg-gray-100"
								placeholder="Nome completo"
							/>
						</div>

						<!-- Email -->
						<div class="mb-4">
							<label for="email" class="mb-2 block text-sm font-medium text-gray-700">Email</label>
							<input
								type="email"
								id="email"
								bind:value={form.email}
								disabled={mode === 'analyze'}
								class="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-sky-500 focus:ring-sky-500 disabled:bg-gray-100"
								placeholder="email@exemplo.com"
							/>
						</div>

						<!-- CPF e Telefone -->
						<div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<label for="cpf" class="mb-2 block text-sm font-medium text-gray-700">CPF</label>
								<input
									type="text"
									id="cpf"
									bind:value={form.cpf}
									disabled={mode === 'analyze'}
									class="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-sky-500 focus:ring-sky-500 disabled:bg-gray-100"
									placeholder="000.000.000-00"
								/>
							</div>

							<div>
								<label for="phone" class="mb-2 block text-sm font-medium text-gray-700"
									>Telefone</label
								>
								<input
									type="text"
									id="phone"
									bind:value={form.phone}
									disabled={mode === 'analyze'}
									class="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-sky-500 focus:ring-sky-500 disabled:bg-gray-100"
									placeholder="(00) 00000-0000"
								/>
							</div>
						</div>

						<!-- Convênio -->
						<div class="mb-4">
							<label for="assignor" class="mb-2 block text-sm font-medium text-gray-700"
								>Convênio</label
							>
							<select
								id="assignor"
								bind:value={form.assignor}
								disabled={mode === 'analyze'}
								class="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-sky-500 focus:ring-sky-500 disabled:bg-gray-100"
							>
								<option value={0} disabled>Selecione um Convênio</option>
								{#each assignors as assignor (assignor.id)}
									<option value={assignor.id}
										>{assignor.fantasy_name || assignor.social_reason}</option
									>
								{/each}
							</select>
							{#if mode === 'analyze' && registration?.assignor}
								{#if typeof registration.assignor === 'object' && registration.assignor !== null}
									<p class="mt-1 text-sm text-gray-500">
										{(registration.assignor as any).fantasy_name || ''}
										{#if (registration.assignor as any).social_reason}
											({(registration.assignor as any).social_reason})
										{/if}
									</p>
								{/if}
							{/if}
						</div>

						<!-- Status -->
						<div class="mb-4">
							<label for="status" class="mb-2 block text-sm font-medium text-gray-700">Status</label
							>
							<select
								id="status"
								bind:value={form.status}
								disabled={mode === 'analyze'}
								class="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-sky-500 focus:ring-sky-500 disabled:bg-gray-100"
							>
								<option value="pending">Pendente</option>
								<option value="registered">Registrado</option>
								<option value="rejected">Rejeitado</option>
							</select>
							<div class="mt-1 text-xs text-gray-500">Status atual: {form.status}</div>
						</div>

						<!-- Procedimento -->
						<div class="mb-4">
							<label for="procedure" class="mb-2 block text-sm font-medium text-gray-700">
								Procedimento
							</label>
							{#if mode === 'analyze'}
								<div
									class="w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-gray-900"
								>
									{#each procedures as procedure}
										{#if procedure.id === form.procedures[0].procedure}
											{procedure.name} -
											{parseFloat(procedure.price).toLocaleString('pt-BR', {
												style: 'currency',
												currency: 'BRL'
											})}
										{/if}
									{/each}
								</div>
							{:else}
								<select
									id="procedure"
									bind:value={form.procedures[0].procedure}
									class="w-full rounded-lg border border-gray-300 p-2.5 text-gray-900 focus:border-sky-500 focus:ring-sky-500"
								>
									<option value={0} disabled>Selecione um Procedimento</option>
									{#each procedures as procedure (procedure.id)}
										<option value={procedure.id}>
											{procedure.name} - {parseFloat(procedure.price).toLocaleString('pt-BR', {
												style: 'currency',
												currency: 'BRL'
											})}
										</option>
									{/each}
								</select>
							{/if}
						</div>
					</form>
				</div>

				<!-- Rodapé com botões -->
				<div class="flex items-center justify-end space-x-2 rounded-b-lg border-t p-4">
					<button
						type="button"
						on:click={close}
						class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
					>
						{mode === 'analyze' ? 'Fechar' : 'Cancelar'}
					</button>

					{#if mode !== 'analyze'}
						<button
							type="button"
							on:click={handleSubmit}
							disabled={isLoading}
							class="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-70"
						>
							{#if isLoading}
								<div class="flex items-center">
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
									<span>{mode === 'create' ? 'Criando...' : 'Salvando...'}</span>
								</div>
							{:else}
								{mode === 'create' ? 'Criar' : 'Salvar'}
							{/if}
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
