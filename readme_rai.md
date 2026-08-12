# RAI — Relatório de Ação Inicial

## Visão Geral

O **RAI (Relatório de Ação Inicial)** é o primeiro documento formal produzido em uma investigação de acidente ou incidente espacial no âmbito do SIPAE/CENIPA. Ele registra os fatos iniciais coletados imediatamente após o conhecimento da ocorrência.

O formulário dinâmico RAI está integrado ao sistema ÁQUILA e é acessível diretamente pelo menu **Ação** na lista de Ocorrências Gerais.

---

## Estado de Implementação

| Seção | Status |
|---|---|
| 1 — Histórico | ✅ Implementado |
| 2 — Informações Gerais da Ocorrência | ⚠️ Parcial (leitura ok; campos adicionais pendentes) |
| 3 — Pessoal Envolvido | ❌ Não implementado (requer novo model) |
| 4 — Informações Operacionais | ❌ Não implementado |
| 5 — Artefato | ⚠️ Parcial (leitura de `OcorrenciaAeronave`; campos novos pendentes) |
| 6 — Instalações | ❌ Não implementado |
| 7 — Meteorologia | ⚠️ Parcial (apenas texto livre; ~35 campos estruturados pendentes) |
| 8 — Croqui | ❌ Não implementado |
| 9 — Destroços | ❌ Não implementado (~40 campos) |
| 10 — Fotografias | ❌ Não implementado (até 15 uploads) |
| 11 — Danos a Terceiros | ❌ Não implementado |
| 12 — Informações Adicionais | ❌ Não implementado |
| 13 — Informações Administrativas | ❌ Não implementado (~15 campos) |
| 14 — Críticas | ❌ Não implementado |
| 15 — Comissão de Investigação | ⚠️ Parcial (referenciar `OcorrenciaComissao`) |

---

## Fluxo de Uso

### Pré-condições
- A ocorrência deve existir no sistema (status: qualquer).
- O usuário deve ter permissão de acesso ao módulo de ocorrências.

### Como Acessar

1. Acesse **Ocorrências → Ocorrência Geral** no menu lateral.
2. Na linha da ocorrência desejada, clique no botão **Ação**.
3. Se o RAI ainda não existe, o menu mostrará **"Criar RAI"** (ícone: `add_circle`).
4. Se já existe, mostrará **"Editar RAI"** (ícone: `edit_document`).
5. Clique para acessar o formulário.

### Salvar e Finalizar

- **Salvar Rascunho**: Botão sempre disponível no topo e na Seção de Controle. Salva com `status_rai = RASCUNHO`.
- **Finalizar RAI**: Disponível na Seção de Controle. Muda `status_rai` para `FINALIZADO` automaticamente antes do envio.

---

## Campos do Modelo

**Model principal:** `OcorrenciaRegistroRai`  
**Tabela:** `ocorrencia_registro_rai`

Legenda: ✅ = já existe no model | ❌ = a criar

---

### Seção 1 — Histórico

Texto narrativo livre sobre o evento.

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `historico_evento` | TextField | ✅ | Narrativa cronológica dos fatos |
| `sequencia_falhas` | TextField | ✅ | Falhas identificadas em ordem |
| `dados_telemetria_rai` | TextField | ✅ | Dados de telemetria relevantes ao evento |

---

### Seção 2 — Informações Gerais da Ocorrência

Maioria dos campos vem de `OcorrenciaGeral` (somente leitura). Campos marcados como ❌ são novos em `OcorrenciaRegistroRai`.

| Campo | Fonte / Tipo | Status | Descrição |
|---|---|---|---|
| Número do processo | `OcorrenciaGeral.numero_processo` (leitura) | ✅ | — |
| Classificação | `OcorrenciaGeral.classificacao` (leitura) | ✅ | ACIDENTE / INCIDENTE / INFORTÚNIO |
| Data da ocorrência | `OcorrenciaGeral.dia` (leitura) | ✅ | — |
| Hora local | `OcorrenciaGeral.horario` (leitura) | ✅ | — |
| Data UTC | `OcorrenciaGeral.dia_utc` (leitura) | ✅ | — |
| Hora UTC | `OcorrenciaGeral.horario_utc` (leitura) | ✅ | — |
| `periodo_dia` | CharField choices | ❌ | Dia / Noite / Crepúsculo |
| Local | `OcorrenciaGeral.local` (leitura) | ✅ | — |
| Município | `OcorrenciaGeral.cidade` FK (leitura) | ✅ | — |
| UF | derivado de `cidade` (leitura) | ✅ | — |
| `tempo_ate_acao_inicial` | CharField(50) | ❌ | Ex.: "2h 30min" |
| Operador | `OcorrenciaAeronave.operador` (leitura) | ✅ | — |
| `fonte_informacao_ocorrencia` | TextField | ❌ | Como o CENIPA tomou conhecimento da ocorrência |

