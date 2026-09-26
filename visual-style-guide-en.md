# Visual Style Guide — Soft Reflective Mobile UI


> Visual direction guide extracted from the reference image. Values are visual approximations and should be adjusted after testing on real devices.

## 1. Visual Essence

A interface combina uma estética de **wellness emocional**, editorial e amigável com uma linguagem premium e suave.

### Key Characteristics

- Atmosfera calma, acolhedora e introspectiva.
- Base cromática clara, com lavanda, creme, branco quente e cinzas muito suaves.
- Contraste entre tipografia serifada expressiva e interface sans-serif discreta.
- Cartões grandes, arredondados e ligeiramente inclinados.
- Uso de sombras difusas, transparências e gradientes atmosféricos.
- Ilustrações simples, com formas orgânicas e expressão emocional.
- Composição com bastante espaço negativo.
- Interações apresentadas como objetos físicos empilhados ou flutuantes.

### Keywords

`calm` · `human` · `editorial` · `soft-tech` · `playful` · `premium` · `introspectivo`

---

## 2. Colour Palette

### Primary Colours

| Token | Hex aproximado | Uso |
|---|---:|---|
| `color.canvas` | `#F4F1EA` | Fundo creme principal, especialmente em ecrãs editoriais. |
| `color.surface` | `#FFFFFF` | Cartões, folhas e superfícies elevadas. |
| `color.surface-warm` | `#FBF8F0` | Superfícies secundárias e cartões com tom quente. |
| `color.lavender-100` | `#F0EEFF` | Fundo lavanda muito claro e estados suaves. |
| `color.lavender-200` | `#DDD9FF` | Fundos de componentes e áreas de destaque. |
| `color.lavender-300` | `#BDB4F5` | Elementos decorativos, ilustrações e seleções. |
| `color.lavender-400` | `#9A8DE7` | Acentos principais, ícones ativos e botões circulares. |
| `color.lavender-500` | `#7568D2` | Acento forte, usado com moderação. |
| `color.ink` | `#17171C` | Títulos e texto de maior importância. |
| `color.text` | `#4D4B55` | Texto principal de interface. |
| `color.text-muted` | `#85818D` | Labels, metadados e texto auxiliar. |
| `color.line` | `#E8E6E8` | Divisores e bordas subtis. |
| `color.black-button` | `#242326` | CTA principal de alto contraste. |
| `color.success-yellow` | `#F4CB4E` | Pequenos acentos positivos e indicadores. |
| `color.coral` | `#F18487` | Expressões, alertas suaves ou estados emocionais. |

### Gradientes

```css
--gradient-lavender: linear-gradient(145deg, #F3F0FF 0%, #C4BDF7 100%);
--gradient-warm: linear-gradient(145deg, #FFFDF7 0%, #F3EEDC 100%);
--gradient-atmosphere: radial-gradient(circle at 50% 15%, #FFFFFF 0%, #F0EEFF 58%, #E5E2F8 100%);
```

### Colour Rules

- Usar creme ou branco quente como base; evitar branco puro em grandes áreas quando a interface tiver conteúdo editorial.
- Reservar o lavanda para orientar, destacar e criar personalidade — não usar em todos os componentes.
- Usar texto quase preto em vez de preto absoluto para reduzir agressividade.
- Manter os estados positivos suaves e não excessivamente saturados.
- Garantir contraste suficiente para texto e controles; validar sempre com WCAG.

---

## 3. Typography

A referência usa uma combinação de serif editorial para títulos e sans-serif neutra para a interface.

### Recommended Fonts

#### Headings and Titles

- Preferência: `DM Serif Display`, `Cormorant Garamond`, `Fraunces` ou `Playfair Display`.
- Peso: regular ou medium.
- Forma: contraste alto, serifas elegantes e proporções compactas.
- Uso: headlines, perguntas, frases emocionais e mensagens de boas-vindas.

#### Interface and Body

- Preferência: `Inter`, `DM Sans`, `Manrope` ou `Plus Jakarta Sans`.
- Peso: regular, medium e semibold.
- Uso: botões, navegação, metadados, descrições e labels.

### Suggested Type Scale

| Token | Tamanho | Line-height | Peso | Uso |
|---|---:|---:|---:|---|
| `type.display` | 40 px | 0.98 | 400 | Hero editorial. |
| `type.h1` | 32 px | 1.05 | 400 | Títulos principais. |
| `type.h2` | 25 px | 1.10 | 400 | Perguntas e títulos de cartões. |
| `type.h3` | 20 px | 1.15 | 500 | Secções e subtítulos. |
| `type.body-lg` | 17 px | 1.40 | 400 | Mensagens introdutórias. |
| `type.body` | 15 px | 1.40 | 400 | Texto corrente. |
| `type.label` | 13 px | 1.20 | 500 | Labels e filtros. |
| `type.caption` | 11 px | 1.25 | 400 | Metadados, contagens e contexto. |

