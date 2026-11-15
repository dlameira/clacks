// Copiado da extensão "WhatsApp Slim" do Omarchy (https://github.com/omacom/omarchy),
// default/chromium/extensions/whatsapp-slim/system-theme.js.
// Copyright (c) David Heinemeier Hansson. Licença MIT; texto completo em NOTICE.
// Faz o WhatsApp Web seguir o tema claro/escuro do sistema.
if (localStorage.getItem("system-theme-mode") !== "true") {
  localStorage.setItem("system-theme-mode", "true");
  location.reload();
}
