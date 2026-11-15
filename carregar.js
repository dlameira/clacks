// Aplica ajustes.css e reaplica quando o arquivo muda (confere a cada 2 s),
// para ajustar o visual sem reiniciar o navegador.
(() => {
  const url = chrome.runtime.getURL("ajustes.css");
  const estilo = document.createElement("style");
  estilo.id = "zap-terminal";
  let atual = "";
  const aplicar = async () => {
    try {
      const css = await (await fetch(url, { cache: "no-store" })).text();
      if (css !== atual) { atual = css; estilo.textContent = css; }
      if (!estilo.isConnected) (document.head || document.documentElement).appendChild(estilo);
    } catch (e) { /* extensão recarregando: tenta de novo na próxima volta */ }
  };
  aplicar();
  setInterval(aplicar, 2000);
})();

// Navegação pelo teclado, estilo Neovim:
//   Esc (com o cursor na conversa)  -> foco vai para a lista de conversas
//   ↑ / ↓ na lista                   -> anda entre as conversas (nativo do WhatsApp)
//   Enter na lista                   -> abre a conversa com o cursor no campo de mensagem (nativo)
//   / na lista                       -> busca de conversas (igual a Ctrl + Alt + /)
// (→ para abrir não é possível: o WhatsApp ignora teclas e cliques simulados por extensão.)
(() => {
  const naLista = () => document.activeElement && document.activeElement.closest("#pane-side");
  const focarLista = () => {
    const alvo =
      document.querySelector('#pane-side [aria-selected="true"]')?.closest('[role="gridcell"][tabindex]') ||
      document.querySelector('#pane-side [role="gridcell"][tabindex="0"]') ||
      document.querySelector('#pane-side [role="gridcell"][tabindex]');
    if (alvo) alvo.focus();
  };
  // Voltando para a janela do WhatsApp: foco na lista, na última conversa aberta,
  // pronto para ↑ / ↓. Se você clicar direto no campo de mensagem, o clique ganha.
  window.addEventListener("focus", () => setTimeout(() => {
    const a = document.activeElement;
    const digitando = a && a.isContentEditable && a.textContent.trim() !== "";
    if (!naLista() && !digitando) focarLista();
  }, 150));

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    // Esc de qualquer lugar fora da lista volta para ela (campo de mensagem, busca,
    // ou depois de clicar numa mensagem, quando o foco não está em lugar nenhum).
    // Com menu, emoji ou janela aberta, o Esc só fecha isso, como sempre.
    // O Esc nativo do WhatsApp FECHA a conversa (por isso às vezes o foco se perdia).
    // Aqui ele só leva o foco para a lista e a conversa continua aberta à direita.
    if (e.key === "Escape" && !naLista()) {
      const aberto = document.querySelector('[role="dialog"], [role="menu"], [role="listbox"], [data-testid="popup-contents"], [data-testid="media-viewer"]');
      if (aberto) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      document.documentElement.dataset.zapSegurar = String(Date.now() + 30 * 60 * 1000);
      focarLista();
      return;
    }
    if (e.key === "/" && naLista()) {
      const busca = document.querySelector('#side input[role="textbox"]');
      if (busca) { e.preventDefault(); busca.focus(); }
    }
  }, true);
})();

