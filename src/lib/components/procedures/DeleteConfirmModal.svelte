<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Loader2, Trash2, X } from 'lucide-svelte';
	import type { ProcedureCategory } from '$lib/types/procedures';

	export let isDeleteConfirmModalOpen: boolean = false;
	export let selectedCategoryForDelete: ProcedureCategory | null = null;
	export let isSubmitting: boolean = false;
	export let error: string = '';

	export let onClose: () => void;
	export let onDelete: () => void;
</script>

{#if isDeleteConfirmModalOpen && selectedCategoryForDelete}
	<div
		class="fixed inset-0 z-10 bg-gray-500/70 transition-opacity"
		transition:fade={{ duration: 150 }}
		aria-hidden="true"
	></div>

	<div
		class="fixed inset-0 z-10 overflow-y-auto"
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-modal-title"
	>
		<div class="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
			<div
				class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:max-w-lg sm:p-6"
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
					<div
						class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
					>
						<Trash2 class="h-6 w-6 text-red-600" aria-hidden="true" />
					</div>
					<div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
						<h3 class="text-lg leading-6 font-medium text-gray-900" id="delete-modal-title">
							Excluir categoria
						</h3>
						<div class="mt-2">
							<p class="text-sm text-gray-500">
								Tem certeza que deseja excluir a categoria "{selectedCategoryForDelete.name}"? Esta
								ação não pode ser desfeita.
							</p>
						</div>
					</div>
				</div>

				{#if error}
					<div class="mt-3 rounded-md bg-red-50 p-4">
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

				<div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
					<button
						type="button"
						class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
						on:click={onDelete}
						disabled={isSubmitting}
					>
						{#if isSubmitting}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Excluindo...
						{:else}
							Excluir
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
			</div>
		</div>
	</div>
{/if}
