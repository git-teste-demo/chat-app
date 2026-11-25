/* =========================================================
   CHATLY — FIREBASE INITIALIZATION
   Inicialização dos serviços Firebase
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     VERIFICAR SDK
  ======================================================= */

  if (typeof firebase === "undefined") {
    console.error(
      "Chatly: SDK do Firebase não foi carregado."
    );

    return;
  }

  /* =======================================================
     CONFIGURAÇÃO FIREBASE
  ======================================================= */

  const firebaseConfig = {
    apiKey: "AIzaSyBuwIpz2zpNiP_I0L07i87XzPpxEtSO9S4",
    authDomain: "chatly-b69c3.firebaseapp.com",
    projectId: "chatly-b69c3",
    storageBucket: "chatly-b69c3.firebasestorage.app",
    messagingSenderId: "743623301393",
    appId: "1:743623301393:web:3e0d17a0e600e870f914b0",
    measurementId: "G-5D5GH6FTVW"
  };

  /* =======================================================
     INICIALIZAR FIREBASE
  ======================================================= */

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    const app = firebase.app();

    /* =====================================================
       SERVIÇOS FIREBASE
    ===================================================== */

    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();

    /* =====================================================
       DISPONIBILIZAR SERVIÇOS PARA O CHATLY
    ===================================================== */

    window.chatlyFirebase = {
      app,
      auth,
      db,
      storage
    };

    console.log(
      "Chatly: Firebase inicializado com sucesso."
    );

  } catch (error) {
    console.error(
      "Chatly: erro ao inicializar o Firebase.",
      error
    );
  }

})();
