export const metadata = {
  title: "Termos de Uso — C2Tech Automações"
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Termos de Uso</h1>
            <p className="text-sm text-slate-500">C2Tech Automações — Última atualização: janeiro de 2025</p>
          </div>

          <Section title="1. Aceitação dos termos">
            <p>
              O acesso e uso do painel C2Tech Automações implica a aceitação integral destes Termos de Uso.
              Este sistema é de uso exclusivo interno da C2Tech e de suas empresas clientes autorizadas.
            </p>
          </Section>

          <Section title="2. Uso autorizado">
            <p>
              O sistema deve ser utilizado somente para fins legítimos de automação, gestão e monitoramento de
              processos relacionados às empresas clientes cadastradas. É vedado o uso para fins ilícitos,
              coleta não autorizada de dados ou qualquer atividade contrária à lei.
            </p>
          </Section>

          <Section title="3. Credenciais e responsabilidade">
            <p>
              Cada usuário é responsável pela confidencialidade de suas credenciais de acesso. O compartilhamento
              de senha é expressamente proibido. Qualquer ação realizada com suas credenciais é de sua
              responsabilidade.
            </p>
          </Section>

          <Section title="4. Dados e confidencialidade">
            <p>
              Os dados acessados através deste painel são confidenciais e propriedade das respectivas empresas
              clientes. É proibida a divulgação, cópia ou uso de tais dados fora do contexto autorizado pela C2Tech.
            </p>
          </Section>

          <Section title="5. Disponibilidade">
            <p>
              A C2Tech não garante disponibilidade ininterrupta do sistema. Manutenções programadas e
              imprevistos técnicos podem causar indisponibilidades temporárias. Não nos responsabilizamos por
              danos decorrentes de interrupções do serviço.
            </p>
          </Section>

          <Section title="6. Modificações">
            <p>
              Estes termos podem ser atualizados a qualquer momento. O uso continuado do sistema após as
              alterações implica aceitação dos novos termos.
            </p>
          </Section>

          <Section title="7. Rescisão">
            <p>
              A C2Tech reserva-se o direito de suspender ou encerrar o acesso de qualquer usuário que viole
              estes termos, sem aviso prévio.
            </p>
          </Section>

          <Section title="8. Legislação aplicável">
            <p>
              Estes termos são regidos pelas leis brasileiras, em especial a Lei Geral de Proteção de Dados
              (LGPD — Lei 13.709/2018) e o Marco Civil da Internet (Lei 12.965/2014).
            </p>
          </Section>

          <Section title="9. Contato">
            <p>
              Para dúvidas ou suporte:{" "}
              <a href="mailto:contato@c2tech.com.br" className="text-blue-600 hover:underline">
                contato@c2tech.com.br
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
