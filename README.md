# Chatly

Chat privado baseado em HTML, CSS, JavaScript e Firebase compat.

## Para executar

1. Abra `js/firebase.js` e confirme a configuração do seu projeto Firebase.
2. Configure Authentication, Firestore e Storage seguindo `FIREBASE_RULES.md`.
3. Publique os arquivos em GitHub Pages, Vercel ou servidor com HTTPS.
4. Abra `auth.html` para criar conta/entrar; após autenticar, o app abre `index.html`.

## Recursos incluídos

- Cadastro/login por e-mail e Google, recuperação de senha e username exclusivo.
- Perfil básico e edição de nome/username.
- Pesquisa de usuários, solicitação e aceite/recusa de amizade.
- Conversas diretas, mensagens em tempo real e histórico.
- Envio de imagens com limite de 10 MB.
- Busca de mensagens na conversa, detalhes do contato e logout.

## Observação

O ZIP contém a integração de cliente. A disponibilidade real depende de habilitar os provedores, criar o banco e publicar as regras de segurança no Firebase. Teste em dois usuários diferentes para validar o fluxo completo.
