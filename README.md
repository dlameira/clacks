# clacks

**Uma skin para o [WhatsApp Web](https://web.whatsapp.com) com cara de terminal, mais alguns atalhos para usar só pelo
teclado.** É uma extensão para Chromium e Chrome, sem build e sem dependências.

Não é um cliente de WhatsApp nem um programa de terminal. Ela só muda o visual e o teclado da página oficial do
WhatsApp Web, que continua fazendo todo o resto.

## O que ela faz

**Visual**
- Fonte monoespaçada (JetBrains Mono) em três tamanhos, painéis com borda fina e fundo preto.
- Lista de conversas compacta, sem papel de parede e com balões simétricos.
- Telas de carregamento e de entrada com "WHATSAPP" em letras de bloco.

**Teclado**

| Onde | Tecla | O que faz |
|---|---|---|
| Lista de conversas | **↑ / ↓** | anda pela lista e já abre a conversa (o foco continua na lista) |
| Lista de conversas | **/** | busca uma conversa |
| Topo da lista | **↑** | vai para as abas das listas (Tudo, Não lidas…); **← / →** troca de aba |
| Campo de mensagem vazio | **↑** | entra no modo de navegar pelas mensagens |
| Navegando mensagens | **↑ / ↓**, **Enter** | escolhe uma mensagem; Enter abre imagem, áudio, link ou documento |
| Qualquer lugar | **Esc** | volta um nível |

## Instalar

1. Baixe o código: `git clone https://github.com/dlameira/clacks.git`
   (ou **Code → Download ZIP** nesta página e descompacte).
2. No Chromium/Chrome, abra `chrome://extensions` e ligue o **Modo do desenvolvedor** (canto superior direito).
3. Clique em **Carregar sem compactação** e escolha a pasta `clacks`.
4. Abra (ou recarregue) o web.whatsapp.com.

O visual pede a fonte **JetBrains Mono** (ou a JetBrainsMono Nerd Font). Sem ela, o navegador usa outra monoespaçada.

## Atualizar

Ela não se atualiza sozinha:

1. Na pasta: `git pull` (ou baixe o ZIP de novo e substitua a pasta).
2. Em `chrome://extensions`, clique em **↻** no clacks e recarregue o WhatsApp.

## Privacidade

A extensão roda apenas em `web.whatsapp.com`. Não envia nada para lugar nenhum: o único arquivo que ela carrega é o
próprio CSS, de dentro da extensão. Não lê nem guarda as suas mensagens.

## Limitações

- É um projeto pessoal, em andamento, testado no Chromium no Linux.
- O WhatsApp muda a página com frequência, e uma mudança dele pode quebrar parte do visual ou dos atalhos. Se acontecer,
  atualize a extensão ou abra uma issue.
- As cores são fixas no tema escuro.

## O nome

Nos livros do Discworld, de Terry Pratchett, os *clacks* são a rede de torres de semáforo que leva mensagens de um
lado a outro do mundo.

## Licença

MIT (`LICENSE`). O arquivo `system-theme.js` vem do [Omarchy](https://github.com/omacom/omarchy), também MIT (`NOTICE`).
Projeto independente, sem ligação com o WhatsApp ou a Meta.
