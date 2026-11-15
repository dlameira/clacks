# clacks

Skin para o WhatsApp Web (web.whatsapp.com): extensão do Chromium (Manifest V3, sem build, sem dependências) com cara de
terminal e atalhos para usar só pelo teclado. Para instalar e usar: `README.md`.

O projeto se chamava zap-terminal. Os prefixos internos `zap-` (classes, eventos, `data-zap-segurar`) continuam no código.

## Regras
- **Nada de conversas reais no repo:** nenhum print, número, nome de contato ou texto de mensagem, nem em comentários,
  testes ou capturas de tela. Exemplos só com dados inventados.
- `README.md` é para quem instala: manter a tabela de teclas, o "instalar/atualizar" e a seção de privacidade de acordo
  com o código. Mudou uma tecla ou passou a acessar a rede? Atualizar o README no mesmo commit.
- A extensão não acessa a rede (só lê o próprio `ajustes.css` via `chrome.runtime.getURL`). Manter assim.
- Subir `version` no `manifest.json` a cada mudança que chega a quem usa.

## Estrutura
- `manifest.json`: dois content scripts. `system-theme.js` + `carregar.js` no mundo isolado; `pagina.js` no mundo MAIN.
- `ajustes.css`: todo o visual (JetBrains Mono 12/11/10px, painéis no padrão do spotatui (linha 1px #7a7a7a, cantos de 6px, título na borda, foco verde, margens alinhadas às linhas dele), lista compacta com
  zoom compensado, balões simétricos, telas de carregamento/entrada com "WHATSAPP" em letras de bloco). Usa os ganchos
  mais estáveis do WhatsApp (`#side`, `#main`, `#pane-side`, `data-testid`, papéis ARIA), não as classes geradas.
- `carregar.js`: injeta o CSS (recarrega a cada 2 s, para desenvolver ao vivo) e o comportamento, em blocos
  independentes: Esc em níveis; abas das listas pelo teclado; setas na lista abrem a conversa (navegação própria, não a
  do WhatsApp); teclas globais (`/`, setas, Esc) fora de campos de texto; foco na lista ao carregar; modo de navegar
  mensagens. Há um bloco antigo de "prévia da última mensagem" desligado.
- `pagina.js`: mundo da página. Enquanto `<html data-zap-segurar="<timestamp>">` valer, bloqueia `focus()` em `#main`
  (o WhatsApp puxa o foco para o campo de mensagem ao abrir uma conversa).
- `system-theme.js`: do Omarchy (MIT), com o aviso no topo; licença completa em `NOTICE`.

## Desenvolvimento
- Carregar a pasta em `chrome://extensions` (modo do desenvolvedor) ou com `--load-extension=<pasta>`.
- CSS entra sozinho em ~2 s. JS pede recarregar a extensão (↻) ou reiniciar o navegador.
- Se o WhatsApp mudar a página: conferir primeiro os seletores em `ajustes.css` e as buscas de elementos em `carregar.js`.
- Parecidos que existem (nenhum faz a navegação por setas): Dark WhatsApp (Stylus), Vimium WhatsApp Helper.

## Pendências
- [ ] Retestar o Esc com imagem aberta no modo de mensagens (corrigido, não retestado).
- [ ] Testar áudio e documento no modo de navegar mensagens.
- [ ] Às vezes, com o WhatsApp recém-aberto, as 2 primeiras setas não respondem (não reproduzido após a última correção).
- [ ] Remover o bloco desligado da prévia em `carregar.js` e as regras `.zap-previa*` do CSS.
- [ ] Captura de tela para o README, com conversas inventadas.
- [ ] Cores fixas no tema escuro; não seguem o tema do sistema.
- [ ] Opcional: trocar os prefixos internos `zap-` por `clacks-` (pede retestar tudo).

## Onde paramos
2026-11-15 · v0.3.1. Renomeado de zap-terminal para clacks; README reescrito para quem instala; histórico sem e-mail pessoal.