### Typography Rules

- Usar títulos serifados com alinhamento centrado em ecrãs emocionais ou de onboarding.
- Manter headlines curtas, normalmente entre 2 e 4 linhas.
- Usar largura máxima de aproximadamente `280–320 px` para perguntas em mobile.
- Evitar tracking excessivo nos títulos serifados.
- Usar sans-serif para informação funcional e ações.
- Usar capitalização normal; evitar títulos totalmente em maiúsculas.
- Criar contraste hierárquico através de tamanho, peso e espaço — não apenas através da cor.

---

## 4. Spacing and Layout

A composição é generosa, centrada e vertical. Os elementos parecem respirar à volta de um eixo central.

### Base System

Usar uma unidade de `4 px`:

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 28px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Margins and Areas

- Margem horizontal de ecrã: `24–32 px`.
- Distância entre ícone de topo e conteúdo: `24–40 px`.
- Espaço entre título e subtítulo: `8–12 px`.
- Espaço entre conteúdo principal e CTA: `24–40 px`.
- Margem inferior segura em mobile: `24 px` ou mais.
- Área de navegação inferior: `72–88 px` de altura.
- Manter uma coluna principal com largura máxima de `360 px` em mobile.

### Layout

- Preferir alinhamento central para onboarding, estados emocionais e ilustrações.
- Usar alinhamento à esquerda em listas, cartões de conteúdo e dados.
- Criar profundidade com camadas deslocadas verticalmente entre `8–20 px`.
- Não preencher toda a área disponível; o espaço vazio faz parte da linguagem.
- Usar uma grelha simples de 4 ou 8 pontos para manter consistência.

---

## 5. Shape, Radius and Borders

### Raios

| Token | Valor | Uso |
|---|---:|---|
| `radius-sm` | `12 px` | Chips pequenos e campos. |
| `radius-md` | `18 px` | Botões e componentes compactos. |
| `radius-lg` | `28 px` | Cartões principais. |
| `radius-xl` | `36 px` | Painéis e superfícies grandes. |
| `radius-pill` | `999 px` | Chips, seletores e botões arredondados. |

### Regras de forma

- Cartões principais devem ter cantos bastante arredondados.
- Botões primários podem ser pill-shaped ou ter raio entre `18–24 px`.
- Ícones de ação devem viver em círculos ou círculos suaves.
- Ilustrações devem evitar geometrias rígidas; preferir blobs e silhuetas orgânicas.
- Usar bordas quase invisíveis, entre `1 px` e `#E8E6E8`.

---

## 6. Shadows and Depth

A referência usa sombras muito suaves, mais próximas de uma elevação atmosférica do que de uma sombra pronunciada.

```css
--shadow-card: 0 10px 30px rgba(40, 37, 62, 0.08);
--shadow-float: 0 14px 34px rgba(58, 50, 100, 0.12);
--shadow-button: 0 5px 14px rgba(47, 42, 79, 0.12);
--shadow-inset: inset 0 1px 0 rgba(255, 255, 255, 0.65);
```

### Regras

- Evitar sombras pretas fortes.
- Combinar sombra externa com uma linha interna branca muito subtil.
- Usar elevação maior em cartões flutuantes e menor em superfícies fixas.
- Não depender apenas da sombra para comunicar hierarquia ou estado.

---

## 7. UI Components

### Primary Button

- Fundo: `#242326`.
- Texto: branco.
- Altura: `48–52 px`.
- Raio: `20–26 px`.
- Label centrada, sans-serif medium.
- Largura: full-width no onboarding, com margens laterais de `24 px`.
- Hover/pressed: reduzir ligeiramente o brilho e aplicar escala de `0.98`.

### Circular Action Button

- Tamanho recomendado: `48–56 px`.
- Fundo lavanda ou branco.
- Ícone escuro ou lavanda forte.
- Sombra suave.
- Usar para avançar, adicionar, guardar ou marcar como favorito.

### Chips and Filters

- Altura: `32–36 px`.
- Padding horizontal: `12–16 px`.
- Raio pill.
- Fundo neutro, com estado selecionado em lavanda claro.
- Texto entre `12–13 px`.
- Evitar bordas pesadas.

### Editorial Card

- Fundo branco ou branco quente.
- Raio: `28–36 px`.
- Padding interno: `24–28 px`.
- Título serifado entre `24–32 px`.
- Metadados pequenos e cinza.
- Pode receber rotação muito subtil, entre `-2deg` e `2deg`.
- Cartões empilhados podem usar variações de creme e lavanda.

