
/* =========================================================
   CHATLY — APP
   Interface inicial e interações
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     ELEMENTOS
  ======================================================= */

  const elements = {
    sidebar: document.getElementById("sidebar"),
    sidebarToggle: document.getElementById("sidebar-toggle"),
    sidebarClose: document.getElementById("sidebar-close"),
    sidebarOverlay: document.getElementById("sidebar-overlay"),

    conversationSearch: document.getElementById("conversation-search"),
    conversationList: document.getElementById("conversation-list"),

    navigationItems: document.querySelectorAll(".nav-item"),

    messageInput: document.getElementById("message-input"),
    sendButton: document.getElementById("send-message"),

    attachImageButton: document.getElementById("attach-image"),
    imageInput: document.getElementById("image-input"),

    welcomeScreen: document.getElementById("welcome-screen"),
    welcomeAddFriend: document.getElementById("welcome-add-friend"),

    newConversationButton: document.getElementById("new-conversation"),

    chatCount: document.getElementById("chat-count")
  };

  /* =======================================================
     ESTADO INICIAL
  ======================================================= */

  const state = {
    activeView: "chats",
    activeConversation: null,
    selectedImage: null
  };

  /* =======================================================
     MOBILE SIDEBAR
  ======================================================= */

  function openSidebar() {
    elements.sidebar.classList.add("open");
    elements.sidebarOverlay.classList.add("visible");

    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    elements.sidebar.classList.remove("open");
    elements.sidebarOverlay.classList.remove("visible");

    document.body.style.overflow = "";
  }

  elements.sidebarToggle?.addEventListener("click", openSidebar);

  elements.sidebarClose?.addEventListener("click", closeSidebar);

  elements.sidebarOverlay?.addEventListener("click", closeSidebar);

  /* =======================================================
     NAVEGAÇÃO
  ======================================================= */

  function changeView(view) {
    state.activeView = view;

    elements.navigationItems.forEach(button => {
      const isActive = button.dataset.view === view;

      button.classList.toggle("active", isActive);
    });

    closeSidebar();

    /*
      Futuramente:

      chats    -> lista de conversas
      friends  -> lista de amigos
      requests -> solicitações de amizade

      A renderização dessas páginas será conectada
      aos respectivos módulos.
    */

    console.log("Visual selecionado:", view);
  }

  elements.navigationItems.forEach(button => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;

      if (!view) return;

      changeView(view);
    });
  });

  /* =======================================================
     BUSCA DE CONVERSAS
  ======================================================= */

  function searchConversations() {
    const searchTerm = elements.conversationSearch.value
      .trim()
      .toLowerCase();

    const conversations = elements.conversationList.querySelectorAll(
      ".conversation-item"
    );

    conversations.forEach(conversation => {
      const name = conversation
        .querySelector(".conversation-name")
        ?.textContent
        .toLowerCase() || "";

      const username = conversation.dataset.username
        ?.toLowerCase() || "";

      const matches =
        name.includes(searchTerm) ||
        username.includes(searchTerm);

      conversation.style.display = matches ? "flex" : "none";
    });
  }

  elements.conversationSearch?.addEventListener(
    "input",
    searchConversations
  );

  /* =======================================================
     CAMPO DE MENSAGEM
  ======================================================= */

  function resizeMessageInput() {
    const input = elements.messageInput;

    if (!input) return;

    input.style.height = "auto";

    input.style.height = Math.min(
      input.scrollHeight,
      150
    ) + "px";
  }

  elements.messageInput?.addEventListener(
    "input",
    resizeMessageInput
  );

  /* =======================================================
     ATALHO ENTER
  ======================================================= */

  elements.messageInput?.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      /*
        O envio será ativado quando o sistema
        de mensagens estiver conectado.
      */
    }
  });

  /* =======================================================
     SELEÇÃO DE IMAGEM
  ======================================================= */

  elements.attachImageButton?.addEventListener("click", () => {
    elements.imageInput.click();
  });

  elements.imageInput?.addEventListener("change", event => {
    const file = event.target.files?.[0];

    if (!file) return;

    /*
      Validação inicial do tipo de arquivo.
    */

    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem válido.");

      elements.imageInput.value = "";

      return;
    }

    /*
      Limite visual inicial de 10 MB.
      O limite definitivo também será validado
      no Firebase Storage.
    */

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("A imagem deve ter no máximo 10 MB.");

      elements.imageInput.value = "";

      return;
    }

    state.selectedImage = file;

    showImagePreview(file);
  });

  /* =======================================================
     PRÉ-VISUALIZAÇÃO DE IMAGEM
  ======================================================= */

  function showImagePreview(file) {
    const existingPreview = document.getElementById(
      "image-preview"
    );

    existingPreview?.remove();

    const preview = document.createElement("div");

    preview.id = "image-preview";
    preview.className = "image-preview";

    const image = document.createElement("img");

    image.alt = "Imagem selecionada";

    image.src = URL.createObjectURL(file);

    const removeButton = document.createElement("button");

    removeButton.type = "button";
    removeButton.className = "image-preview-remove";

    removeButton.setAttribute(
      "aria-label",
      "Remover imagem selecionada"
    );

    removeButton.innerHTML = `
      <i class="fa-solid fa-xmark"></i>
    `;

    removeButton.addEventListener("click", () => {
      clearSelectedImage();
    });

    preview.appendChild(image);
    preview.appendChild(removeButton);

    elements.messageInput.parentElement.before(preview);
  }

  /* =======================================================
     REMOVER IMAGEM
  ======================================================= */

  function clearSelectedImage() {
    const preview = document.getElementById("image-preview");

    if (preview) {
      const image = preview.querySelector("img");

      if (image?.src.startsWith("blob:")) {
        URL.revokeObjectURL(image.src);
      }

      preview.remove();
    }

    state.selectedImage = null;

    elements.imageInput.value = "";
  }

  /* =======================================================
     NOVA CONVERSA
  ======================================================= */

  elements.newConversationButton?.addEventListener(
    "click",
    () => {
      changeView("friends");

      /*
        Futuramente, abrirá a busca de amigos
        para iniciar uma nova conversa.
      */
    }
  );

  /* =======================================================
     ADICIONAR AMIGO
  ======================================================= */

  elements.welcomeAddFriend?.addEventListener(
    "click",
    () => {
      changeView("friends");
    }
  );

  /* =======================================================
     INICIALIZAÇÃO
  ======================================================= */

  function initializeApp() {
    console.log("Chatly iniciado.");

    /*
      A autenticação Firebase será conectada
      posteriormente.

      Quando o usuário estiver autenticado,
      o perfil e as conversas serão carregados.
    */
  }

  initializeApp();

})();
