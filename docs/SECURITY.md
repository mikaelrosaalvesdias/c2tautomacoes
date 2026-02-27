# Security Checklist

## Segredos

- Nunca commitar segredos (tokens, senhas, cookies, chaves privadas).
- `.env` é local e não deve ir para o Git.
- Use `.env.example` apenas com placeholders.

## Vazamento e resposta

- Se segredo vazar, rotacionar imediatamente (token/senha/chave).
- Revisar histórico Git e remover segredo da árvore quando necessário.

## Logs e observabilidade

- Não imprimir token, senha, cookie, bearer em logs.
- Mensagens de erro devem omitir valores sensíveis.

## Deploy

- Manter autenticação e chamadas sensíveis apenas server-side.
- Validar variáveis obrigatórias em runtime sem exibir valores.

## Revisão de PR

- Verificar paths alterados por responsabilidade de branch.
- Bloquear PR com segredo hardcoded.
- Confirmar `build` e `deploy` após merge.
