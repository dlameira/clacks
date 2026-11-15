# zap-terminal

> Repo **público**: nada de dados pessoais, nomes de máquinas, caminhos do PC ou detalhes de infraestrutura aqui.

## O que é
Extensão do Chromium (Manifest V3, sem empacotar) que dá ao WhatsApp Web (web.whatsapp.com) cara de terminal/Neovim
e navegação só pelo teclado.

## Stack
- JavaScript puro + CSS, sem build e sem dependências.

## Rodar localmente
Chromium → `chrome://extensions` → modo desenvolvedor → "Carregar sem compactação" → esta pasta.
Ou fixo: `--load-extension=<caminho do clone>` nas flags do Chromium.
- CSS (`ajustes.css`) recarrega sozinho a cada 2 s (`carregar.js` faz o fetch).
- JS: recarregar a extensão / reiniciar o Chromium.

## Estrutura
- `manifest.json` — dois content scripts: um no mundo isolado, um no mundo MAIN.
- `ajustes.css` — todo o visual (JetBrains Mono 12/11/10px, painéis com borda fina, lista compacta, sem papel de parede,
  balões simétricos, telas de carregamento/entrada com "WHATSAPP" em letras de bloco).
- `carregar.js` — comportamento: ↑/↓ na lista abre a conversa (foco fica na lista), Esc volta, `/` busca, ↑ no topo vai
  para as abas das listas, ↑ no campo vazio entra no modo de navegar mensagens (Enter abre imagem, áudio, link, documento).
- `pagina.js` — mundo da página: impede o WhatsApp de puxar o foco para o campo de mensagem durante a navegação.
- `system-theme.js` — vem do Omarchy (MIT): manter o aviso de copyright original no topo do arquivo.

## Observações
- Desenvolvimento e teste acontecem num PC com Chromium e WhatsApp logado.
- Antes de cada push: conferir que não entrou número de telefone, nome de contato ou print de conversa.
- Parecidos que existem (nenhum faz a navegação por setas): Dark WhatsApp (Stylus), Vimium WhatsApp Helper.

## Pendências
- [ ] Retestar o Esc com imagem aberta (corrigido, não retestado).
- [ ] Áudio e documento no modo de navegar mensagens.
- [ ] README para quem for instalar.

## Onde paramos
2026-11-15 · Repo criado; o código vem do PC no primeiro push.
