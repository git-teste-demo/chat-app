
/* =========================================================
   CHATLY — AUTHENTICATION FRONT-END
   Interface de login e cadastro
========================================================= */

(() => {
  "use strict";

  const authPage = document.querySelector(".auth-page");
  const authForm = document.getElementById("auth-form");

  const authTitle = document.getElementById("auth-title");
  const authDescription = document.getElementById("auth-description");

  const authSubmit = document.getElementById("auth-submit");
  const authSubmitText = document.getElementById("auth-submit-text");

  const authSwitchText = document.getElementById("auth-switch-text");
  const authSwitchButton = document.getElementById("auth-switch-button");

  const passwordInput = document.getElementById("auth-password");
  const confirmPasswordInput = document.getElementById(
    "auth-confirm-password"
  );

  const passwordToggle = document.getElementById("password-toggle");
  const feedback = document.getElementById("auth-feedback");

  const googleButton = document.getElementById("google-login");
  const forgotPasswordButton = document.getElementById(
    "forgot-password"
  );

  let signupMode = false;

  /* =========================================================
     FEEDBACK
  ========================================================= */

  function showFeedback(message, type = "error") {
    feedback.textContent = message;

    feedback.classList.toggle(
      "success",
      type === "success"
    );
  }

  function clearFeedback() {
    feedback.textContent = "";
    feedback.classList.remove("success");
  }

  /* =========================================================
     LOGIN / SIGNUP MODE
  ========================================================= */

  function setAuthMode(isSignup) {
    signupMode = isSignup;

    authPage.classList.toggle(
      "signup-mode",
      signupMode
    );

    document.querySelectorAll(".signup-only").forEach((element) => {
      element.hidden = !signupMode;
    });

    authTitle.textContent = signupMode
      ? "Create your account"
      : "Welcome back";

    authDescription.textContent = signupMode
      ? "Crie sua conta e comece a conversar."
      : "Entre na sua conta para continuar suas conversas.";

    authSubmitText.textContent = signupMode
      ? "Criar minha conta"
      : "Entrar na conta";

    authSwitchText.textContent = signupMode
      ? "Já possui uma conta?"
      : "Ainda não tem uma conta?";

    authSwitchButton.textContent = signupMode
      ? "Entrar"
      : "Criar conta";

    passwordInput.autocomplete = signupMode
      ? "new-password"
      : "current-password";

    confirmPasswordInput.required = signupMode;

    clearFeedback();
  }

  authSwitchButton.addEventListener("click", () => {
    setAuthMode(!signupMode);
  });

  /* =========================================================
     PASSWORD VISIBILITY
  ========================================================= */

  passwordToggle.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword
      ? "text"
      : "password";

    passwordToggle.innerHTML = isPassword
      ? '<i class="fa-regular fa-eye-slash"></i>'
      : '<i class="fa-regular fa-eye"></i>';

    passwordToggle.setAttribute(
      "aria-label",
      isPassword ? "Ocultar senha" : "Mostrar senha"
    );
  });

  /* =========================================================
     FORM VALIDATION
  ========================================================= */

  authForm.addEventListener("submit", (event) => {
    event.preventDefault();

    clearFeedback();

    const email = document
      .getElementById("auth-email")
      .value
      .trim();

    const password = passwordInput.value;

    if (!email || !password) {
      showFeedback("Preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      showFeedback("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (signupMode) {
      const confirmPassword = confirmPasswordInput.value;

      if (password !== confirmPassword) {
        showFeedback("As senhas não são iguais.");
        confirmPasswordInput.focus();
        return;
      }

      showFeedback(
        "Interface pronta. A criação da conta será conectada ao Firebase na próxima etapa.",
        "success"
      );

      return;
    }

    showFeedback(
      "Interface pronta. O login será conectado ao Firebase na próxima etapa.",
      "success"
    );
  });

  /* =========================================================
     GOOGLE LOGIN
  ========================================================= */

  googleButton.addEventListener("click", () => {
    showFeedback(
      "O login com Google será conectado ao Firebase na próxima etapa."
    );
  });

  /* =========================================================
     PASSWORD RESET
  ========================================================= */

  forgotPasswordButton.addEventListener("click", () => {
    const email = document
      .getElementById("auth-email")
      .value
      .trim();

    if (!email) {
      showFeedback(
        "Digite seu e-mail para solicitar a recuperação da senha."
      );

      document.getElementById("auth-email").focus();
      return;
    }

    showFeedback(
      "A recuperação de senha será conectada ao Firebase na próxima etapa."
    );
  });

})();
