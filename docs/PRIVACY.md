# Política de Privacidade — C2Tech Automações

**Última atualização:** Janeiro de 2025

---

## 1. Quem somos

C2Tech é uma empresa de tecnologia especializada em automações de processos. Este painel é uma ferramenta interna de gestão operacional, não destinada ao público geral.

---

## 2. Dados coletados

Coletamos e processamos os seguintes dados para operação do sistema:

- **Email e nome** dos usuários internos (para autenticação e auditoria)
- **Registros de acesso**: IP, data/hora, ação executada (logs de auditoria)
- **Conteúdo de emails comerciais** armazenados no NocoDB (dados das empresas clientes)
- **Cookies de sessão** (HttpOnly, não acessíveis por JavaScript de terceiros)

---

## 3. Finalidade do tratamento

Os dados são usados exclusivamente para:

- Autenticação e controle de acesso dos usuários internos
- Gestão e automação de processos das empresas clientes
- Auditoria de segurança e rastreabilidade de ações no sistema

---

## 4. Retenção de dados

- **Sessões**: dados de sessão expiram em 12 horas
- **Logs de auditoria**: mantidos por até 90 dias
- **Dados operacionais**: mantidos enquanto necessário para as operações, conforme acordado com cada empresa cliente

---

## 5. Compartilhamento

Não compartilhamos dados pessoais com terceiros, exceto quando:
- Exigido por obrigação legal
- Mediante consentimento explícito do titular

Os dados das empresas clientes (inka, californiatv) permanecem restritos aos usuários autorizados de cada empresa, conforme controle de acesso (RBAC).

---

## 6. Segurança

Adotamos medidas técnicas para proteger os dados:

- Senhas armazenadas com hash bcrypt (irreversível)
- Sessões com cookie HttpOnly + assinatura HMAC
- Controle de acesso por perfil (RBAC) com escopo por empresa
- Headers de segurança HTTP (X-Frame-Options, CSP, etc.)
- Logs de auditoria para rastreabilidade
- Validação de todas as entradas de usuário

Não garantimos segurança absoluta, mas empregamos as melhores práticas disponíveis.

---

## 7. Cookies

Utilizamos um único cookie de sessão chamado `automacoes_c2tech_session`:

- **Tipo**: HttpOnly (não acessível via JavaScript)
- **Validade**: 12 horas (expira automaticamente)
- **Finalidade**: estritamente necessário para autenticação
- **SameSite**: Lax (proteção contra CSRF)

Não utilizamos cookies de rastreamento, publicidade ou análise de comportamento.

---

## 8. Direitos do usuário (LGPD)

Conforme a Lei 13.709/2018 (LGPD), o titular tem direito a:

- Confirmação da existência de tratamento
- Acesso aos dados
- Correção de dados incompletos ou incorretos
- Exclusão dos dados

Para exercer esses direitos, solicite ao administrador do sistema ou escreva para:
**privacidade@c2tech.com.br**

---

## 9. Contato

Para dúvidas sobre esta política:
- **Email**: privacidade@c2tech.com.br
- **Empresa**: C2Tech Tecnologia
