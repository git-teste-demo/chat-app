```javascript
/* =========================================================
   CHATLY — APP
   Interface, autenticação e interações iniciais
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

    chatCount: document.getElementById("chat-count"),

    userName: document.getElementById("user-name"),
    userUsername: document.getElementById("user-username"),
    userAvatar: document.getElementById("user-avatar"),

    logoutButton: document.getElementById("logout-button")
  };

  /* =======================================================
     FIREBASE
  ======================================================= */

  const firebaseServices = window.chatlyFirebase;

  if (!firebaseServices) {
    console.error(
      "Chatly: Firebase não foi inicializado. Verifique js/firebase.js."
    );

    return;
  }

  const auth = firebaseServices.auth;
  const db = firebaseServices.db;

  /* =======================================================
     ESTADO
  ======================================================= */

  const state = {
    activeView: "chats",
    activeConversation: null,
    selectedImage: null,
    currentUser: null
  };

  /* =======================================================
     MOBILE SIDEBAR
  ======================================================= */

  function openSidebar() {
    elements.sidebar?.classList.add("open");
    elements.sidebarOverlay?.classList.add("visible");

    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    elements.sidebar?.classList.remove("open");
    elements.sidebarOverlay?.classList.remove("visible");

    document.body.style.overflow = "";
  }

  elements.sidebarToggle?.addEventListener(
    "click",
    openSidebar
  );

  elements.sidebarClose?.addEventListener(
    "click",
    closeSidebar
  );

  elements.sidebarOverlay?.addEventListener(
    "click",
    closeSidebar
  );

  /* =======================================================
     NAVEGAÇÃO
  ======================================================= */

  function changeView(view) {
    state.activeView = view;

    elements.navigationItems.forEach(button => {
      const isActive = button.dataset.view === view;

      button.classList.toggle("active", isActive);

      if (isActive) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    closeSidebar();

    console.log("Chatly: visual selecionado:", view);
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
    if (!elements.conversationSearch || !elements.conversationList) {
      return;
    }

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
     ATALHO DE BUSCA
  ======================================================= */

  document.addEventListener("keydown", event => {
    const isSearchShortcut =
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "k";

    if (!isSearchShortcut) return;

    event.preventDefault();

    elements.conversationSearch?.focus();
  });

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
     ENTER PARA ENVIAR
  ======================================================= */

  elements.messageInput?.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        /*
          O envio será conectado ao Firestore
          quando o sistema de mensagens for implementado.
        */
      }
    }
  );

  /* =======================================================
     SELEÇÃO DE IMAGEM
  ======================================================= */

  elements.attachImageButton?.addEventListener(
    "click",
    () => {
      if (elements.imageInput) {
        elements.imageInput.click();
      }
    }
  );

  elements.imageInput?.addEventListener(
    "change",
    event => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Selecione um arquivo de imagem válido.");

        elements.imageInput.value = "";

        return;
      }

      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        alert("A imagem deve ter no máximo 10 MB.");

        elements.imageInput.value = "";

        return;
      }

      state.selectedImage = file;

      showImagePreview(file);
    }
  );

  /* =======================================================
     PRÉ-VISUALIZAÇÃO DE IMAGEM
  ======================================================= */

  function showImagePreview(file) {
    clearImagePreview();

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

    removeButton.addEventListener(
      "click",
      clearSelectedImage
    );

    preview.appendChild(image);
    preview.appendChild(removeButton);

    elements.messageInput?.parentElement?.before(preview);
  }

  /* =======================================================
     LIMPAR PRÉ-VISUALIZAÇÃO
  ======================================================= */

  function clearImagePreview() {
    const preview = document.getElementById(
      "image-preview"
    );

    if (!preview) return;

    const image = preview.querySelector("img");

    if (image?.src.startsWith("blob:")) {
      URL.revokeObjectURL(image.src);
    }

    preview.remove();
  }

  /* =======================================================
     REMOVER IMAGEM
  ======================================================= */

  function clearSelectedImage() {
    clearImagePreview();

    state.selectedImage = null;

    if (elements.imageInput) {
      elements.imageInput.value = "";
    }
  }

  /* =======================================================
     NOVA CONVERSA
  ======================================================= */

  elements.newConversationButton?.addEventListener(
    "click",
    () => {
      changeView("friends");
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
     CARREGAR PERFIL DO FIRESTORE
  ======================================================= */

  async function loadUserProfile(user) {
    if (!user) return;

    try {
      const userDocument = await db
        .collection("users")
        .doc(user.uid)
        .get();

      const profile = userDocument.exists
        ? userDocument.data()
        : {};

      const displayName =
        profile.displayName ||
        user.displayName ||
        "Usuário";

      const username =
        profile.username ||
        "username";

      const photoURL =
        profile.photoURL ||
        user.photoURL ||
        "https://placehold.co/100x100/24232a/ffffff?text=U";

      if (elements.userName) {
        elements.userName.textContent = displayName;
      }

      if (elements.userUsername) {
        elements.userUsername.textContent =
          "@" + username;
      }

      if (elements.userAvatar) {
        elements.userAvatar.src = photoURL;
      }

    } catch (error) {
      console.error(
        "Chatly: não foi possível carregar o perfil.",
        error
      );
    }
  }

  /* =======================================================
     SAIR DA CONTA
  ======================================================= */

  elements.logoutButton?.addEventListener(
    "click",
    async () => {
      const confirmed = confirm(
        "Tem certeza de que deseja sair da sua conta?"
      );

      if (!confirmed) return;

      try {
        await auth.signOut();

        window.location.href = "auth.html";

      } catch (error) {
        console.error(
          "Chatly: erro ao sair da conta.",
          error
        );

        alert(
          "Não foi possível sair da conta. Tente novamente."
        );
      }
    }
  );

  /* =======================================================
     AUTENTICAÇÃO
  ======================================================= */

  auth.onAuthStateChanged(
    async user => {
      if (!user) {
        window.location.replace("auth.html");

        return;
      }

      state.currentUser = user;

      await loadUserProfile(user);

      console.log(
        "Chatly: usuário autenticado.",
        user.uid
      );
    },
    error => {
      console.error(
        "Chatly: erro ao verificar autenticação.",
        error
      );
    }
  );

  /* =======================================================
     INICIALIZAÇÃO
  ======================================================= */

  function initializeApp() {
    console.log("Chatly: interface inicializada.");
  }

  initializeApp();

})();
```
