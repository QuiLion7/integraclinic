<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import '../app.css';
	import { page } from '$app/state';

	let { children } = $props();
</script>

{#if page.url.pathname !== '/' && page.url.pathname !== '/login'}
	<Header />
{/if}

<main class="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100">
	{#if children}
		{@render children()}
	{/if}
</main>

{#if page.url.pathname !== '/' && page.url.pathname !== '/login'}
	<Footer />
{/if}
