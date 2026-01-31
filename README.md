# 🚪 Porta Aberta

**Plataforma SaaS de feedback anônimo corporativo para pequenas empresas.**

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)

---

## 📑 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Configuração dos Serviços](#configuração-dos-serviços)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

O **Porta Aberta** é uma plataforma SaaS desenvolvida para pequenas empresas brasileiras que desejam criar um canal seguro de comunicação anônima com seus colaboradores.

### Problema que Resolve

- **Medo de retaliação**: Colaboradores frequentemente têm receio de expressar opiniões honestas
- **Falta de canal seguro**: Muitas empresas não possuem meios confiáveis para coletar feedback verdadeiro
- **Dificuldade de análise**: Sem ferramentas adequadas, é difícil categorizar e analisar feedbacks
- **Desconexão entre gestão e equipe**: Gestores perdem insights valiosos por falta de comunicação aberta

### Público-Alvo

- Pequenas empresas brasileiras (10 a 120 colaboradores)
- Empresas que buscam melhorar cultura organizacional
- Organizações que valorizam privacidade e segurança de dados

---

## ✨ Funcionalidades

- ✅ Feedback 100% anônimo (sem coleta de IP, cookies ou login)
- ✅ Dashboard com análise de sentimento em tempo real
- ✅ Categorização automática de feedbacks por IA
- ✅ Gerenciamento de acessos por empresa
- ✅ Relatórios exportáveis
- ✅ Conformidade com LGPD

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Propósito |
|--------|------------|-----------|
| Frontend | React + Vite + TypeScript | Interface do usuário |
| Estilização | Tailwind CSS + shadcn/ui | Design system |
| Backend | Supabase | Database, Auth, Storage |
| Automações | n8n | Workflows e integrações |
| Chatbot | Typebot | Onboarding e cadastro |

---

## 🏗️ Arquitetura

```
┌────────────────┐
│   COLABORADOR  │
│  (Anônimo)     │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│    INTERFACE   │ → Coleta Feedback
└───────┬────────┘
        │
        ▼
┌────────────────┐
│      n8n       │ → Webhook + Processamento
└───────┬────────┘
        │
        ▼
┌────────────────┐
│   SUPABASE     │ → Armazena dados
└───────┬────────┘
        │
        ▼
┌─────────────────┐
│    INTERFACE    │ → Dashboard para gestores
└─────────────────┘
```

### Fluxos Principais

1. **Cadastro de Empresa**: Typebot → n8n → Supabase → Email de pagamento
2. **Envio de Feedback**: Colaborador → Interface → Supabase → Análise IA
3. **Análise de Feedbacks**: Gestor → Login Google → Dashboard → Relatórios

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ (recomendado usar [nvm](https://github.com/nvm-sh/nvm))
- npm ou bun
- Conta no Supabase
- Conta no n8n (self-hosted ou cloud)
- Conta no Typebot

### Passos

```bash
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd porta-aberta

# 2. Instale as dependências
npm install
# ou
bun install

# 3. Inicie o servidor de desenvolvimento
npm run dev
# ou
bun dev
```

O servidor iniciará em `http://localhost:8080`

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

### Frontend

| Variável | Descrição | Onde encontrar |
|----------|-----------|----------------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Dashboard Supabase > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Chave pública anônima | Dashboard Supabase > Settings > API |
| `VITE_N8N_WEBHOOK_URL` | URL base dos webhooks n8n | Painel n8n > Workflow > Webhook node |
| `VITE_N8N_CONTACT_URL` | URL do webhook de contato | Painel n8n > WF01 > Webhook node |
| `VITE_CONTACT_API_KEY` | Chave de autenticação para API | Definida manualmente no n8n |

### Typebot

| Variável | Descrição |
|----------|-----------|
| `TYPEBOT_WORKSPACE_ID` | ID do workspace |
| `N8N_WEBHOOK_BASE` | URL dos webhooks para integração |

---

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Visualiza build de produção |
| `npm run lint` | Executa linter (ESLint) |
| `npm run test` | Executa testes (Vitest) |

---

## 🔧 Configuração dos Serviços

### Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Anote as credenciais (URL e Anon Key)
3. Execute as migrations para criar as tabelas
4. Configure RLS (Row Level Security) nas tabelas sensíveis
5. Habilite provedor Google OAuth e configure URLs de callback

### n8n

1. Instale o n8n:
   ```bash
   npm install -g n8n
   n8n start
   ```
2. Importe os workflows (JSONs)
3. Configure as credenciais do Supabase
4. Ative os workflows e copie as URLs dos webhooks

### Typebot

1. Acesse [typebot.io](https://typebot.io)
2. Importe o JSON do bot
3. Atualize as URLs dos webhooks
4. Publique o bot e copie a URL de embed

---

## 💰 Planos

| Plano | Colaboradores | Preço | Usuários Dashboard | Feedbacks/mês |
|-------|---------------|-------|-------------------|---------------|
| Essencial | Até 10 | R$ 50 | 1 | 50 |
| Profissional | Até 30 | R$ 97 | 3 | 130 |
| Avançado | Até 60 | R$ 147 | 5 | 250 |
| Premium | Até 120 | R$ 197 | 10 | 500 |

---

## 📚 Documentação

Para documentação técnica completa, consulte o [Notion do projeto](https://www.notion.so/2f80a983e91881cc8174e1b2a7978f73).

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.
