<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	// Verificar se o usuário está autenticado no lado do cliente
	if (browser) {
		const hasAuthCookie = document.cookie.split('; ').some((row) => row.startsWith('auth_token='));

		if (!hasAuthCookie) {
			goto('/');
		}
	}
</script>

<slot />
