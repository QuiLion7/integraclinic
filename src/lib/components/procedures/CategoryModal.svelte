<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Loader2, X } from 'lucide-svelte';
	import type { ProcedureCategory, CategoryForm, FormErrors } from '$lib/types/procedures';

	export let isCategoryModalOpen: boolean = false;
	export let selectedCategoryForEdit: ProcedureCategory | null = null;
	export let newCategory: CategoryForm;
	export let isSubmitting: boolean = false;
	export let error: string = '';
	export let formErrors: FormErrors;

	export let onClose: () => void;
	export let onSubmit: (e: SubmitEvent) => void;

	// Definindo o título do modal que depende do tipo
	$: modalTitle = selectedCategoryForEdit ? 'Editar' : 'Nova';
</script>

{#if isCategoryModalOpen}
	<div
		class="fixed inset-0 z-10 bg-gray-500/70 transition-opacity"
		transition:fade={{ duration: 150 }}
		aria-hidden="true"
	></div>

	<div
		class="fixed inset-0 z-10 overflow-y-auto"
		role="dialog"
		aria-modal="true"
		aria-labelledby="category-modal-title"
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
						<h3 class="text-lg leading-6 font-medium text-gray-900" id="category-modal-title">
							{modalTitle} Categoria
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
									<label for="category-name" class="block text-sm font-medium text-gray-700"
										>Nome</label
									>
									<div class="mt-1">
										<input
											type="text"
											name="name"
											id="category-name"
											bind:value={newCategory.name}
											class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm {formErrors
												.category.name
												? 'border-red-300'
												: ''}"
											placeholder="Nome da categoria"
										/>
										{#if formErrors.category.name}
											<p class="mt-1 text-sm text-red-600">{formErrors.category.name}</p>
										{/if}
									</div>
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
