# clacks

> Repo **público**: nada de dados pessoais, nomes de máquinas, caminhos do PC ou detalhes de infraestrutura aqui.

## O que é
Skin para o WhatsApp Web (web.whatsapp.com): extensão do Chromium (Manifest V3, sem empacotar) com cara de terminal e
atalhos para usar só pelo teclado. Nome: a rede de semáforos que leva mensagens no Discworld (irmão do pearwood).
Chamava-se zap-terminal até 2026-11-15; os prefixos internos `zap-` (classes, eventos, `data-zap-segurar`) ficaram.

## Stack
- JavaScript puro + CSS, sem build e sem dependências.

## Rodar localmente
Chromium → `chrome://extensions` → modo desenvolvedor → "Carregar sem compactação" → esta pasta.
Ou fixo: `--load-extension=<caminho do clone>` nas flags do Chromium.
- CSS (`ajustes.css`) recarrega sozinho a cada 2 s (`carregar.js` faz o fetch).
- JS: recarregar a extensão / reiniciar o Chromium.

## Estrutura
- `manifest.json` — dois content scripts: `system-theme.js` + `carregar.js` no mundo isolado; `pagina.js` no mundo MAIN.
- `ajustes.css` — todo o visual (JetBrains Mono 12/11/10px, painéis com borda fina e margens de 6px, lista compacta com
  zoom compensado, sem papel de parede, balões simétricos, rodapé alinhado, telas de carregamento/entrada com "WHATSAPP"
  em letras de bloco). Usa os ganchos estáveis do WhatsApp (`#side`, `#main`, `#pane-side`, `data-testid`), não as classes.
- `carregar.js` — injeta o CSS (recarrega a cada 2 s) e o comportamento, em blocos independentes:
  Esc em níveis; abas das listas pelo teclado; setas na lista abrem a conversa (navegação própria, não a do WhatsApp);
  teclas globais (`/`, setas, Esc) fora de campos de texto; foco na lista ao carregar; modo de navegar mensagens.
  Há um bloco antigo de "prévia da última mensagem" desligado (pode ser removido).
- `pagina.js` — mundo da página: enquanto `<html data-zap-segurar="<timestamp>">` valer, bloqueia `focus()` em `#main`.
- `system-theme.js` — do Omarchy (MIT), com o aviso no topo; texto completo da licença em `NOTICE`.

## Instalação no PC
- O clone é carregado pela linha `--load-extension` das flags do Chromium (no Omarchy, `chromium-flags.conf`).
- A extensão `whatsapp-slim` do Omarchy sai dessa linha: esta a substitui (ela encolhia a lista para só fotos).
- Depois de `git pull`: CSS entra sozinho em ~2 s; mudança de JS pede reiniciar o Chromium
  (`chromium --restore-last-session` devolve as abas).

## Observações
- Desenvolvimento e teste acontecem num PC com Chromium e WhatsApp logado.
- **Testar no PC:** depois do push, atualizar o clone do PC de teste com `git pull` (o comando exato está nas instruções
  do grupo, fora deste repo público) e avisar o que conferir. CSS aparece em ~2 s; JS pede reiniciar o Chromium.
- `README.md` é para quem instala: manter as instruções de instalar/atualizar e a lista de teclas em dia.
- Antes de cada push: conferir que não entrou número de telefone, nome de contato ou print de conversa.
- Parecidos que existem (nenhum faz a navegação por setas): Dark WhatsApp (Stylus), Vimium WhatsApp Helper.

## Pendências
- [ ] Captura de tela para o README, com conversas de exemplo (nunca reais).
- [ ] Opcional: trocar os prefixos internos `zap-` por `clacks-` (pede retestar tudo).
- [ ] Retestar o Esc com imagem aberta no modo de mensagens (corrigido, não retestado).
- [ ] Áudio e documento no modo de navegar mensagens (sem teste).
- [ ] Às vezes, com o WhatsApp recém-aberto, as 2 primeiras setas não respondem (não reproduzido depois da última correção).
- [ ] Cores fixas no tema escuro preto; não seguem a troca de tema do sistema.
- [ ] Remover o bloco desligado da prévia em `carregar.js` e as regras `.zap-previa*` do CSS.

## Onde paramos
2026-11-15 · Primeiro push com o código do PC (v0.3.0). O PC já carrega a extensão direto do clone; testado ali.
