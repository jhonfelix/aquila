# 🚀 ÁQUILA - Sistema de Gestão de Ocorrências Espaciais

Sistema para registro, gestão e investigação de ocorrências espaciais, desenvolvido para o **CENIPA** (Centro de Investigação e Prevenção de Acidentes Aeronáuticos).

**Backend:** Django 5.2 + Django REST Framework
**Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Radix UI
**Orquestração:** Docker Compose (MySQL 8, Django, Next.js, nginx)
**Status:** Em migração ativa de Django Admin (Unfold) para uma interface própria em Next.js — os dois convivem lado a lado durante a transição (ver [Status da Migração](#-status-da-migração)).

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Arquitetura](#-arquitetura)
- [Requisitos](#-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Modelos de Dados](#-modelos-de-dados)
- [Funcionalidades](#-funcionalidades)
- [Autenticação e Segurança](#-autenticação-e-segurança)
- [Status da Migração](#-status-da-migração)
- [Comandos Úteis](#-comandos-úteis)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Sobre o Projeto

O **ÁQUILA** gerencia o ciclo de vida completo de uma ocorrência espacial (acidentes, incidentes e anomalias envolvendo veículos lançadores e artefatos espaciais), cobrindo:

- Redação, confirmação e autenticação de ocorrências (máquina de estados com controle de permissão por etapa)
- Cadastro do artefato espacial/veículo lançador envolvido, com upload de documentos
- Controle da investigação (status, prioridade, fase, órgão investigador)
- Gestão da comissão de investigação (membros e funções)
- Comunicação internacional (ASOACI / Representante Acreditado)
- Divulgação do relatório final (PT/EN/ES) e painel de revisão por setor
- Taxonomia de referência (países, UFs, cidades, aeródromos, artefatos espaciais, veículos lançadores)
- Material de apoio (formulários, normas/legislação, documentos diversos, investigações de outras autoridades)
- Usuários, grupos e permissões, com autenticação em dois fatores (TOTP)
- Auditoria automática de criação/edição/exclusão via `django-auditlog`

---

## 🏗️ Arquitetura

```
                         nginx (porta 80)
                 /api|admin|2fa|_nested_admin|media → Django
                                  /  → Next.js
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            web (Django + DRF)          frontend (Next.js)
                    │
                    ▼
              db (MySQL 8)
```

- **Same-origin, sem JWT:** frontend e backend vivem atrás do mesmo nginx, então a autenticação usa **sessão/cookie** do Django (`SessionAuthentication`), com CSRF via header `X-CSRFToken`. Não há necessidade de CORS.
- **Django Admin nunca sai de cena:** fica disponível em `/admin/` como fallback operacional permanente para as equipes, mesmo depois que todas as telas do Next.js estiverem prontas.
- **`/media/` é autenticado:** downloads de documentos passam por `dedalo/media_views.py`, que checa a sessão antes de fazer `X-Accel-Redirect` para o nginx (não há mais acesso público direto a arquivos enviados).

---

## 🔧 Requisitos

- **Docker Desktop** (com WSL2 no Windows) — é a única forma suportada de rodar o projeto localmente; não há mais fluxo de `venv` + `runserver` direto no host.
- Portas livres no host: `80` (nginx), `3306` (MySQL), `9000` (Portainer, opcional).


Regras obrigatórias:

- Modifique apenas o que foi solicitado.
- Nunca altere módulos que não tenham relação com a tarefa.
- Preserve todo código existente que esteja funcionando.
- Antes de criar uma função, verifique se já existe uma semelhante.
- Não altere nomes de tabelas, APIs, tipos ou contratos sem autorização.
- Mantenha o padrão de código já existente.
- Se uma alteração puder impactar outros módulos, pare e explique antes de modificar.

Caso seja necessário modificar um módulo diferente do solicitado,
pare e explique o motivo antes de alterar qualquer arquivo.
---

## 📦 Instalação e Execução

### 1. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (mesmo diretório do `docker-compose.yml`):

```env
# Django
SECRET_KEY=troque-por-uma-chave-secreta
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Banco de dados
DB_NAME=orion_django
DB_USER=root
DB_PASSWORD=defina-uma-senha
DB_HOST=db
DB_PORT=3306

# CSRF
CSRF_TRUSTED_ORIGINS=http://localhost
```

### 2. Subir os containers

```bash
docker compose up -d --build
```

O `entrypoint.sh` do backend aguarda o MySQL ficar disponível, roda `collectstatic` e `migrate` automaticamente antes de subir o Django.

### 3. Criar um superusuário

```bash
docker compose exec web python manage.py createsuperuser
```

O login é feito por **e-mail**, não por username.

### 4. Acessar o sistema

| URL | O quê |
|---|---|
| `http://localhost/` | Frontend Next.js (dashboard, ocorrências, taxonomia, etc.) |
| `http://localhost/admin/` | Django Admin (fallback operacional, sempre disponível) |
| `http://localhost/api/` | API REST (DRF), documentada via `drf-spectacular` |
| `http://localhost:9000` | Portainer (gestão dos containers, opcional) |

---

## 📁 Estrutura do Projeto

```
aquila/
├── docker-compose.yml        # Orquestra db, web, frontend, nginx, portainer
├── .env                      # Variáveis de ambiente (não versionado)
├── nginx/
│   └── nginx.conf            # Proxy same-origin: /api|admin|... → Django, resto → Next.js
│
├── backend/                  # Django + DRF
│   ├── dedalo/                # Configurações do projeto (settings, urls, media_views)
│   ├── api/                   # Monta as sub-rotas /api/{auth,taxonomia,material-apoio,ocorrencia,usuarios,grupos}/
│   ├── usuario/                # User customizado, login/2FA, CRUD de usuários e grupos
│   ├── ocorrencia/             # App principal — OcorrenciaGeral e ~25 modelos filhos
│   ├── taxonomia/              # Geografia, aeródromos, artefatos espaciais, veículos lançadores
│   ├── material_apoio/         # Formulários, normas, documentos, investigações de outras autoridades
│   ├── labdata/, mensagem/     # Apps auxiliares
│   └── entrypoint.sh           # Aguarda MySQL, roda collectstatic + migrate
│
└── frontend/                 # Next.js 14 (App Router) + TypeScript
    ├── app/                    # Rotas (login, 2fa, ocorrencias, taxonomia, material-apoio, usuarios, grupos)
    ├── components/              # Sidebar, AppShell, AsyncCombobox, ThemeToggle, crud/{ResourceListPage,ResourceFormPage}
    └── lib/                     # api.ts (cliente HTTP), types.ts, choices.ts, ui.tsx (design system), cn.ts, format.ts
```

---

## 🗄️ Modelos de Dados

### `usuario` — Usuários e Autenticação

Modelo `User` customizado (`AbstractBaseUser`), autenticação por e-mail:

- `nome`, `nome_guerra`, `email` (único), `posto_graduacao`, `local_trabalho` (CENIPA/SERIPA 1-7/DCTA)
- `credencial`, `qualificacao`, `telefone`, `cpf`
- `totp_secret`, `totp_enabled`, `totp_obrigatorio` — autenticação em dois fatores
- Grupos e permissões via `django.contrib.auth` (`PermissionsMixin`)

### `ocorrencia` — Módulo Principal

**`OcorrenciaGeral`** é o agregado raiz, com máquina de estados `CONFIRMAR → AUTENTICAR → AUTENTICADO` (transições feitas por ações dedicadas na API, não por edição direta do campo `status`). Modelos filhos (1:N ou 1:1 via `ocorrencia_id`), organizados nas 8 abas da tela de detalhe:

| Aba | Modelo(s) | Conteúdo |
|---|---|---|
| Geral | `OcorrenciaGeral` | Classificação, tipo, data/hora, localização, danos a terceiros |
| Artefato Espacial | `OcorrenciaAeronave` | Veículo lançador envolvido, tipo, danos, fase da missão |
| Controle | `OcorrenciaControle` | Status da investigação, órgão, prioridade, fase atual |
| Gestão | `OcorrenciaComissao` | Membros da comissão de investigação e suas funções |
| Documentos | `OcorrenciaDocumento` | Upload de documentos por tipo |
| Internacional | `OcorrenciaAsoaci` | Notificação inicial e Representante Acreditado |
| Divulgação | `OcorrenciaRelatorio` | Relatório final PT/EN/ES, publicação, elos de coordenação |
| Revisão Relatório | `OcorrenciaRevisaoRelatorio` | Painel de revisão por setor, com anexo por etapa |

Outros modelos do app (`OcorrenciaFatorContribuinte`, `OcorrenciaFatorHumano`, `OcorrenciaJuridico`, `OcorrenciaRegistroRai` etc.) fazem parte do **formulário RAI**, ainda não implementado no frontend (ver [Status da Migração](#-status-da-migração)).

### `taxonomia` — Dados de Referência

- `GeografiaPais`, `GeografiaUf`, `GeografiaCidade`
- `AerodromoGeral` — ICAO/IATA, coordenadas, operação VFR/IFR
- `ArtefatoEspacial` — designação, tipo (foguete/satélite/sonda/cápsula/estação), status
- `VeiculoLancador` — FK 1:1 para `ArtefatoEspacial`; propulsão, massa, carga útil, estágios

### `material_apoio`

- `MaterialApoio` — cobre Formulários, Normas/Legislação e Documentos Diversos via o campo `categoria` (os "proxy models" do Admin viram um filtro `?categoria=` na API)
- `InvestigacaoOutrasAutoridades` — investigações conduzidas por outras autoridades (FAA, NTSB, ESA etc.)

---

## ✨ Funcionalidades

### Frontend (Next.js)

- **Dashboard inicial:** contagem de ocorrências por status + últimas atividades do usuário (via `django-auditlog`)
- **Sidebar colapsável** com navegação por seções (Taxonomia, Material de Apoio, Usuários), atalho rápido para "Nova Ocorrência" e alternância de tema
- **Tema claro/escuro**, persistido em `localStorage`, sem flash ao carregar
- **CRUD completo** de Taxonomia (6 entidades), Material de Apoio (4 seções) e Usuários/Grupos — busca, criação, edição e exclusão
- **Fluxo de Ocorrência completo:** redigir → confirmar → autenticar, com as 8 abas de detalhe listadas acima
- **Autocomplete assíncrono** para todos os relacionamentos (cidade, aeródromo, veículo lançador, usuário, etc.)
- Design system próprio (`lib/ui.tsx`) sobre Tailwind CSS, ícones `lucide-react`, primitivas acessíveis `@radix-ui` (tabs, dropdown, dialog, alert-dialog, checkbox)

### Backend (Django Admin, fallback)

- Interface administrativa completa via **django-unfold**, com os mesmos 8 grupos de abas, filtros avançados, autocomplete e ações em massa (exportar JSON/CSV)
- Histórico de alterações por registro (via `django-auditlog`)

### API (DRF)

- Todos os módulos acima expostos em `/api/`, com paginação, busca (`?search=`), filtros por campo e, em Material de Apoio, filtro multi-valor (`?categoria=A,B,C`)
- Autenticação: `POST /api/auth/login/`, verificação/ativação de 2FA em `/api/auth/2fa/{setup,verify,disable}/`, sessão atual em `/api/auth/me/`
- Documentação automática via `drf-spectacular`

---

## 🔐 Autenticação e Segurança

- Login por e-mail + senha; 2FA via TOTP (Google Authenticator, Authy etc.), opcionalmente obrigatório por usuário (`totp_obrigatorio`)
- Sessão Django compartilhada entre Admin e API — logar em um não loga automaticamente no outro app visualmente, mas o cookie de sessão é o mesmo
- `/media/` protegido: qualquer download de documento exige sessão autenticada
- Permissões por modelo via `DjangoModelPermissions` (padrão do DRF) — os grupos definidos em `/grupos/` (ou no Admin) controlam o que cada usuário pode ver/editar na API

⚠️ **Configuração atual é de desenvolvimento.** Antes de qualquer uso em produção: gerar uma `SECRET_KEY` nova, definir `DEBUG=False`, restringir `ALLOWED_HOSTS`/`CSRF_TRUSTED_ORIGINS` ao domínio real, e revisar as credenciais do `.env`.

---

## 🔄 Status da Migração

Migração faseada de Django Admin para Next.js, mantendo o Admin como fallback permanente (não há data prevista para desligá-lo).

| Fase | Escopo | Status |
|---|---|---|
| 0 | Fundação DRF (serializers/viewsets para os modelos simples) + correção do gap de auth em `/media/` | ✅ Concluída |
| 1 | Auth/2FA via API + shell do Next.js (login, nginx same-origin) | ✅ Concluída |
| 2 | Módulo carro-chefe: Ocorrência → Artefato Espacial → Documentos → Controle | ✅ Concluída |
| 3 | CRUD de Taxonomia, Material de Apoio e Usuários/Grupos no Next.js | ✅ Concluída |
| — | Design system (Tailwind + Radix + Lucide), sidebar, tema claro/escuro, dashboard inicial, demais abas de Ocorrência (Gestão, Internacional, Divulgação, Revisão Relatório) | ✅ Concluída |
| 4 | Visualizador de histórico/auditoria, exportação em massa, painel de revisão RF dedicado | ⏳ Pendente |
| 5 | Formulário dinâmico RAI (~87 campos, 2 modelos ainda não implementados) — tratado como subprojeto à parte | ⏳ Pendente |
| 6 | Corte final: nginx passa a servir só Next.js em `/`, Admin definitivamente só em `/admin/` | ⏳ Pendente (depende das fases 4-5) |

**Gaps conhecidos:**
- Tripulantes e lesões (dados aninhados dentro de Artefato Espacial) ainda não têm API — é o único formulário genuinamente aninhado do sistema, sinalizado para prototipação separada.
- Atribuição de grupos a um usuário e edição de permissões de um grupo ainda não têm UI no Next.js (usar o Admin nesse meio-tempo).

---

## 🛠️ Comandos Úteis

### Containers

```bash
# Subir tudo (com rebuild)
docker compose up -d --build

# Rebuildar só um serviço
docker compose build frontend
docker compose build web

# Logs
docker compose logs -f web
docker compose logs -f frontend

# Parar tudo
docker compose down
```

### Django (dentro do container `web`)

```bash
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py showmigrations
docker compose exec web python manage.py check
docker compose exec web python manage.py shell
docker compose exec web python manage.py collectstatic --noinput
```

### Frontend (dentro do container `frontend`, ou local com Node 20)

```bash
docker compose exec frontend npm run lint
```

---

## 🔍 Troubleshooting

### `docker compose build` falha ou trava por espaço em disco

Sintoma comum no Windows: `docker system df` mostra pouco uso, mas o host está com o disco cheio mesmo assim. Causa: o VHDX do WSL2 (`%LOCALAPPDATA%\Docker\wsl\data\ext4.vhdx`) cresce dinamicamente e **não encolhe sozinho** quando dados são apagados de dentro dele.

1. Primeiro, limpeza segura (sempre reclamável): `docker image prune -f` e `docker builder prune -f`.
2. Se não for suficiente, compactar o VHDX exige uma janela elevada: parar o Docker Desktop → `wsl --shutdown` → `diskpart` → `select vdisk file="...\ext4.vhdx"` → `attach vdisk readonly` → `compact vdisk` → `detach vdisk`.
3. **Nunca** apagar volumes nomeados (`docker volume rm`) sem confirmar antes que não guardam dados reais — cheque `docker-compose.yml` para ver se um serviço usa bind mount (pasta comum, seguro) ou volume Docker gerenciado (pode conter dados importantes).

### Erro de conexão com o MySQL

- Confirme que o container `db` está `Up`: `docker compose ps`
- As credenciais em `.env` (`DB_NAME`, `DB_USER`, `DB_PASSWORD`) precisam bater com o que o container `db` foi inicializado — se você mudar a senha depois do primeiro `up`, vai precisar recriar o volume/pasta `./mysql`.

### Alterei um model e a mudança não aparece

Modelos ficam dentro do container `web` — depois de editar `models.py`, rode:

```bash
docker compose exec web python manage.py makemigrations
docker compose exec web python manage.py migrate
```

### Mudanças no frontend não aparecem

O frontend roda como build de produção (`next build` + `next start`), não em modo dev com hot-reload. Depois de editar código em `frontend/`, é preciso rebuildar a imagem:

```bash
docker compose build frontend
docker compose up -d frontend
```

---

## 📞 Suporte

1. Verifique a seção [Troubleshooting](#-troubleshooting) acima
2. Documentação do Django: https://docs.djangoproject.com/
3. Documentação do DRF: https://www.django-rest-framework.org/
4. Documentação do Next.js: https://nextjs.org/docs
5. Logs dos containers (`docker compose logs -f <serviço>`) para mensagens de erro detalhadas

---

## 📄 Licença

Este projeto é de uso interno do CENIPA/SERIPAs.

---

**Desenvolvido para:** CENIPA - Centro de Investigação e Prevenção de Acidentes Aeronáuticos