// Prévia ao andar pela lista: mostra a última mensagem da conversa em foco no
// painel da direita, no mesmo lugar onde ela fica quando a conversa abre
// (embaixo, logo acima do campo de mensagem). Não abre a conversa, então não
// marca nada como lido. Some ao abrir (Enter) ou ao sair da lista.
(() => {
  let caixa = null;
  const linhaDe = (el) => el && el.closest && el.closest('#pane-side [role="row"]');
  const painel = () =>
    document.querySelector("#main") ||
    document.querySelector('[data-testid="intro-panel"]')?.parentElement;

  const esconder = () => { if (caixa) caixa.hidden = true; };

  const medir = () => {
    // Usa a conversa aberta (se houver) como régua, para a prévia cair no mesmo lugar.
    const main = document.querySelector("#main");
    const r = { topo: 60, rodape: 62, margem: 64, ladoEu: 64 };
    if (!main) return r;
    const mr = main.getBoundingClientRect();
    const h = main.querySelector("header"); if (h) r.topo = h.getBoundingClientRect().height;
    const f = main.querySelector("footer"); if (f) r.rodape = mr.bottom - f.getBoundingClientRect().top;
    const entrada = [...main.querySelectorAll('[data-id^="false_"] [data-testid="msg-container"]')].pop();
    if (entrada) r.margem = entrada.getBoundingClientRect().left - mr.left;
    const saida = [...main.querySelectorAll('[data-id^="true_"] [data-testid="msg-container"]')].pop();
    if (saida) r.ladoEu = mr.right - saida.getBoundingClientRect().right;
    return r;
  };

  const mostrar = (linha) => {
    if (!linha || linha.querySelector('[aria-selected="true"]')) return esconder();
    const p = painel(); if (!p) return esconder();
    const nome = linha.querySelector('[data-testid="cell-frame-title"]')?.textContent.trim() || "";
    const segunda = linha.querySelector('[data-testid="cell-frame-secondary"]');
    const texto = segunda?.querySelector("span[title]")?.getAttribute("title") || segunda?.textContent.trim() || "";
    const hora = linha.querySelector('[data-testid="cell-frame-primary-detail"]')?.textContent.trim() || "";
    const minha = !!segunda?.querySelector('[data-icon*="check"], [data-icon*="status"]');
    const foto = linha.querySelector("img")?.src || "";
    if (!caixa) {
      caixa = document.createElement("div");
      caixa.className = "zap-previa";
      caixa.innerHTML = '<div class="zap-previa-topo"><img alt=""><span></span></div><div class="zap-previa-msg"><span class="zap-previa-txt"></span><span class="zap-previa-hora"></span></div>';
      document.body.appendChild(caixa);
    }
    const pr = p.getBoundingClientRect(), m = medir();
    Object.assign(caixa.style, { left: pr.left + "px", top: pr.top + "px", width: pr.width + "px", height: pr.height + "px" });
    caixa.style.setProperty("--topo", m.topo + "px");
    const img = caixa.querySelector("img"); img.src = foto; img.hidden = !foto;
    caixa.querySelector(".zap-previa-topo span").textContent = nome;
    const msg = caixa.querySelector(".zap-previa-msg");
    msg.classList.toggle("eu", minha);
    msg.style.bottom = m.rodape + 8 + "px";
    msg.style.left = minha ? "auto" : m.margem + "px";
    msg.style.right = minha ? m.ladoEu + "px" : "auto";
    caixa.querySelector(".zap-previa-txt").textContent = texto.replace(/^\s*(✓|✔)+\s*/, "");
    caixa.querySelector(".zap-previa-hora").textContent = hora;
    caixa.hidden = false;
  };

  // (prévia desligada: as setas agora abrem a conversa de verdade)
  document.addEventListener("keydown", (e) => { if (e.key === "Enter") esconder(); }, true);
  document.addEventListener("mousedown", esconder, true);
  window.addEventListener("blur", esconder);
  window.addEventListener("resize", esconder);
})();

