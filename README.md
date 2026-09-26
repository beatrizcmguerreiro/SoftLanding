SoftLanding is a quiet space for the moments between a medical test and its results. Write down a worry, watch it float away, and return to the present—without needing to have all the answers yet.

## O que é

Protótipo web mobile-first, em português de Portugal, que implementa o [`softlanding-plan.md`](softlanding-plan.md) com a direção visual do [`visual-style-guide.md`](visual-style-guide.md).

Percurso: chegada → texto livre → organização em «Posso fazer» / «Ainda não posso saber» → pousar um pensamento → regresso ao presente → fecho. Não interpreta exames nem dá respostas médicas.

## Correr

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testes da análise local, validação e salvaguardas
npm run build && npm start   # servidor de produção em http://localhost:4173
```

### IA opcional

Sem configuração, tudo funciona com a **organização local** (fallback). Para ligar a IA, define a chave apenas no servidor:

```bash
ANTHROPIC_API_KEY=... npm run dev     # ou: npm run build && ANTHROPIC_API_KEY=... npm start
# opcional: ANTHROPIC_MODEL=<modelo>
```

A chave é lida só em `server/analyze.mjs` e nunca chega ao browser. Quando a IA está ligada, o ecrã de escrita avisa que o texto é enviado a um serviço externo (Anthropic).

## O que é real e o que é simulado

- **Funcional:** os 4 ecrãs e o estado de apoio humano; análise local determinística; validação da saída da IA (esquema, comprimentos, correspondência com o texto, bloqueio de doenças/probabilidades/tratamentos/falsa tranquilização); gesto de arrastar e botão «Pousar por agora»; teclado, `aria-live`, `prefers-reduced-motion`.
- **Local e limitado:** a organização sem IA divide o texto em frases e orações que a pessoa escreveu. Só reconhece perguntas sobre *quando/como chega o resultado* (microação logística fixa) e menções a *pesquisar* (legenda). Não avalia gravidade.
- **Salvaguardas simples, não triagem:** `needsHumanSupport` e `mentionsNewOrWorseningSymptoms` reconhecem expressões óbvias por palavras-chave. Uma versão pública exigiria revisão clínica, de privacidade e de segurança.
- **Sem dados guardados:** o texto vive só em memória e é limpo ao sair. Sem localStorage, analytics, contas ou base de dados.
- **Desvio assumido do esquema:** se o único pensamento for uma dúvida prática (ex.: «Nem sei quando vem o resultado»), «Ainda não posso saber» fica vazio em vez de inventar um pensamento.
