# Controle de Validade de Produtos

Sistema corporativo para controle de validade de produtos destinado ao setor de estoque.

## Tecnologias

- **React 19** + **TypeScript**
- **Vite 8** (build tooling)
- **Tailwind CSS v4** (estilização)
- **React Router DOM v7** (navegação)
- **React Hook Form** + **Zod** (formulários e validação)
- **date-fns** (manipulação de datas)
- **Lucide React** (ícones)
- **ExcelJS** (exportação para Excel)

## Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior (ou pnpm)

## Instalação e execução

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/controle-validade.git
cd controle-validade

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Visualiza o build de produção |
| `npm run lint` | Executa o linter |

## Estrutura do projeto

```
src/
├── types/          # Definições de tipos TypeScript
├── services/       # Camada de serviço (abstração de dados)
├── hooks/          # Hooks customizados React
├── utils/          # Funções utilitárias
├── components/     # Componentes reutilizáveis
│   ├── layout/     # Estrutura de layout (Sidebar, Header)
│   ├── ui/         # Componentes de UI primitivos
│   ├── products/   # Componentes de produtos
│   └── dashboard/  # Componentes do dashboard
├── pages/          # Páginas da aplicação
└── assets/         # Recursos estáticos
```

## Funcionalidades

- **Dashboard** — visão geral com indicadores de status de validade
- **Produtos** — CRUD completo com filtros e busca
- **Alertas** — produtos vencidos, críticos e a vencer
- **Relatórios** — exportação para Excel com filtros por data e categoria

## Arquitetura de dados

Os dados são armazenados no **LocalStorage** através de uma camada de serviço (`src/services/productService.ts`) que implementa a interface `IProductService`. Para migrar para uma API REST, basta criar uma nova implementação da interface sem alterar nenhum componente.

## Status de validade

| Status | Critério | Cor |
|--------|----------|-----|
| Vencido | Data já passou | Vermelho |
| Crítico | Vence em até 7 dias | Laranja |
| Atenção | Vence em até 30 dias | Amarelo |
| OK | Vence após 30 dias | Verde |

## Nota sobre Tailwind CSS v4

Este projeto usa Tailwind CSS v4, que não requer `tailwind.config.js`. A configuração é feita diretamente em `src/index.css` via tokens CSS customizados.
