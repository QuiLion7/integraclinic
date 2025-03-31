<script lang="ts">
	import { Github, Linkedin, Globe } from 'lucide-svelte';
	const currentYear = new Date().getFullYear();
</script>

<footer class="mt-2 bg-white shadow-md">
	<div class="mx-auto max-w-7xl p-4">
		<div class="flex flex-col items-center justify-center space-y-3">
			<p class="text-sm text-gray-600 transition duration-300 hover:scale-103 hover:text-sky-600">
				© {currentYear} - Desenvolvido por Quilion Oliveira
			</p>
			<div class="flex space-x-8">
				<a
					data-sveltekit-reload
					rel="external"
					href="https://www.linkedin.com/in/quilion7/"
					target="_blank"
					class="text-gray-600 transition duration-300 hover:scale-110 hover:text-sky-600"
				>
					<span class="sr-only">LinkedIn</span>
					<Linkedin size={18} />
				</a>
				<a
					data-sveltekit-reload
					rel="external"
					href="https://github.com/QuiLion7"
					target="_blank"
					class="text-gray-600 transition duration-300 hover:scale-110 hover:text-sky-600"
				>
					<span class="sr-only">GitHub</span>
					<Github size={18} />
				</a>
				<a
					data-sveltekit-reload
					rel="external"
					href="https://quildev.vercel.app/"
					target="_blank"
					class="text-gray-600 transition duration-300 hover:scale-110 hover:text-sky-600"
				>
					<span class="sr-only">Portfolio</span>
					<Globe size={18} />
				</a>
			</div>
		</div>
	</div>
</footer>