---

### Seção 3 — Pessoal Envolvido

Estrutura **repetível** (N pessoas). Requer novo model `OcorrenciaRaiPessoal` com FK para `OcorrenciaRegistroRai`.

**Model a criar:** `OcorrenciaRaiPessoal`  
**Tabela:** `ocorrencia_rai_pessoal`

| Campo | Tipo | Descrição |
|---|---|---|
| `rai` | FK → OcorrenciaRegistroRai | Vínculo com o RAI |
| `funcao` | CharField(100) | Função no evento (ex.: operador, supervisor) |
| `nome` | CharField(200) | Nome completo |
| `contato` | CharField(200) | Telefone / e-mail |
| `lesoes` | CharField choices | FATAL / GRAVE / LEVE / ILESO / INDETERMINADO |
| `posicao_no_evento` | CharField(200) | Localização ou papel durante o evento |
| `observacoes` | TextField | Informações adicionais |

---

### Seção 4 — Informações Operacionais

Campos a adicionar em `OcorrenciaRegistroRai`.

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `informacoes_operacionais` | TextField | ❌ | Contexto operacional no momento do evento |
| `procedimentos_em_execucao` | TextField | ❌ | Procedimentos que estavam sendo executados |
| `desvios_procedimento` | TextField | ❌ | Desvios de procedimento identificados |

---

### Seção 5 — Artefato

Campos de identificação lidos de `OcorrenciaAeronave` (somente leitura). Campos de detalhe técnico são novos em `OcorrenciaRegistroRai`.

| Campo | Fonte / Tipo | Status | Descrição |
|---|---|---|---|
| Designação / Artefato | `OcorrenciaAeronave.artefato_espacial` (leitura) | ✅ | — |
| Tipo | `OcorrenciaAeronave.tipo` (leitura) | ✅ | — |
| Fase da Missão | `OcorrenciaAeronave.fase_missao` (leitura) | ✅ | — |
| Danos ao Artefato | `OcorrenciaAeronave.danos` (leitura) | ✅ | — |
| `fabricante_rai` | CharField(200) | ❌ | Fabricante do artefato |
| `modelo_rai` | CharField(200) | ❌ | Modelo / designação técnica |
| `ano_fabricacao_rai` | IntegerField | ❌ | Ano de fabricação |
| `numero_serie_rai` | CharField(100) | ❌ | Número de série |
| `horas_ciclos_rai` | CharField(100) | ❌ | Horas / ciclos de operação |
| `observacoes_artefato_rai` | TextField | ❌ | Observações técnicas adicionais |

---

### Seção 6 — Instalações

Campos a adicionar em `OcorrenciaRegistroRai`.

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `instalacoes_envolvidas` | TextField | ❌ | Instalações de solo, launchpad, centro de controle, etc. |
| `comentarios_instalacoes` | TextField | ❌ | Condições e observações sobre as instalações |

---

### Seção 7 — Meteorologia

Substituir o campo genérico `condicoes_ambientais` por campos estruturados. Campos a adicionar em `OcorrenciaRegistroRai`.

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `condicoes_ambientais` | TextField | ✅ | Campo genérico atual (manter para compatibilidade) |
| `meteo_origem_informacao` | CharField choices | ❌ | PILOTO / ORGAO_METEO / TESTEMUNHA / OUTRO |
| `meteo_vento_direcao` | IntegerField | ❌ | Direção do vento em graus (0–360) |
| `meteo_vento_velocidade` | DecimalField | ❌ | Velocidade do vento (nós ou km/h) |
| `meteo_vento_rajada` | DecimalField | ❌ | Velocidade de rajada |
| `meteo_vento_tipo` | CharField choices | ❌ | CALMO / VARIAVEL / CONSTANTE |
| `meteo_visibilidade_km` | DecimalField | ❌ | Visibilidade horizontal (km) |
| `meteo_teto_ft` | IntegerField | ❌ | Teto (pés) |
| `meteo_nebulosidade` | CharField choices | ❌ | SKC / FEW / SCT / BKN / OVC |
| `meteo_temperatura_c` | DecimalField | ❌ | Temperatura do ar (°C) |
| `meteo_ponto_orvalho_c` | DecimalField | ❌ | Ponto de orvalho (°C) |
| `meteo_pressao_hpa` | DecimalField | ❌ | Pressão atmosférica (hPa) |
| `meteo_periodo_dia` | CharField choices | ❌ | DIA / NOITE / CREPUSCULO_MATUTINO / CREPUSCULO_VESPERTINO |
| `meteo_chuva` | BooleanField | ❌ | Havia precipitação? |
| `meteo_trovao` | BooleanField | ❌ | Havia trovões? |
| `meteo_nevoeiro` | BooleanField | ❌ | Havia nevoeiro? |
| `meteo_granizo` | BooleanField | ❌ | Havia granizo? |
| `meteo_turbulencia` | BooleanField | ❌ | Havia turbulência? |
| `meteo_gelo` | BooleanField | ❌ | Havia formação de gelo? |
| `meteo_clima_espacial` | TextField | ❌ | Atividade solar, tempestades geomagnéticas, Kp index |
| `meteo_radiacao_solar` | CharField(100) | ❌ | Nível de radiação solar no momento |
| `meteo_debris_espacial` | TextField | ❌ | Debris espacial identificados na trajetória |
| `meteo_observacoes` | TextField | ❌ | Observações meteorológicas gerais |

