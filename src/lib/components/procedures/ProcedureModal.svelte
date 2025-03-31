<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Loader2, X } from 'lucide-svelte';
	import type {
		ProcedureCategory,
		Procedure,
		ProcedureForm,
		FormErrors
	} from '$lib/types/procedures';

	export let isProcedureModalOpen: boolean = false;
	export let selectedProcedure: Procedure | null = null;
	export let newProcedure: ProcedureForm;
	export let categories: ProcedureCategory[] = [];
	export let isSubmitting: boolean = false;
	export let error: string = '';
	export let formErrors: FormErrors;
	export let displayPrice: string = '';

	export let onClose: () => void;
	export let onSubmit: (e: SubmitEvent) => void;
	export let onPriceInput: (event: Event) => void;

	// Definindo o título do modal, que depende da situação
	$: modalTitle = selectedProcedure ? 'Editar' : 'Novo';
</script>

{#if isProcedureModalOpen}
	<div
		class="fixed inset-0 z-10 bg-gray-500/60 transition-opacity"
		transition:fade={{ duration: 150 }}
		aria-hidden="true"
	></div>

	<div
		class="fixed inset-0 z-10 overflow-y-auto"
		role="dialog"
		aria-modal="true"
		aria-labelledby="procedure-modal-title"
	>
		<div class="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
			<div
				class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
				transition:fade={{ duration: 200 }}
			>
				<div class="absolute top-0 right-0 pt-4 pr-4">
					<button
						type="button"
						class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
						on:click={onClose}
						aria-label="Fechar"
					>
						<span class="sr-only">Fechar</span>
						<X class="h-6 w-6" />
					</button>
				</div>

				<div class="sm:flex sm:items-start">
					<div class="mt-3 w-full text-center sm:mt-0 sm:text-left">
						<h3 class="text-lg leading-6 font-medium text-gray-900" id="procedure-modal-title">
							{modalTitle} Procedimento
						</h3>
						<div class="mt-4">
							<form on:submit={onSubmit} class="space-y-4">
								{#if error}
									<div class="mb-4 rounded-md bg-red-50 p-4">
										<div class="flex">
											<div class="flex-shrink-0">
												<svg
													class="h-5 w-5 text-red-400"
													viewBox="0 0 20 20"
													fill="currentColor"
													aria-hidden="true"
												>
													<path
														fill-rule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
													/>
												</svg>
											</div>
											<div class="ml-3">
												<h3 class="text-sm font-medium text-red-800">Erro</h3>
												<div class="mt-2 text-sm text-red-700">
													<p>{error}</p>
												</div>
											</div>
										</div>
									</div>
								{/if}

								<div>
									<label for="name" class="block text-sm font-medium text-gray-700">Nome</label>
									<div class="mt-1">
										<input
											type="text"
											name="name"
											id="name"
											bind:value={newProcedure.name}
											class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm {formErrors
												.procedure.name
												? 'border-red-300'
												: ''}"
											placeholder="Nome do procedimento"
										/>
										{#if formErrors.procedure.name}
											<p class="mt-1 text-sm text-red-600">{formErrors.procedure.name}</p>
										{/if}
									</div>
								</div>

								<div>
									<label for="description" class="block text-sm font-medium text-gray-700"
										>Descrição</label
									>
									<div class="mt-1">
										<textarea
											id="description"
											name="description"
											rows="3"
											bind:value={newProcedure.description}
											class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											placeholder="Descrição do procedimento"
										></textarea>
									</div>
								</div>

								<div>
									<label for="price" class="block text-sm font-medium text-gray-700">Preço</label>
									<div class="mt-1">
										<input
											type="text"
											name="price"
											id="price"
											value={displayPrice}
											on:input={onPriceInput}
											class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm {formErrors
												.procedure.price
												? 'border-red-300'
												: ''}"
											placeholder="R$ 0,00"
										/>
										{#if formErrors.procedure.price}
											<p class="mt-1 text-sm text-red-600">{formErrors.procedure.price}</p>
										{/if}
									</div>
								</div>

								<div>
									<label for="category" class="block text-sm font-medium text-gray-700"
										>Categoria</label
									>
									<div class="mt-1">
										<select
											id="category"
											name="category"
											bind:value={newProcedure.category}
											class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm {formErrors
												.procedure.category
												? 'border-red-300'
												: ''}"
										>
											<option value={0} disabled>Selecione uma categoria</option>
											{#each categories as category}
												<option value={Number(category.id)}>{category.name}</option>
											{/each}
										</select>
										{#if formErrors.procedure.category}
											<p class="mt-1 text-sm text-red-600">{formErrors.procedure.category}</p>
										{/if}
										<p class="mt-1 text-xs text-gray-500">
											Categoria atual: {newProcedure.category} - {categories.find(
												(c) => Number(c.id) === Number(newProcedure.category)
											)?.name || 'Não encontrada'}
										</p>
									</div>
								</div>

								<div class="flex items-center">
									<input
										id="isActive"
										name="isActive"
										type="checkbox"
										bind:checked={newProcedure.isActive}
										class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
									/>
									<label for="isActive" class="ml-2 block text-sm text-gray-900">Ativo</label>
								</div>

								<div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
									<button
										type="submit"
										class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
										disabled={isSubmitting}
									>
										{#if isSubmitting}
											<Loader2 class="mr-2 h-4 w-4 animate-spin" />
											Salvando...
										{:else}
											Salvar
										{/if}
									</button>
									<button
										type="button"
										class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
										on:click={onClose}
										disabled={isSubmitting}
									>
										Cancelar
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
