export const metadata = {
  title: "Política de Privacidade — C2Tech Automações"
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Política de Privacidade</h1>
            <p className="text-sm text-slate-500">C2Tech Automações — Última atualização: janeiro de 2025</p>
          </div>

          <Section title="1. Quem somos">
            <p>
              C2Tech é uma empresa de tecnologia especializada em automações de processos. Este painel é uma
              ferramenta interna de gestão e não é destinado ao público geral.
            </p>
          </Section>

          <Section title="2. Dados coletados">
            <p>Coletamos e processamos os seguintes dados para operação do sistema:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Email e nome do usuário interno (para autenticação e auditoria)</li>
              <li>Registros de acesso: IP, data/hora, ação executada</li>
              <li>Conteúdo de emails comerciais armazenados no NocoDB (dados das empresas clientes)</li>
              <li>Cookies de sessão (HttpOnly, não acessíveis por JavaScript)</li>
            </ul>
          </Section>

          <Section title="3. Finalidade do tratamento">
            <p>Os dados são usados exclusivamente para:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Autenticação e controle de acesso dos usuários internos</li>
              <li>Gestão e automação de processos das empresas clientes</li>
              <li>Auditoria de segurança e rastreabilidade de ações</li>
            </ul>
          </Section>

          <Section title="4. Retenção de dados">
            <p>
              Os dados de sessão são retidos por até 12 horas. Logs de auditoria são mantidos por até 90 dias.
              Dados de conteúdo são mantidos enquanto necessário para as operações da empresa, conforme acordado
              com cada cliente.
            </p>
          </Section>

          <Section title="5. Compartilhamento">
            <p>
              Não compartilhamos dados pessoais com terceiros, exceto quando exigido por obrigação legal ou
              mediante consentimento explícito. Os dados das empresas clientes (inka, californiatv) permanecem
              restritos aos usuários autorizados de cada empresa.
            </p>
          </Section>

          <Section title="6. Segurança">
            <p>
              Adotamos medidas técnicas e organizacionais para proteger os dados, incluindo: criptografia de
              senhas (bcrypt), sessões com cookie HttpOnly, controle de acesso por perfil (RBAC), headers de
              segurança HTTP e logs de auditoria. Não garantimos segurança absoluta, mas empregamos as melhores
              práticas disponíveis.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>
              Utilizamos um cookie de sessão chamado{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs font-mono">
                automacoes_c2tech_session
              </code>
              . Ele é HttpOnly (não acessível via JavaScript), tem validade de 12 horas e é estritamente
              necessário para o funcionamento do sistema. Não utilizamos cookies de rastreamento ou publicidade.
            </p>
          </Section>

          <Section title="8. Direitos do usuário">
            <p>
              Usuários internos podem solicitar a exclusão ou atualização de seus dados entrando em contato com
              o administrador do sistema ou pelo email{" "}
              <a href="mailto:privacidade@c2tech.com.br" className="text-blue-600 hover:underline">
                privacidade@c2tech.com.br
              </a>
              .
            </p>
          </Section>

          <Section title="9. Contato">
            <p>
              Para dúvidas sobre esta política, entre em contato:{" "}
              <a href="mailto:privacidade@c2tech.com.br" className="text-blue-600 hover:underline">
                privacidade@c2tech.com.br
              </a>
            </p>
          </Section>

          <div className="border-t border-slate-200 pt-4">
            <a href="/login" className="text-sm text-slate-500 hover:underline">
              ← Voltar ao login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}
