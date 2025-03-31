<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { logout } from '$lib/stores/auth';
	import { Menu, X, LogOut } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	function handleLogout() {
		logout();
		goto('/');
	}

	let isMenuOpen = false;

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}
</script>

<nav class="bg-white shadow-md">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 justify-between">
			<div class="flex items-center">
				<div class="flex flex-shrink-0 items-center">
					<a href="/dashboard" class="text-xl font-bold text-sky-600">IntegraClinic</a>
				</div>
				<div class="hidden md:ml-8 md:flex md:items-center md:space-x-4">
					<a
						href="/dashboard"
						class="rounded-md px-3 py-2 text-sm font-medium {$page.url.pathname === '/dashboard'
							? 'bg-sky-100 text-sky-700 transition duration-100'
							: 'text-gray-700 transition duration-100 hover:bg-gray-50 hover:text-sky-600'}"
					>
						Dashboard
					</a>
					<a
						href="/procedures"
						class="rounded-md px-3 py-2 text-sm font-medium {$page.url.pathname === '/procedures'
							? 'bg-sky-100 text-sky-700 transition duration-100'
							: 'text-gray-700 transition duration-100 hover:bg-gray-50 hover:text-sky-600'}"
					>
						Procedimentos
					</a>
					<a
						href="/registrations"
						class="rounded-md px-3 py-2 text-sm font-medium {$page.url.pathname === '/registrations'
							? 'bg-sky-100 text-sky-700 transition duration-100'
							: 'text-gray-700 transition duration-100 hover:bg-gray-50 hover:text-sky-600'}"
					>
						Cadastros
					</a>
				</div>
			</div>
			<div class="flex items-center">
				<button
					onclick={handleLogout}
					class="hidden cursor-pointer items-center justify-center space-x-2 rounded-lg border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition duration-100 hover:scale-101 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none md:inline-flex"
				>
					<LogOut size={20} />
					<span>Sair</span>
				</button>
				<button
					class="rounded-md p-2 text-gray-700 hover:bg-gray-50 hover:text-sky-600 focus:ring-2 focus:ring-sky-500 focus:outline-none focus:ring-inset md:hidden"
					onclick={toggleMenu}
				>
					<span class="sr-only">Abrir menu</span>
					{#if isMenuOpen}
						<X size={24} />
					{:else}
						<Menu size={24} />
					{/if}
				</button>
			</div>
		</div>
	</div>

	{#if isMenuOpen}
		<div class="md:hidden" transition:fade={{ duration: 200 }}>
			<div class="space-y-1 px-2 pt-2 pb-3">
				<a
					href="/dashboard"
					class="block rounded-md px-3 py-2 text-base font-medium {$page.url.pathname ===
					'/dashboard'
						? 'bg-sky-100 text-sky-700'
						: 'text-gray-700 hover:bg-gray-50 hover:text-sky-600'}"
					onclick={closeMenu}
				>
					Dashboard
				</a>
				<a
					href="/procedures"
					class="block rounded-md px-3 py-2 text-base font-medium {$page.url.pathname ===
					'/procedures'
						? 'bg-sky-100 text-sky-700'
						: 'text-gray-700 hover:bg-gray-50 hover:text-sky-600'}"
					onclick={closeMenu}
				>
					Procedimentos
				</a>
				<a
					href="/registrations"
					class="block rounded-md px-3 py-2 text-base font-medium {$page.url.pathname ===
					'/registrations'
						? 'bg-sky-100 text-sky-700'
						: 'text-gray-700 hover:bg-gray-50 hover:text-sky-600'}"
					onclick={closeMenu}
				>
					Cadastros
				</a>
				<button
					onclick={handleLogout}
					class="w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-sky-600"
				>
					<div class="flex items-center space-x-2">
						<LogOut size={20} />
						<span>Sair</span>
					</div>
				</button>
			</div>
		</div>
	{/if}
</nav>