### Bottom Navigation

- Container branco, com raio pill ou raio grande.
- Sombra difusa.
- Ícones simples, com um único estado ativo destacado.
- Separar navegação principal do botão de ação através de espaço ou círculo independente.
- Altura suficiente para toque confortável.

### Inputs e seleção emocional

- Usar opções horizontais em formato pill quando houver poucas opções.
- Estado selecionado: fundo lavanda claro, contorno ou sombra lavanda e texto lavanda escuro.
- Estado não selecionado: fundo neutro e texto muted.
- A seleção deve ser identificável sem depender apenas de cor; adicionar peso, contorno ou escala.

---

## 8. Illustration and Visual Language

### Direction

- Formas arredondadas e volumétricas.
- Personagens simples, quase mascotes.
- Olhos grandes e expressivos para criar empatia.
- Poucos detalhes; priorizar silhueta e emoção.
- Fundo lavanda com uma forma de contraste suave.
- Paleta limitada a lavanda, branco, preto suave e coral.

### Regras

- Uma ilustração deve comunicar rapidamente um estado emocional.
- Evitar realismo e excesso de textura.
- Usar pequenas variações de expressão para estados como feliz, ansioso, cansado ou triste.
- Manter o objeto ilustrado centrado e com espaço respirável à volta.

---

## 9. Motion and Interaction

As transições devem parecer suaves e físicas, sem se tornarem infantis ou excessivamente animadas.

```css
--ease-soft: cubic-bezier(0.22, 1, 0.36, 1);
--duration-fast: 160ms;
--duration-base: 240ms;
--duration-slow: 420ms;
```

### Recommendations

- Entrada de cartões: fade + movimento vertical de `8–16 px`.
- Troca entre cartões: slide horizontal curto com rotação muito subtil.
- Seleção de opção: escala para `1.02`, mudança de fundo e pequena elevação.
- Botões: feedback pressionado com escala `0.97–0.98`.
- Ilustrações: utilizar microanimações lentas, como flutuação ou respiração.
- Respeitar `prefers-reduced-motion` e remover movimentos não essenciais.

---

## 10. Accessibility

- Manter áreas de toque mínimas próximas de `44 × 44 px`.
- Não usar lavanda clara como única cor para texto.
- Validar contraste de texto, ícones e estados selecionados.
- Garantir que chips e seletores têm indicação visual e semântica de seleção.
- Fornecer labels para ícones sem texto.
- Usar foco visível em navegação por teclado.
- Não comunicar o estado emocional apenas pela cor; combinar texto, ícone ou forma.

---

## 11. Tokens CSS iniciais

```css
:root {
  --color-canvas: #F4F1EA;
  --color-surface: #FFFFFF;
  --color-surface-warm: #FBF8F0;
  --color-lavender-100: #F0EEFF;
  --color-lavender-200: #DDD9FF;
  --color-lavender-300: #BDB4F5;
  --color-lavender-400: #9A8DE7;
  --color-lavender-500: #7568D2;
  --color-ink: #17171C;
  --color-text: #4D4B55;
  --color-text-muted: #85818D;
  --color-line: #E8E6E8;
  --color-black-button: #242326;
  --color-coral: #F18487;
  --color-yellow: #F4CB4E;

  --font-display: "DM Serif Display", "Cormorant Garamond", serif;
  --font-ui: "Inter", "DM Sans", sans-serif;

  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 28px;
  --radius-xl: 36px;
  --radius-pill: 999px;

  --shadow-card: 0 10px 30px rgba(40, 37, 62, 0.08);
  --shadow-float: 0 14px 34px rgba(58, 50, 100, 0.12);

  --ease-soft: cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

## 12. Implementation Checklist

- [ ] O fundo é claro, quente e não excessivamente branco.
- [ ] A paleta usa lavanda como acento controlado.
- [ ] Headings editoriais usam serif; a interface usa sans-serif.
- [ ] Existe uma hierarquia tipográfica clara.
- [ ] Os cartões têm raio amplo, padding generoso e sombra difusa.
- [ ] Os principais elementos estão organizados em torno de um eixo central.
- [ ] Os botões têm áreas de toque confortáveis.
- [ ] Os estados selecionados são claros sem depender apenas da cor.
- [ ] As ilustrações são simples, orgânicas e emocionalmente legíveis.
- [ ] As animações são lentas, suaves e podem ser reduzidas.
- [ ] O contraste e a acessibilidade foram validados antes da entrega.

## 13. Final Principle

> Criar uma interface que pareça um espaço seguro: suave à primeira vista, expressiva nos detalhes e suficientemente clara para nunca competir com o conteúdo emocional.