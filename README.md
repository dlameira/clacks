# zap-terminal

WhatsApp Web com cara de terminal e navegação só pelo teclado. É uma extensão do Chromium/Chrome para
`web.whatsapp.com`.

- Visual de terminal: fonte JetBrains Mono, painéis com borda fina, lista compacta, sem papel de parede e balões simétricos.
- Teclado:
  - **↑ / ↓** na lista abre a conversa, e o foco continua na lista;
  - **Esc** volta;
  - **/** busca;
  - **↑** no topo da lista vai para as abas das listas;
  - **↑** com o campo de mensagem vazio entra no modo de navegar mensagens, e **Enter** abre imagem, áudio, link ou documento.

> Projeto pessoal, em andamento. O WhatsApp muda a página com frequência: se algo quebrar, atualize a extensão (abaixo)
> ou abra uma issue.

## Instalar

1. Baixe o código: `git clone https://github.com/dlameira/zap-terminal.git`
   (ou **Code → Download ZIP** nesta página e descompacte).
2. No Chromium/Chrome, abra `chrome://extensions` e ligue o **Modo do desenvolvedor** (canto superior direito).
3. **Carregar sem compactação** → escolha a pasta `zap-terminal`.
4. Abra (ou recarregue) o web.whatsapp.com.

Fonte: o visual usa a **JetBrains Mono**. Se ela não estiver instalada, o navegador usa outra monoespaçada.

## Atualizar

A extensão não se atualiza sozinha:

1. Na pasta: `git pull` (ou baixe o ZIP de novo e substitua a pasta).
2. Em `chrome://extensions`, clique em **↻** na zap-terminal e recarregue o WhatsApp.

## Licença

MIT (`LICENSE`). O arquivo `system-theme.js` vem do [Omarchy](https://github.com/omacom/omarchy), também MIT (`NOTICE`).