---

### Seção 8 — Croqui

Campos a adicionar em `OcorrenciaRegistroRai`.

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `croqui_tipo` | CharField choices | ❌ | SÍTIO_LANÇAMENTO / TRAJETÓRIA / DESTROÇOS / OUTRO |
| `croqui_escala` | CharField(50) | ❌ | Ex.: "1:5000", "Sem escala" |
| `croqui_descricao` | TextField | ❌ | Descrição / legenda do croqui |
| `croqui_norte_magnetico` | BooleanField | ❌ | Croqui com referência ao norte magnético? |
| `croqui_arquivo` | FileField | ❌ | Upload do croqui (imagem ou PDF) |
| `croqui_observacoes` | TextField | ❌ | Observações adicionais |

---

### Seção 9 — Destroços

Campos a adicionar em `OcorrenciaRegistroRai`. Seção de maior volume de campos.

**Localização e terreno**

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `destrocos_localizacao` | TextField | ❌ | Descrição da localização dos destroços |
| `destrocos_latitude` | CharField(100) | ❌ | Latitude do ponto principal de destroços |
| `destrocos_longitude` | CharField(100) | ❌ | Longitude do ponto principal de destroços |
| `destrocos_altitude_m` | DecimalField | ❌ | Altitude do local (metros) |
| `destrocos_tipo_terreno` | CharField choices | ❌ | PLANO / ACIDENTADO / ALAGADO / URBANO / MAR / OUTRO |
| `destrocos_vegetacao` | CharField choices | ❌ | NENHUMA / RASTEIRA / ARBUSTIVA / FLORESTA / DENSA |
| `destrocos_acesso` | CharField choices | ❌ | FACIL / DIFICIL / INACESSIVEL |

**Impacto**

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `destrocos_angulo_impacto` | IntegerField | ❌ | Ângulo de impacto (graus) |
| `destrocos_velocidade_impacto` | CharField(100) | ❌ | Estimativa de velocidade no impacto |
| `destrocos_area_dispersao_m2` | DecimalField | ❌ | Área de dispersão dos destroços (m²) |
| `destrocos_direcao_dispersao` | IntegerField | ❌ | Direção principal da dispersão (graus) |
| `destrocos_peca_mais_distante_m` | DecimalField | ❌ | Distância da peça mais distante do ponto de impacto (m) |
| `destrocos_tipo_impacto` | CharField choices | ❌ | PONTO_UNICO / DISPERSO / RASTRO |

**Fogo**

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `destrocos_fogo` | BooleanField | ❌ | Houve fogo? |
| `destrocos_fogo_antes_impacto` | BooleanField | ❌ | Fogo antes do impacto? |
| `destrocos_fogo_durante_impacto` | BooleanField | ❌ | Fogo durante o impacto? |
| `destrocos_fogo_apos_impacto` | BooleanField | ❌ | Fogo após o impacto? |
| `destrocos_fogo_combatido` | BooleanField | ❌ | Fogo foi combatido? |
| `destrocos_fogo_descricao` | TextField | ❌ | Descrição do incêndio |

