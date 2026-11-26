/* =========================================================
   CHATLY — AUTH
   Cadastro, login, Google e recuperação de senha
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     ELEMENTOS
  ======================================================= */

  const elements = {
    form: document.getElementById("auth-form"),

    email: document.getElementById("auth-email"),
    password: document.getElementById("auth-password"),
    confirmPassword: document.getElementById("auth-confirm-password"),
    username: document.getElementById("auth-username"),

    submitButton: document.getElementById("auth-submit"),
    submitText: document.getElementById("auth-submit-text"),

    googleButton: document.getElementById("google-login"),
    forgotPassword: document.getElementById("forgot-password"),

    feedback: document.getElementById("auth-feedback"),

    switchButton: document.getElementById("auth-switch-button"),

    passwordToggle: document.getElementById("password-toggle"),

    title: document.getElementById("auth-title"),
    description: document.getElementById("auth-description")
  };

  /* =======================================================
     FIREBASE
  ======================================================= */

  const firebaseServices = window.chatlyFirebase;

  if (!firebaseServices) {
    showFeedback(
      "Não foi possível conectar ao Firebase. Recarregue a página.",
      "error"
    );

    console.error(
      "Chatly: Firebase não foi inicializado."
    );

    return;
  }

  const auth = firebaseServices.auth;
  const db = firebaseServices.db;
  const timestampForProfile = () => firebase.firestore.FieldValue.serverTimestamp();

  /* =======================================================
     ESTADO
  ======================================================= */

  let isSignupMode = false;
  let isProcessing = false;

  /* =======================================================
     FEEDBACK
  ======================================================= */

  function showFeedback(message, type = "info") {
    if (!elements.feedback) {
      alert(message);
      return;
    }

    elements.feedback.textContent = message;

    elements.feedback.classList.remove(
      "success",
      "error",
      "info"
    );

    elements.feedback.classList.add(type);

    elements.feedback.hidden = false;
  }

  function clearFeedback() {
    if (!elements.feedback) return;

    elements.feedback.textContent = "";

    elements.feedback.classList.remove(
      "success",
      "error",
      "info"
    );

    elements.feedback.hidden = true;
  }

  /* =======================================================
     MENSAGENS DE ERRO FIREBASE
  ======================================================= */

  function getFirebaseErrorMessage(error) {
    const errorCode = error?.code || "";

    const messages = {
      "auth/email-already-in-use":
        "Este e-mail já está cadastrado.",

      "auth/invalid-email":
        "Digite um endereço de e-mail válido.",

      "auth/weak-password":
        "A senha precisa ter pelo menos 6 caracteres.",

      "auth/user-not-found":
        "Não encontramos uma conta com este e-mail.",

      "auth/wrong-password":
        "A senha está incorreta.",

      "auth/invalid-credential":
        "E-mail ou senha incorretos.",

      "auth/user-disabled":
        "Esta conta foi desativada.",

      "auth/too-many-requests":
        "Muitas tentativas. Aguarde um pouco e tente novamente.",

      "auth/network-request-failed":
        "Falha de conexão. Verifique sua internet.",

      "auth/popup-closed-by-user":
        "A janela de login do Google foi fechada.",

      "auth/popup-blocked":
        "O navegador bloqueou a janela do Google. Permita pop-ups.",

      "auth/cancelled-popup-request":
        "Uma solicitação de login foi cancelada.",

      "auth/account-exists-with-different-credential":
        "Este e-mail já está associado a outro método de login.",

      "auth/operation-not-allowed":
        "Este método de login ainda não está ativado no Firebase.",

      "auth/requires-recent-login":
        "Entre novamente na sua conta para continuar."
    };

    return messages[errorCode] ||
      "Não foi possível concluir a operação. Tente novamente.";
  }

  /* =======================================================
     ESTADO DO BOTÃO
  ======================================================= */

  function setProcessing(processing) {
    isProcessing = processing;

    if (elements.submitButton) {
      elements.submitButton.disabled = processing;
    }

    if (elements.googleButton) {
      elements.googleButton.disabled = processing;
    }

    if (elements.submitText) {
      elements.submitText.textContent = processing
        ? "Aguarde..."
        : isSignupMode
          ? "Criar conta"
          : "Entrar";
    }
  }

  /* =======================================================
     ALTERNAR LOGIN E CADASTRO
  ======================================================= */

  function updateAuthMode() {
    document.body.classList.toggle(
      "signup-mode",
      isSignupMode
    );

    document.querySelectorAll(".signup-only").forEach(
      element => {
        element.hidden = !isSignupMode;
      }
    );

    document.querySelectorAll(".login-only").forEach(
      element => {
        element.hidden = isSignupMode;
      }
    );

    if (elements.title) {
      elements.title.textContent = isSignupMode
        ? "Criar sua conta"
        : "Bem-vindo de volta";
    }

    if (elements.description) {
      elements.description.textContent = isSignupMode
        ? "Crie sua conta para conversar com seus amigos."
        : "Entre na sua conta para continuar.";
    }

    if (elements.submitText) {
      elements.submitText.textContent = isSignupMode
        ? "Criar conta"
        : "Entrar";
    }

    if (elements.password) {
      elements.password.autocomplete = isSignupMode
        ? "new-password"
        : "current-password";
    }
    if (elements.username) {
      elements.username.disabled = !isSignupMode;
      elements.username.required = isSignupMode;
    }

    clearFeedback();
  }

  elements.switchButton?.addEventListener(
    "click",
    event => {
      event.preventDefault();

      if (isProcessing) return;

      isSignupMode = !isSignupMode;

      updateAuthMode();

      elements.password?.focus();
    }
  );

  /* =======================================================
     MOSTRAR / OCULTAR SENHA
  ======================================================= */

  elements.passwordToggle?.addEventListener(
    "click",
    () => {
      if (!elements.password) return;

      const isPassword =
        elements.password.type === "password";

      elements.password.type = isPassword
        ? "text"
        : "password";

      elements.passwordToggle.setAttribute(
        "aria-label",
        isPassword
          ? "Ocultar senha"
          : "Mostrar senha"
      );

      const icon = elements.passwordToggle.querySelector("i");

      if (icon) {
        icon.classList.toggle(
          "fa-eye",
          !isPassword
        );

        icon.classList.toggle(
          "fa-eye-slash",
          isPassword
        );
      }
    }
  );

  /* =======================================================
     CRIAR PERFIL NO FIRESTORE
  ======================================================= */

  async function createUserProfile(user, requestedUsername = "") {
    if (!user) return;

    const userRef = db
      .collection("users")
      .doc(user.uid);

    const userDocument = await userRef.get();

    if (userDocument.exists) {
      return;
    }

    const displayName = user.displayName || user.email?.split("@")[0] || "Usuário";
    let username = String(requestedUsername || displayName).trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]/g, "_").replace(/^_+|_+$/g, "").slice(0, 20);
    if (username.length < 3) username = "user_" + user.uid.slice(0, 8);
    const usernameRef = db.collection("usernameIndex").doc(username);
    await db.runTransaction(async transaction => {
      const index = await transaction.get(usernameRef);
      if (index.exists && index.data().uid !== user.uid) {
        if (requestedUsername) throw new Error("USERNAME_TAKEN");
        username = (username.slice(0, 11) + "_" + user.uid.slice(0, 8)).slice(0, 20);
      }
      transaction.set(db.collection("usernameIndex").doc(username), { uid: user.uid });
      transaction.set(userRef, {
        uid: user.uid, displayName, username,
        photoURL: user.photoURL || null,
        createdAt: timestampForProfile()
      }, { merge: true });
    });
  }

  /* =======================================================
     CADASTRO
  ======================================================= */

  async function signUp(email, password, username) {
    const userCredential = await auth
      .createUserWithEmailAndPassword(
        email,
        password
      );

    const user = userCredential.user;

    try {
      await createUserProfile(user, username);
    } catch (error) {
      // Evita deixar uma conta recém-criada sem perfil/username reservado.
      try { await user.delete(); } catch (_) { }
      throw error;
    }

    showFeedback(
      "Conta criada com sucesso! Redirecionando...",
      "success"
    );

    window.location.href = "index.html";
  }

  /* =======================================================
     LOGIN
  ======================================================= */

  async function signIn(email, password) {
    await auth.signInWithEmailAndPassword(
      email,
      password
    );

    showFeedback(
      "Login realizado com sucesso! Redirecionando...",
      "success"
    );

    window.location.href = "index.html";
  }

  /* =======================================================
     FORMULÁRIO
  ======================================================= */

  elements.form?.addEventListener(
    "submit",
    async event => {
      event.preventDefault();

      if (isProcessing) return;

      clearFeedback();

      const email = elements.email?.value.trim().toLowerCase();
      const username = elements.username?.value.trim().toLowerCase().replace(/^@/, "") || "";
      const password = elements.password?.value;

      const confirmPassword =
        elements.confirmPassword?.value;

      if (!email || !password) {
        showFeedback(
          "Preencha o e-mail e a senha.",
          "error"
        );

        return;
      }

      if (isSignupMode) {
        if (!/^[a-z0-9_]{3,20}$/.test(username)) {
          showFeedback("O username deve ter 3–20 caracteres: letras, números ou _.", "error");
          elements.username?.focus();
          return;
        }
        if (!confirmPassword) {
          showFeedback(
            "Confirme sua senha.",
            "error"
          );

          return;
        }

        if (password !== confirmPassword) {
          showFeedback(
            "As senhas não coincidem.",
            "error"
          );

          return;
        }

        if (password.length < 6) {
          showFeedback(
            "A senha precisa ter pelo menos 6 caracteres.",
            "error"
          );

          return;
        }
      }

      setProcessing(true);

      try {
        if (isSignupMode) {
          await signUp(email, password, username);
        } else {
          await signIn(email, password);
        }

      } catch (error) {
        console.error(
          "Chatly: erro de autenticação.",
          error
        );

        showFeedback(
          error?.message === "USERNAME_TAKEN" ? "Esse username já está em uso. Escolha outro." : getFirebaseErrorMessage(error),
          "error"
        );

      } finally {
        setProcessing(false);
      }
    }
  );

  /* =======================================================
     LOGIN COM GOOGLE
  ======================================================= */

  elements.googleButton?.addEventListener(
    "click",
    async event => {
      event.preventDefault();

      if (isProcessing) return;

      clearFeedback();

      setProcessing(true);

      try {
        const provider = new firebase.auth.GoogleAuthProvider();

        provider.setCustomParameters({
          prompt: "select_account"
        });

        const result = await auth.signInWithPopup(
          provider
        );

        await createUserProfile(result.user);

        showFeedback(
          "Login com Google realizado! Redirecionando...",
          "success"
        );

        window.location.href = "index.html";

      } catch (error) {
        console.error(
          "Chatly: erro no login com Google.",
          error
        );

        showFeedback(
          getFirebaseErrorMessage(error),
          "error"
        );

      } finally {
        setProcessing(false);
      }
    }
  );

  /* =======================================================
     RECUPERAÇÃO DE SENHA
  ======================================================= */

  elements.forgotPassword?.addEventListener(
    "click",
    async event => {
      event.preventDefault();

      clearFeedback();

      const email = elements.email?.value
        .trim()
        .toLowerCase();

      if (!email) {
        showFeedback(
          "Digite seu e-mail no campo acima para receber o link de recuperação.",
          "info"
        );

        elements.email?.focus();

        return;
      }

      try {
        await auth.sendPasswordResetEmail(email);

        showFeedback(
          "Se existir uma conta com esse e-mail, você receberá um link para redefinir sua senha.",
          "success"
        );

      } catch (error) {
        console.error(
          "Chatly: erro ao solicitar recuperação de senha.",
          error
        );

        showFeedback(
          getFirebaseErrorMessage(error),
          "error"
        );
      }
    }
  );

  /* =======================================================
     USUÁRIO JÁ AUTENTICADO
  ======================================================= */

  auth.onAuthStateChanged(user => {
    if (user) {
      window.location.replace("index.html");
    }
  });

  /* =======================================================
     INICIALIZAÇÃO
  ======================================================= */

  updateAuthMode();

  console.log("Chatly: autenticação inicializada.");

})();
