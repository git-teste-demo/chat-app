
/* =========================================================
   CHATLY — FIREBASE INITIALIZATION
   Inicialização dos serviços Firebase
========================================================= */

(() => {
  "use strict";

  const firebaseConfig = {
    apiKey: "AIzaSyBuwIpz2zpNiP_I0L07i87XzPpxEtSO9S4",
    authDomain: "chatly-b69c3.firebaseapp.com",
    projectId: "chatly-b69c3",
    storageBucket: "chatly-b69c3.firebasestorage.app",
    messagingSenderId: "743623301393",
    appId: "1:743623301393:web:3e0d17a0e600e870f914b0",
    measurementId: "G-5D5GH6FTVW"
  };

  /* =========================================================
     INITIALIZE FIREBASE
  ========================================================= */

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  /* =========================================================
     FIREBASE SERVICES
  ========================================================= */

  window.chatlyFirebase = {
    app: firebase.app(),
    auth: firebase.auth(),
    db: firebase.firestore(),
    storage: firebase.storage()
  };

  console.log("Chatly: Firebase inicializado.");

})();