**Distribuição dos destroços**

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `destrocos_fuselagem` | BooleanField | ❌ | Encontrado: fuselagem |
| `destrocos_motor` | BooleanField | ❌ | Encontrado: motor / propulsor |
| `destrocos_paineis_solares` | BooleanField | ❌ | Encontrado: painéis solares |
| `destrocos_bateria` | BooleanField | ❌ | Encontrado: baterias |
| `destrocos_eletronico` | BooleanField | ❌ | Encontrado: componentes eletrônicos |
| `destrocos_tanque` | BooleanField | ❌ | Encontrado: tanque(s) de combustível |
| `destrocos_combustivel_derramado` | BooleanField | ❌ | Houve derramamento de combustível? |
| `destrocos_material_perigoso` | BooleanField | ❌ | Há material perigoso no local? |
| `destrocos_descricao_geral` | TextField | ❌ | Descrição geral dos destroços encontrados |
| `destrocos_observacoes` | TextField | ❌ | Observações adicionais |

---

### Seção 10 — Fotografias

Modelo separado `OcorrenciaRaiFoto` (FK → `OcorrenciaRegistroRai`) ou até 15 campos `FileField` diretos. Recomenda-se model separado para flexibilidade.

**Model a criar:** `OcorrenciaRaiFoto`  
**Tabela:** `ocorrencia_rai_foto`

| Campo | Tipo | Descrição |
|---|---|---|
| `rai` | FK → OcorrenciaRegistroRai | Vínculo com o RAI |
| `arquivo` | FileField | Imagem (jpg, png, tiff) |
| `numero` | IntegerField | Número da foto (1–15) |
| `descricao` | CharField(300) | Legenda / descrição da fotografia |
| `data_foto` | DateField | Data em que a foto foi tirada |

---

### Seção 11 — Danos a Terceiros

Campos a adicionar em `OcorrenciaRegistroRai`.

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `danos_terceiros_descricao` | TextField | ❌ | Descrição dos danos causados a terceiros |
| `danos_terceiros_observacoes` | TextField | ❌ | Observações adicionais |

---

### Seção 12 — Informações Adicionais

Campos a adicionar em `OcorrenciaRegistroRai`.

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `informacoes_adicionais` | TextField | ❌ | Outros fatos relevantes não cobertos pelas demais seções |
| `informacoes_adicionais_obs` | TextField | ❌ | Observações complementares |

---

### Seção 13 — Informações Administrativas

Campos a adicionar em `OcorrenciaRegistroRai`.

**Custos**

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `custo_artefato` | DecimalField | ❌ | Valor estimado do artefato (R$) |
| `custo_danos_terceiros` | DecimalField | ❌ | Valor estimado dos danos a terceiros (R$) |
| `custo_operacao_resgate` | DecimalField | ❌ | Custo da operação de resgate/recuperação (R$) |
| `custo_observacoes` | TextField | ❌ | Observações sobre os custos |

**Procedimentos Legais (checkboxes)**

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `procedimento_policia` | BooleanField | ❌ | Houve acionamento de Polícia? |
| `procedimento_ministerio_publico` | BooleanField | ❌ | Houve acionamento do MP? |
| `procedimento_ib` | BooleanField | ❌ | Houve acionamento do IBAMA/ICMBio? |
| `procedimento_defesa_civil` | BooleanField | ❌ | Houve acionamento da Defesa Civil? |
| `procedimento_outro` | BooleanField | ❌ | Outro procedimento legal |
| `procedimento_outro_descricao` | CharField(200) | ❌ | Descrição do outro procedimento |

**Dificuldades na Investigação**

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `dificuldades_investigacao` | TextField | ❌ | Dificuldades encontradas na coleta de dados |
| `adm_observacoes` | TextField | ❌ | Observações administrativas gerais |

---

### Seção 14 — Críticas

Campos a adicionar em `OcorrenciaRegistroRai`.

| Campo | Tipo | Status | Descrição |
|---|---|---|---|
| `criticas` | TextField | ❌ | Críticas, ressalvas ou divergências do investigador |

---

### Seção 15 — Comissão de Investigação

Estrutura **repetível**. Referenciar/estender `OcorrenciaComissao` ou criar `OcorrenciaRaiComissao` específico.

**Opção recomendada:** reutilizar `OcorrenciaComissao` e exibir seus membros como somente leitura no formulário RAI (os dados já existem).

| Campo | Fonte / Tipo | Status | Descrição |
|---|---|---|---|
| Investigador | `OcorrenciaComissao.investigador` (leitura) | ✅ | Membro da comissão |
| Função | `OcorrenciaComissao.funcao` (leitura) | ✅ | Função na investigação |
| `identificacao_rai` | CharField(100) na comissão | ❌ | Identificação funcional no RAI (ex.: nº portaria) |

---

### Campos de Controle do RAI (Seção de Controle)

