<script lang="ts">
	import { goto } from '$app/navigation';
	import { setAuthToken } from '$lib/stores/auth';
	import axios from 'axios';
	import { onMount } from 'svelte';

	let username = '';
	let password = '';
	let showPassword = false;
	let isLoading = false;
	let errorMessage = '';

	// Verificando se o usuário já está autenticado
	onMount(() => {
		// Verificando o token de autenticação nos cookies
		const hasAuthCookie = document.cookie.split('; ').some((row) => row.startsWith('auth_token='));

		if (hasAuthCookie) {
			// Se já estiver autenticado, ir para a dashboard
			goto('/dashboard');
		}
	});

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		isLoading = true;
		errorMessage = '';

		try {
			const response = await axios.post(
				'https://investm-backend-divine-field-7851.fly.dev/api/v1/authentication/token/',
				{
					username,
					password
				},
				{
					headers: { 'Content-Type': 'application/json' }
				}
			);

			// Se a resposta for válida, armazenamos o token JWT
			const token = response.data.access;
			setAuthToken(token);

			// Após autenticação, ir para a dashboard
			goto('/dashboard');
		} catch (error) {
			console.error('Erro ao fazer login:', error);
			errorMessage = 'Usuário ou senha inválidos!';
		} finally {
			isLoading = false;
		}
	}
</script>

<div
	class="flex min-h-screen flex-col justify-center bg-gradient-to-br from-sky-50 to-sky-100 py-12 sm:px-6 lg:px-8"
>
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<div class="text-center">
			<h1 class="mb-2 text-4xl font-bold text-sky-600">IntegraClinic</h1>
			<p class="mt-2 text-sm text-gray-600">Acesse o sistema para gerenciar seus cadastros</p>
		</div>
	</div>

	<div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="rounded-lg bg-white px-4 py-8 shadow-xl sm:px-10">
			{#if errorMessage}
				<div class="mb-4 rounded-md bg-red-100 p-3 text-red-700">
					<p>{errorMessage}</p>
				</div>
			{/if}

			<form class="space-y-6" on:submit={handleLogin}>
				<div class="rounded-md border border-sky-200 bg-sky-50 p-4 text-sm text-sky-700">
					<p class="mb-1 font-medium">Credenciais de acesso:</p>
					<ul class="list-inside list-disc space-y-1">
						<li>Usuário: <code class="rounded bg-sky-100 px-1 py-0.5">exemplo.exemplo</code></li>
						<li>Senha: <code class="rounded bg-sky-100 px-1 py-0.5">@Exemplo2025</code></li>
					</ul>
				</div>
				<div>
					<label for="username" class="block text-sm font-medium text-gray-700"> Usuário </label>
					<div class="mt-1">
						<input
							id="username"
							name="username"
							type="text"
							required
							bind:value={username}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-sky-500"
							placeholder="Digite seu usuário"
						/>
					</div>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700"> Senha </label>
					<div class="relative mt-1">
						<input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							required
							bind:value={password}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-sky-500"
							placeholder="Digite sua senha"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
							on:click={() => (showPassword = !showPassword)}
						>
							{#if showPassword}
								👁️
							{/if}
							{#if !showPassword}
								👁️‍🗨️
							{/if}
						</button>
					</div>
				</div>

				<div>
					<button
						type="submit"
						class="flex w-full items-center justify-center rounded-lg border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:outline-none"
						disabled={isLoading}
					>
						{#if isLoading}
							<svg
								class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Entrando...
						{:else}
							Entrar
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>