// Teclado entre a lista de conversas e as listas (abas Tudo, Não lidas, ...):
//   ↑ na primeira conversa  -> sobe para as abas, na aba ativa
//   ← / → nas abas           -> anda entre as abas
//   Enter nas abas           -> troca de lista (Enter de verdade, nativo)
//   ↓ nas abas               -> volta para a lista de conversas
(() => {
  const abas = () => [...document.querySelectorAll('#side [role="tablist"] [role="tab"]')].filter((a) => a.offsetParent);
  const naAba = () => document.activeElement && document.activeElement.closest('#side [role="tablist"]');
  const primeiraConversa = () => {
    const linhas = [...document.querySelectorAll('#pane-side [role="row"]')]
      .filter((r) => r.querySelector('[data-testid="cell-frame-title"]') && r.querySelector('[role="gridcell"][tabindex]'))
      .map((r) => [r, r.getBoundingClientRect().top]).sort((a, b) => a[1] - b[1]);
    return linhas.length ? linhas[0][0] : null;
  };
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const a = document.activeElement;
    if (e.key === "ArrowUp" && a && a.closest("#pane-side")) {
      const linha = a.closest('[role="row"]'), topo = primeiraConversa();
      const pane = document.querySelector("#pane-side");
      if (linha && topo && linha === topo && pane.scrollTop < 5) {
        const lista = abas(); if (!lista.length) return;
        e.preventDefault(); e.stopImmediatePropagation();
        (lista.find((x) => x.getAttribute("aria-selected") === "true") || lista[0]).focus();
      }
      return;
    }
    if (!naAba()) return;
    const lista = abas(), i = lista.indexOf(a.closest('[role="tab"]'));
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault(); e.stopImmediatePropagation();
      const j = Math.max(0, Math.min(lista.length - 1, i + (e.key === "ArrowRight" ? 1 : -1)));
      lista[j]?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault(); e.stopImmediatePropagation();
      const alvo = primeiraConversa()?.querySelector('[role="gridcell"][tabindex]');
      alvo?.focus();
    }
  }, true);
})();

