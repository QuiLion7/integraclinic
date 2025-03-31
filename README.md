# 🏥 IntegraMedic

Uma aplicação web moderna com o objetivo de gerenciar usuários e procedimentos médicos, desenvolvida com Svelte e SvelteKit.

### 🌞 Preview do Projeto

![Preview do Projeto - Home](/static/img1.png)

![Preview do Projeto - Login](/static/img2.png)

![Preview do Projeto - Dashboard](/static/img3.png)

![Preview do Projeto - Procedimentos](/static/img4.png)

![Preview do Projeto - Cadastros](/static/img5.png)

![Preview do Projeto - Menu Mobile](/static/img6.png)

![Preview do Projeto - Pacientes Mobile](/static/img7.png)

## ✨ Funcionalidades

- 📊 Dashboard para visualização rápida de estatísticas do sistema
- 👨‍⚕️ Gerenciamento de procedimentos com interface responsiva
- 🗂️ Categorização e organização de procedimentos médicos
- 🧾 Sistema de pré-cadastros com validação e formatação de campos
- 📧 Envio automático de emails com link para cadastro
- 📱 Design responsivo para todas as telas
- 🔍 Filtros avançados por categoria e busca por texto
- 📈 Gráficos de distribuição de procedimentos e status de cadastros
- 🔐 Autenticação e controle de acesso com JWT

## 🛠️ Tecnologias Utilizadas

- **Svelte 5** - Framework reativo para construção de interfaces
- **SvelteKit 2** - Meta-framework para Svelte com renderização do lado do servidor
- **TypeScript** - Superset tipado de JavaScript
- **TailwindCSS** - Framework CSS utilitário
- **Lucide Icons** - Biblioteca de ícones
- **Axios** - Cliente HTTP para requisições à API
- **JWT** - Autenticação baseada em tokens
- **Jest** - Framework de testes

## 📋 Pré-requisitos

- Node.js 18.17.0 ou superior
- npm, yarn, pnpm ou bun

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/chuck-norris-jokes.git
cd chuck-norris-jokes
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

4. Abra [http://localhost:5173](http://localhost:5173) no seu navegador para ver o resultado.

## 🧪 Testes

Execute os testes automatizados com:

```bash
npm test
# ou
yarn test
# ou
pnpm test
# ou
bun test
```

## 🏗️ Estrutura do Projeto

```
integramedic/
├── src/
│   ├── lib/               # Utilitários e componentes
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── services/      # Serviços para comunicação com API
│   │   ├── types/         # Definições de tipos TypeScript
│   │   └── utils/         # Funções utilitárias
│   ├── routes/            # Rotas e páginas da aplicação
│   │   ├── (protected)/   # Páginas acessíveis apenas após login
│   │   └── (public)/      # Páginas públicas
│   └── app.html           # Template HTML principal
├── static/                # Arquivos estáticos
└── tailwind.config.js     # Configuração do TailwindCSS
```

## 📱 Recursos de Acessibilidade

- Design responsivo para todos os tamanhos de tela
- Interface clara e intuitiva
- Feedback visual para ações realizadas
- Mensagens de erro e sucesso bem formatadas
- HTML semântico para melhor acessibilidade

## 🌐 Deployment

A aplicação pode ser facilmente implantada na [Vercel](https://vercel.com) ou qualquer outra plataforma que suporte SvelteKit.

```bash
npm run build
# ou
yarn build
# ou
pnpm build
# ou
bun build
```

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Quilion Oliveira**

- Github: [QuiLion7](https://github.com/QuiLion7)
- LinkedIn: [quilion7](https://www.linkedin.com/in/quilion7/)
- Portfolio: [quilion7](https://quildev.vercel.app/)
