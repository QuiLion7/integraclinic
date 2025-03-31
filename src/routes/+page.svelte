<script lang="ts">
	import { goto } from '$app/navigation';
	import Footer from '$lib/components/Footer.svelte';
	import {
		ArrowRight,
		CheckCircle,
		Users,
		Shield,
		Clock,
		BarChart as ChartBar
	} from 'lucide-svelte';
</script>

<div class="min-h-screen bg-white">
	<header class="fixed z-50 w-full bg-white shadow-sm">
		<nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex-shrink-0">
					<span class="text-2xl font-bold text-sky-600">IntegraClinic</span>
				</div>
				<button
					on:click={() => goto('/login')}
					class="inline-flex items-center justify-center rounded-lg border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
				>
					Acessar Sistema
				</button>
			</div>
		</nav>
	</header>

	<section
		class="bg-gradient-to-br from-sky-50 to-sky-100 pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-24"
	>
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="lg:grid lg:grid-cols-12 lg:gap-8">
				<div class="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
					<h1>
						<span class="block text-sm font-semibold tracking-wide text-sky-600 uppercase">
							Gestão Eficiente
						</span>
						<span
							class="flex flex-col justify-center gap-2 text-4xl font-extrabold tracking-tight sm:text-5xl"
						>
							<span class="block text-gray-900 uppercase">Simplifique o</span>
							<span class="block text-sky-600 uppercase">Cadastro de Usuários</span>
						</span>
					</h1>
					<p class="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
						Otimize o processo de cadastro de pacientes com nossa plataforma intuitiva. Reduza o
						tempo de espera, elimine erros e melhore a experiência dos seus pacientes.
					</p>
					<div class="mt-8 sm:mx-auto sm:max-w-lg sm:text-center lg:mx-0 lg:text-left">
						<button
							on:click={() => goto('/login')}
							class="inline-flex items-center justify-center rounded-lg border border-transparent bg-sky-600 px-6 py-3 text-base font-medium text-white hover:bg-sky-700 md:text-lg"
						>
							Começar Agora
							<ArrowRight class="ml-2 h-5 w-5" />
						</button>
					</div>
				</div>
				<div
					class="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-6 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center"
				>
					<div class="relative mx-auto w-full overflow-hidden rounded-lg shadow-lg lg:max-w-md">
						<img
							class="w-full transform rounded-lg transition-transform duration-500 hover:scale-105"
							src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80"
							alt="Dashboard preview"
						/>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="bg-white py-12">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-2 gap-6 lg:grid-cols-4">
				<div class="rounded-lg bg-sky-50 p-6 text-center">
					<div class="mb-3 flex justify-center text-sky-600">
						<Users class="h-8 w-8" />
					</div>
					<div class="text-2xl font-bold text-gray-900">1,000+</div>
					<div class="text-sm text-gray-600">Pacientes Atendidos</div>
				</div>
				<div class="rounded-lg bg-sky-50 p-6 text-center">
					<div class="mb-3 flex justify-center text-sky-600">
						<Clock class="h-8 w-8" />
					</div>
					<div class="text-2xl font-bold text-gray-900">60%</div>
					<div class="text-sm text-gray-600">Redução no Tempo</div>
				</div>
				<div class="rounded-lg bg-sky-50 p-6 text-center">
					<div class="mb-3 flex justify-center text-sky-600">
						<Shield class="h-8 w-8" />
					</div>
					<div class="text-2xl font-bold text-gray-900">100%</div>
					<div class="text-sm text-gray-600">Dados Seguros</div>
				</div>
				<div class="rounded-lg bg-sky-50 p-6 text-center">
					<div class="mb-3 flex justify-center text-sky-600">
						<ChartBar class="h-8 w-8" />
					</div>
					<div class="text-2xl font-bold text-gray-900">90%</div>
					<div class="text-sm text-gray-600">Satisfação</div>
				</div>
			</div>
		</div>
	</section>

	<section id="benefits" class="bg-white pt-2 pb-12">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
					Por que escolher IntegraClinic?
				</h2>
				<p class="mt-4 text-lg text-gray-500">Benefícios que fazem a diferença no seu dia a dia</p>
			</div>

			<div class="mt-12">
				<dl class="space-y-10 md:grid md:grid-cols-2 md:space-y-0 md:gap-x-8 md:gap-y-10">
					{#each [{ title: 'Economia de Tempo', description: 'Reduza o tempo gasto com processos administrativos em até 60%' }, { title: 'Redução de Erros', description: 'Minimize erros de cadastro com validação automática de dados' }, { title: 'Satisfação do Paciente', description: 'Melhore a experiência do paciente com processos mais ágeis' }, { title: 'Dados Seguros', description: 'Proteção total dos dados sensíveis dos pacientes' }] as benefit}
						<div class="relative">
							<dt>
								<div
									class="absolute flex h-12 w-12 items-center justify-center rounded-md bg-sky-500 text-white"
								>
									<CheckCircle class="h-6 w-6" />
								</div>
								<p class="ml-16 text-lg leading-6 font-medium text-gray-900">{benefit.title}</p>
							</dt>
							<dd class="mt-2 ml-16 text-base text-gray-500">{benefit.description}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</div>
	</section>

	<section class="bg-sky-600">
		<div
			class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8 lg:py-16"
		>
			<h2 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
				<span class="block">Pronto para começar?</span>
				<span class="block text-sky-200">Comece a usar hoje mesmo.</span>
			</h2>
			<div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
				<div class="inline-flex rounded-md shadow">
					<button
						on:click={() => goto('/login')}
						class="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-sky-600 hover:bg-sky-50"
					>
						Acessar Sistema
					</button>
				</div>
			</div>
		</div>
	</section>

	<Footer />
</div>