// Setas abrem a conversa: ↑ / ↓ na lista já entram na conversa (que fica marcada
// como lida), mantendo o foco na lista para continuar descendo.
//   → ou Enter: vai para o campo de mensagem da conversa aberta.
(() => {
  let timer = null;
  let ultimoNome = "";
  // Logo depois de abrir pelas setas, o WhatsApp tenta pôr o cursor no campo de
  // mensagem. A página (pagina.js) bloqueia isso enquanto este marcador valer.
  const segurar = (ms) => { document.documentElement.dataset.zapSegurar = String(ms ? Date.now() + ms : 0); };
  const NAVEGANDO = 30 * 60 * 1000; // vale enquanto você navega pela lista; solta ao ir escrever
  // clicar na conversa (campo de mensagem, mensagens) solta o bloqueio antes do clique agir
  document.addEventListener("pointerdown", (e) => { if (e.target.closest && e.target.closest("#main")) segurar(0); }, true);
  const abrir = (linha) => {
    const alvo = linha.querySelector('[data-testid="cell-frame-title"] span[title]') ||
      [...linha.querySelectorAll('[data-testid="cell-frame-title"] span')].find((s) => s.offsetWidth > 0 && s.children.length === 0) || linha;
    const r = alvo.getBoundingClientRect();
    const o = { bubbles: true, cancelable: true, composed: true, view: window,
      clientX: r.left + Math.min(20, r.width / 2), clientY: r.top + r.height / 2,
      button: 0, buttons: 1, pointerId: 1, pointerType: "mouse", isPrimary: true };
    alvo.dispatchEvent(new PointerEvent("pointerdown", o));
    alvo.dispatchEvent(new MouseEvent("mousedown", o));
    alvo.dispatchEvent(new PointerEvent("pointerup", { ...o, buttons: 0 }));
    alvo.dispatchEvent(new MouseEvent("mouseup", { ...o, buttons: 0 }));
    alvo.dispatchEvent(new MouseEvent("click", { ...o, buttons: 0 }));
  };
  // a lista é redesenhada ao abrir uma conversa: acha a linha de novo pelo nome
  const nomeDe = (linha) => (linha?.querySelector('[data-testid="cell-frame-title"] span[title]')?.getAttribute("title") || "").trim();
  const voltarFoco = (linha) => {
    const nome = typeof linha === "string" ? linha : nomeDe(linha);
    const atual = [...document.querySelectorAll('#pane-side [role="row"]')].find((r) => nomeDe(r) === nome);
    const g = atual?.querySelector('[role="gridcell"][tabindex]');
    if (g && document.activeElement !== g) g.focus({ preventScroll: true });
  };
  const abrirFocada = () => {
    const linha = document.activeElement?.closest('#pane-side [role="row"]');
    if (!linha) return;
    const nome = nomeDe(linha);
    const aberta = (document.querySelector('#main header [data-testid="conversation-info-header-chat-title"]')?.textContent || "").trim();
    if (nome && aberta && nome.replace(/\s+/g, " ").startsWith(aberta.replace(/\s+/g, " "))) return;
    segurar(NAVEGANDO);
    abrir(linha);
    // devolve o foco para onde você está AGORA (numa rajada você já pode ter descido mais)
    setTimeout(() => voltarFoco(ultimoNome || linha), 60);
  };
  document.addEventListener("zap-abrir-foco", abrirFocada);
  // Navegação própria: a do WhatsApp perde a conta depois que uma conversa abre.
  const conversas = () => [...document.querySelectorAll('#pane-side [role="row"]')]
    .filter((r) => r.querySelector('[data-testid="cell-frame-title"]') && r.querySelector('[role="gridcell"][tabindex]'))
    .map((r) => [r, r.getBoundingClientRect().top]).sort((x, y) => x[1] - y[1]).map(([r]) => r);
  const mover = (dir) => {
    const linhas = conversas();
    const atual = document.activeElement?.closest?.('#pane-side [role="row"]') ||
      linhas.find((r) => nomeDe(r) === ultimoNome);
    const i = linhas.indexOf(atual);
    const prox = linhas[i + dir];
    if (!prox) return false; // (↑ na primeira conversa vai para as abas, em outro trecho)
    const g = prox.querySelector('[role="gridcell"][tabindex]');
    if (!g) return false;
    ultimoNome = nomeDe(prox);
    g.focus({ preventScroll: true });
    prox.scrollIntoView({ block: "nearest" });
    // abre quando você para de apertar (segurando a seta, só abre onde parar)
    clearTimeout(timer);
    timer = setTimeout(abrirFocada, 50);
    return true;
  };
  // seta que chegou com o foco "em lugar nenhum" no meio da navegação: continua dali
  document.addEventListener("zap-mover", (e) => mover(e.detail));
  // A lista é redesenhada quando a conversa abre e a linha com foco é trocada: o
  // foco cai para "lugar nenhum". Enquanto navega, devolve para a mesma conversa.
  document.addEventListener("focusin", (e) => {
    const l = e.target.closest && e.target.closest('#pane-side [role="row"]');
    if (l) ultimoNome = nomeDe(l);
  }, true);
  document.addEventListener("focusout", (e) => {
    if (!e.target.closest || !e.target.closest("#pane-side")) return;
    setTimeout(() => {
      const a = document.activeElement;
      const navegando = Number(document.documentElement.dataset.zapSegurar || 0) > Date.now();
      if (navegando && ultimoNome && (!a || a === document.body || a === document.documentElement)) voltarFoco(ultimoNome);
    }, 0);
  }, true);
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
    let a = document.activeElement;
    // Descendo rápido: o WhatsApp pode ter jogado o cursor no campo de mensagem
    // (ele seleciona o campo, e isso escapa do bloqueio). Se a seta cair ali com
    // o campo vazio durante a navegação, volta para a lista e segue.
    const navegando = Number(document.documentElement.dataset.zapSegurar || 0) > Date.now();
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && navegando && ultimoNome && a &&
        a.closest && a.closest("#main") && !(a.isContentEditable && a.textContent.trim())) {
      voltarFoco(ultimoNome);
      a = document.activeElement;
    }
    if (!a || !a.closest("#pane-side")) return;
    if (e.key.length === 1 && e.key !== " " && e.key !== "/" && !e.defaultPrevented && document.querySelector('#main footer [contenteditable="true"]')) {
      segurar(0);
      document.querySelector('#main footer [contenteditable="true"]').focus();
      return; // a tecla cai no campo de mensagem
    }
    if (e.key === "ArrowRight" || e.key === "Enter") {
      segurar(0);
      if (e.key === "ArrowRight") {
        e.preventDefault();
        document.querySelector('#main footer [contenteditable="true"]')?.focus();
      }
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    if (mover(e.key === "ArrowDown" ? 1 : -1)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true); // captura: o WhatsApp para a propagação das setas
})();

