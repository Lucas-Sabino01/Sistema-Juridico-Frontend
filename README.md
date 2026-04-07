# ⚖️ Sistema Jurídico Integrado (SaaS) - Frontend

Este repositório contém o Frontend de uma plataforma de gestão jurídica de alta performance, projetada para centralizar processos, prazos e automação de documentos em um único ecossistema digital. O sistema foi desenvolvido para atender às demandas de organização e produtividade de escritórios de advocacia modernos.

## 🏗️ Módulos do Sistema

O sistema é dividido em módulos estratégicos para cobrir todas as frentes do fluxo jurídico:

### 📋 Gestão de Fluxo (Kanban)
* **Interface visual:** Acompanhamento de processos em diferentes estágios (Triagem, Em Andamento, Concluído).
* **Organização:** Uso de "cards" que facilitam a visualização rápida do status de cada ação judicial.

### 📅 Agenda Jurídica (Calendário)
* **Centralização:** Controle de prazos processuais e datas de audiências.
* **Sincronização:** Interface visual pensada para evitar a perda de compromissos críticos.

### 🤖 Inteligência Artificial (Extrator de Audiência)
* **O "cérebro" do sistema:** Realiza o upload de múltiplos PDFs em lote.
* **Google Gemini:** Utiliza modelos avançados para extrair dados semânticos e técnicos dos termos de audiência.
* **Classificação Automática:** Identifica áreas (Família, Cível, Fazenda Pública) e sugere encaminhamentos jurídicos.

### 📊 Analytics & Relatórios
* **Dashboard:** Visualização de métricas e performance da carteira de processos.
* **Relatórios:** Geração de relatórios detalhados e exportação de dados para Excel (.xlsx) de forma automatizada.

### 📁 Gestão de Arquivos & Importação
* **Documentos:** Módulo dedicado para armazenamento e consulta de arquivos digitais.
* **Importador Excel:** Ferramenta para alimentação em massa da base de dados via planilhas externas.

### 🔐 Administração e Segurança
* **Painel Admin:** Gestão completa de usuários e permissões de acesso.
* **Segurança:** Autenticação protegida com persistência de sessão e proteção contra falhas de rede.

## 🛠️ Stack Tecnológica

* **Core:** React + TypeScript (Vite).
* **Design System:** Tailwind CSS com componentes Shadcn/UI e Radix.
* **Experiência Visual:** Animações fluidas com GSAP e elementos imersivos com Three.js.
* **Comunicação:** Axios com interceptores de eventos globais para resiliência de conexão.
* **Ícones:** Lucide React.
