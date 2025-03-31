<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Check, X } from 'lucide-svelte';

	export let showSuccessToast: boolean = false;
	export let successMessage: string = '';

	export let onClose: () => void;
</script>

{#if showSuccessToast}
	<div
		class="fixed right-4 bottom-4 z-50 rounded-md bg-green-50 p-4 shadow-lg"
		transition:fade={{ duration: 200 }}
		role="alert"
		aria-live="assertive"
	>
		<div class="flex">
			<div class="flex-shrink-0">
				<Check class="h-5 w-5 text-green-400" />
			</div>
			<div class="ml-3">
				<p class="text-sm font-medium text-green-800">{successMessage}</p>
			</div>
			<div class="ml-auto pl-3">
				<div class="-mx-1.5 -my-1.5">
					<button
						type="button"
						class="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50 focus:outline-none"
						on:click={onClose}
					>
						<span class="sr-only">Fechar</span>
						<X class="h-5 w-5" />
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