// As teclas da tela de entrada funcionam de qualquer lugar (fora de campos de texto):
//   /        busca
//   ↓ / ↑    leva para a lista e abre a primeira conversa (depois segue a navegação normal)
//   Esc      foco na lista
// E quando o WhatsApp termina de carregar, o foco já vai para a lista.
(() => {
  const editando = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  const linhasVisiveis = () => [...document.querySelectorAll('#pane-side [role="row"]')]
    .filter((r) => r.querySelector('[data-testid="cell-frame-title"]') && r.querySelector('[role="gridcell"][tabindex]'))
    .map((r) => [r, r.getBoundingClientRect().top]).sort((x, y) => x[1] - y[1]).map(([r]) => r);
  const focarPrimeira = () => {
    const g = linhasVisiveis()[0]?.querySelector('[role="gridcell"][tabindex]');
    if (g) { g.focus({ preventScroll: true }); return g; }
  };
  // na janela (window), e não no documento: o WhatsApp escuta ali e manda qualquer
  // tecla para o campo de mensagem quando nada tem foco
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const a = document.activeElement;
    if (editando(a) || a?.closest?.("#pane-side") || a?.closest?.('#side [role="tablist"]')) return;
    const visivel = (el) => el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
    if ([...document.querySelectorAll('[role="dialog"], [data-testid="media-viewer"]')].some(visivel)) return;
    if (e.key === "/") {
      const busca = document.querySelector('#side input[role="textbox"]');
      if (busca) { e.preventDefault(); e.stopImmediatePropagation(); busca.focus(); }
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); e.stopImmediatePropagation();
      if (Number(document.documentElement.dataset.zapSegurar || 0) > Date.now()) {
        document.dispatchEvent(new CustomEvent("zap-mover", { detail: e.key === "ArrowDown" ? 1 : -1 }));
        return;
      }
      const g = focarPrimeira();
      // abre a primeira conversa, como se a seta já tivesse "entrado" nela
      if (g) document.dispatchEvent(new CustomEvent("zap-abrir-foco"));
    } else if (e.key === "Escape" && !document.querySelector("#main")) {
      focarPrimeira();
    }
  }, true);

  // Ao terminar de carregar: foco na lista (se ninguém pegou o foco ainda)
  const esperar = setInterval(() => {
    if (!document.querySelector('#pane-side [role="row"]')) return;
    clearInterval(esperar);
    // o WhatsApp ainda mexe no foco nos primeiros segundos: tenta algumas vezes
    for (const t of [400, 1200, 2500]) setTimeout(() => {
      const a = document.activeElement;
      if (!a || a === document.body || a === document.documentElement) focarPrimeira();
    }, t);
  }, 300);
})();

