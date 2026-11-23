import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUSINESS_RULES } from "@/lib/constants";
import { useAuth } from "@/lib/AuthContext";

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-[12px] text-muted-foreground">{label}</Label>
    {children}
  </div>
);

export default function SettingsView() {
  const { user, refresh } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setName(user?.full_name ?? ""), [user?.full_name]);

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome do administrador.");
      return;
    }
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: name.trim() });
      await refresh();
      toast.success("Perfil atualizado.");
    } catch {
      toast.error("Não foi possível salvar o perfil agora.");
    } finally {
      setSaving(false);
    }
  };

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="space-y-5">
      <header>
        <h2 className="font-heading text-[24px] font-extrabold tracking-tight">Configurações</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Conta do administrador e regras fixas da operação.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading text-[13.5px] font-bold">Perfil do administrador</h3>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Único usuário com acesso ao AffiliateFlow.
          </p>
          <form onSubmit={saveProfile} className="mt-4 space-y-3">
            <Field label="Nome">
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" />
            </Field>
            <Field label="E-mail de acesso">
              <Input value={user?.email ?? ""} readOnly className="bg-muted/50 text-muted-foreground" />
            </Field>
            <Button type="submit" disabled={saving} size="sm">
              {saving ? "Salvando…" : "Salvar alterações"}
            </Button>
          </form>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading text-[13.5px] font-bold">Aparência</h3>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            O tema é aplicado neste navegador.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`rounded-lg border px-3 py-2.5 text-[12.5px] font-medium transition-colors ${
                !isDark ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Claro
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`rounded-lg border px-3 py-2.5 text-[12.5px] font-medium transition-colors ${
                isDark ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Escuro
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Sessão
            </p>
            <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">
              O acesso é restrito a convidados. Não existe cadastro público.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="font-heading text-[13.5px] font-bold">Regras fixas da operação</h3>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            Decisões de negócio do MVP, aplicadas em todo o sistema.
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Idioma", BUSINESS_RULES.language],
              ["Moeda", BUSINESS_RULES.currency],
              ["Fuso horário", BUSINESS_RULES.timezone],
              ["Frequência diária", BUSINESS_RULES.dailyFrequency],
              ["Aprovação", BUSINESS_RULES.approval],
              ["Contas sociais", "Uma conta por plataforma"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-background px-3 py-2.5">
                <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-1 text-[12.5px]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}