Já implementados em `OcorrenciaRegistroRai`.

| Campo | Tipo | Choices | Descrição |
|---|---|---|---|
| `status_rai` | CharField(20) | RASCUNHO, FINALIZADO | Status atual do RAI |
| `data_rai` | DateField | — | Data de elaboração do RAI |
| `responsavel_rai` | FK → User | — | Investigador responsável pelo RAI |
| `observacoes` | TextField | — | Observações gerais |
| `cadastrado_em` | DateField (auto) | — | Data de criação |
| `atualizado_em` | DateTimeField (auto) | — | Última atualização |

---

## Resumo de Novos Models Necessários

| Model | Tabela | Motivo |
|---|---|---|
| `OcorrenciaRaiPessoal` | `ocorrencia_rai_pessoal` | Pessoal envolvido (N repetições) — Seção 3 |
| `OcorrenciaRaiFoto` | `ocorrencia_rai_foto` | Fotografias (até 15 uploads) — Seção 10 |

Todos os demais campos ausentes são adicionados diretamente no model `OcorrenciaRegistroRai`.

---

## Resumo de Campos Novos em `OcorrenciaRegistroRai`

| Seção | Qtd. campos novos |
|---|---|
| 2 — Informações Gerais | 3 |
| 4 — Informações Operacionais | 3 |
| 5 — Artefato | 6 |
| 6 — Instalações | 2 |
| 7 — Meteorologia | 22 |
| 8 — Croqui | 6 |
| 9 — Destroços | 27 |
| 11 — Danos a Terceiros | 2 |
| 12 — Informações Adicionais | 2 |
| 13 — Informações Administrativas | 13 |
| 14 — Críticas | 1 |
| **Total** | **~87 campos novos** |

---

## Auditoria e Histórico de Mudanças

O model `OcorrenciaRegistroRai` está registrado no **django-auditlog**. Todas as criações, edições e exclusões são rastreadas automaticamente com:

- Usuário responsável pela alteração
- Timestamp da alteração
- Campos alterados com valor anterior e novo

Dentro do formulário RAI, clique no botão **"Histórico"** (canto superior direito) para acessar o auditlog padrão.

---

## Arquitetura do Componente

### Arquivos

| Arquivo | Papel |
|---|---|
| `ocorrencia/models.py` | `OcorrenciaRegistroRai` + models relacionados |
| `ocorrencia/admin.py` | `OcorrenciaRegistroRaiAdmin` — admin com template customizado |
| `ocorrencia/apps.py` | Registro no auditlog |
| `ocorrencia/migrations/0043_rai_campos.py` | Migração dos campos iniciais |
| `templates/admin/ocorrencia/rai_change_form.html` | Template do formulário por seções |

### Stack Tecnológica

- **Django Admin** — roteamento, permissões, CSRF, form validation
- **Unfold** — tema visual (TailwindCSS)
- **Alpine.js** — navegação entre seções, barra de progresso, transições
- **django-auditlog** — rastreamento de mudanças
- **Material Symbols Outlined** — iconografia

---

## Desenvolvimento

### Aplicar Migrações

```bash
python manage.py migrate
```

### Verificar Configuração

```bash
python manage.py check
```

### Testar Manualmente

1. Acesse `/admin/` e entre com credenciais.
2. Navegue até **Ocorrência Geral**.
3. Escolha uma ocorrência e acesse o menu **Ação → Criar RAI**.
4. Preencha as seções disponíveis e salve.
5. Verifique que o botão passou a mostrar **Editar RAI**.
6. Clique em **Histórico** e confirme que o registro de criação aparece no auditlog.

---

## Próximos Passos

### Curto prazo — Campos ausentes
1. Adicionar ~87 campos novos em `OcorrenciaRegistroRai` e criar migrations.
2. Criar model `OcorrenciaRaiPessoal` (Seção 3 — Pessoal Envolvido).
3. Criar model `OcorrenciaRaiFoto` (Seção 10 — Fotografias).
4. Expandir o template `rai_change_form.html` com as novas seções (navegação lateral de 7 → 15 seções).

### Médio prazo
- **Exportação PDF**: Gerar o RAI preenchido em formato PDF baseado no `Template_RAI_SIPAE_CENIPA.pdf`.
- **Validação de completude**: Bloquear avanço de fase (`MIN`) se campos obrigatórios do RAI não estiverem preenchidos.
- **Notificação**: Enviar e-mail ao investigador responsável quando o RAI for finalizado.

### Longo prazo
- **Assinatura digital**: Integrar assinatura eletrônica no momento da finalização.