// Navegação pelas mensagens da conversa:
//   ↑ no campo de mensagem vazio  -> entra no modo e marca a última mensagem
//   ↑ / ↓                          -> anda pelas mensagens (subir carrega as antigas)
//   Enter                          -> abre: imagem/vídeo, toca áudio, abre link/documento
//   Esc ou começar a digitar       -> volta para o campo de mensagem
// (Substitui o ↑ nativo do WhatsApp, que editava a última mensagem enviada.)
(() => {
  let ativo = false, atual = null, visualizando = false;
  const campo = () => document.querySelector('#main footer [contenteditable="true"]');
  const vazio = (el) => !el || !el.textContent.trim();
  const mensagens = () => [...document.querySelectorAll("#main [data-id]")]
    .filter((m) => m.querySelector('[data-testid="msg-container"]'))
    .map((m) => [m, m.getBoundingClientRect().top]).sort((a, b) => a[1] - b[1]).map(([m]) => m);
  const marcar = (m) => {
    document.querySelectorAll(".zap-msg-sel").forEach((x) => x.classList.remove("zap-msg-sel"));
    atual = m;
    if (m) { m.classList.add("zap-msg-sel"); m.scrollIntoView({ block: "nearest" }); }
  };
  const sair = () => {
    ativo = false; marcar(null);
    document.documentElement.dataset.zapSegurar = "0";
    campo()?.focus();
  };
  const clicar = (el) => {
    const r = el.getBoundingClientRect();
    const o = { bubbles: true, cancelable: true, composed: true, view: window,
      clientX: r.left + r.width / 2, clientY: r.top + r.height / 2,
      button: 0, buttons: 1, pointerId: 1, pointerType: "mouse", isPrimary: true };
    el.dispatchEvent(new PointerEvent("pointerdown", o));
    el.dispatchEvent(new MouseEvent("mousedown", o));
    el.dispatchEvent(new PointerEvent("pointerup", { ...o, buttons: 0 }));
    el.dispatchEvent(new MouseEvent("mouseup", { ...o, buttons: 0 }));
    el.dispatchEvent(new MouseEvent("click", { ...o, buttons: 0 }));
  };
  const abrirMensagem = (m) => {
    const c = m.querySelector('[data-testid="msg-container"]') || m;
    // 1) áudio
    const play = c.querySelector('[data-icon*="audio-play"], [data-icon*="ptt-play"], button[aria-label*="eproduzir"], button[aria-label*="Play"]');
    if (play) { clicar(play.closest("button, [role='button']") || play); return true; }
    // 2) imagem / vídeo (a maior imagem que não seja emoji nem foto de perfil)
    const midias = [...c.querySelectorAll("img, video")]
      .filter((i) => !i.classList.contains("emoji") && i.getBoundingClientRect().width > 60);
    if (midias.length) {
      const maior = midias.sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
      clicar(maior.closest("[role='button']") || maior);
      visualizando = true; // o próximo Esc só fecha a imagem
      return true;
    }
    // 3) documento
    const doc = c.querySelector('[data-icon*="document"], [data-icon*="audio-download"], [data-icon*="download"]');
    if (doc) { clicar(doc.closest("button, [role='button'], div[title]") || doc); return true; }
    // 4) link
    const link = c.querySelector('a[href^="http"]');
    if (link) { window.open(link.href, "_blank", "noopener"); return true; }
    return false;
  };
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const a = document.activeElement;
    if (!ativo) {
      // entra no modo: ↑ com o cursor no campo de mensagem vazio
      if (e.key === "ArrowUp" && a && a === campo() && vazio(a)) {
        const lista = mensagens();
        if (!lista.length) return;
        e.preventDefault(); e.stopImmediatePropagation();
        ativo = true;
        marcar(lista[lista.length - 1]);
      }
      return;
    }
    // modo ativo: com uma imagem aberta, o Esc só fecha a imagem (e continua no modo)
    if (visualizando) {
      if (e.key === "Escape") { visualizando = false; setTimeout(() => atual && marcar(atual), 300); }
      return; // as outras teclas ficam com o visualizador (← → trocam de foto)
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault(); e.stopImmediatePropagation();
      const lista = mensagens();
      let i = lista.indexOf(atual);
      if (i < 0) i = lista.length;
      const prox = lista[Math.max(0, Math.min(lista.length - 1, i + (e.key === "ArrowUp" ? -1 : 1)))];
      if (e.key === "ArrowDown" && i >= lista.length - 1) { sair(); return; } // passou da última: volta a escrever
      marcar(prox);
    } else if (e.key === "Enter") {
      e.preventDefault(); e.stopImmediatePropagation();
      if (atual) abrirMensagem(atual);
    } else if (e.key === "Escape") {
      e.preventDefault(); e.stopImmediatePropagation();
      sair();
    } else if (e.key.length === 1) {
      sair(); // começou a digitar: a tecla cai no campo
    }
  }, true);
  // trocar de conversa ou clicar em qualquer lugar sai do modo
  document.addEventListener("pointerdown", (e) => { if (ativo && e.isTrusted) { ativo = false; marcar(null); } }, true);
  new MutationObserver(() => { if (ativo && atual && !atual.isConnected) { ativo = false; atual = null; } })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
