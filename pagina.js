// Roda dentro da página do WhatsApp (mundo "MAIN"). Enquanto a extensão marcar
// <html data-zap-segurar="até quando">, o WhatsApp não consegue jogar o cursor
// para a conversa: é o instante logo depois de abrir uma conversa pelas setas.
(() => {
  const original = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = function (...args) {
    const ate = Number(document.documentElement.dataset.zapSegurar || 0);
    if (Date.now() < ate && this.closest && this.closest("#main")) return;
    return original.apply(this, args);
  };
})();
