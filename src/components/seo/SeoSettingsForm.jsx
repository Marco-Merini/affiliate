import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveSeoSettings } from "@/lib/seo-fns";

const toForm = (settings) => ({
  site_name: settings?.site_name ?? "AffiliateFlow",
  tagline: settings?.tagline ?? "",
  default_title: settings?.default_title ?? "",
  default_description: settings?.default_description ?? "",
  base_url: settings?.base_url ?? "",
  logo_url: settings?.logo_url ?? "",
  affiliate_disclosure: settings?.affiliate_disclosure ?? "",
  allow_indexing: settings?.allow_indexing !== false,
  robots_extra: settings?.robots_extra ?? "",
  search_console_verification: settings?.search_console_verification ?? "",
  search_console_property: settings?.search_console_property ?? "",
  contact_email: settings?.contact_email ?? "",
});

export default function SeoSettingsForm({ settings }) {
  const [form, setForm] = useState(() => toForm(settings));
  const [saving, setSaving] = useState(false);
  const saveSettings = useServerFn(saveSeoSettings);
  const router = useRouter();

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveSettings({ data: { id: settings?.id, ...form } });
      toast.success("Configurações de SEO salvas");
      await router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Não foi possível salvar as configurações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identidade do site</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="site_name">Nome do site</Label>
            <Input
              id="site_name"
              value={form.site_name}
              onChange={(event) => update("site_name", event.target.value)}
              maxLength={80}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tagline">Frase de posicionamento</Label>
            <Input
              id="tagline"
              value={form.tagline}
              onChange={(event) => update("tagline", event.target.value)}
              maxLength={160}
              placeholder="Recomendações que ajudam você a comprar melhor"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="base_url">URL pública do site</Label>
            <Input
              id="base_url"
              value={form.base_url}
              onChange={(event) => update("base_url", event.target.value)}
              placeholder="https://seusite.com.br"
            />
            <p className="text-xs text-muted-foreground">
              Usada em canonical, sitemap e compartilhamento. Sem barra no final.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="logo_url">URL do logotipo</Label>
            <Input
              id="logo_url"
              value={form.logo_url}
              onChange={(event) => update("logo_url", event.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact_email">E-mail de contato</Label>
            <Input
              id="contact_email"
              type="email"
              value={form.contact_email}
              onChange={(event) => update("contact_email", event.target.value)}
              placeholder="contato@seusite.com.br"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadados padrão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="default_title">Título padrão</Label>
            <Input
              id="default_title"
              value={form.default_title}
              onChange={(event) => update("default_title", event.target.value)}
              maxLength={120}
              placeholder="AffiliateFlow · Recomendações e ofertas que valem a pena"
            />
            <p className="text-xs text-muted-foreground">
              {form.default_title.length}/120 caracteres
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="default_description">Descrição padrão</Label>
            <Textarea
              id="default_description"
              value={form.default_description}
              onChange={(event) => update("default_description", event.target.value)}
              maxLength={320}
              rows={3}
              placeholder="Comparativos, guias de compra e ofertas selecionadas de marketplaces confiáveis."
            />
            <p className="text-xs text-muted-foreground">
              {form.default_description.length}/320 caracteres. Ideal até 160.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="affiliate_disclosure">Aviso de afiliados</Label>
            <Textarea
              id="affiliate_disclosure"
              value={form.affiliate_disclosure}
              onChange={(event) => update("affiliate_disclosure", event.target.value)}
              maxLength={600}
              rows={3}
              placeholder="Esta página contém links de afiliados. Podemos receber uma comissão caso você realize uma compra por meio desses links, sem custo adicional para você."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Indexação e Google Search Console</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Permitir indexação pelos buscadores</p>
              <p className="text-xs text-muted-foreground">
                Desligado, todas as páginas públicas enviam noindex e o robots.txt bloqueia o site.
              </p>
            </div>
            <Switch
              checked={form.allow_indexing}
              onCheckedChange={(checked) => update("allow_indexing", checked)}
              aria-label="Permitir indexação"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="search_console_verification">Código de verificação</Label>
              <Input
                id="search_console_verification"
                value={form.search_console_verification}
                onChange={(event) => update("search_console_verification", event.target.value)}
                placeholder="Cole o valor de content da meta tag"
              />
              <p className="text-xs text-muted-foreground">
                No Search Console, escolha a verificação por tag HTML e copie apenas o valor de
                content.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="search_console_property">Propriedade registrada</Label>
              <Input
                id="search_console_property"
                value={form.search_console_property}
                onChange={(event) => update("search_console_property", event.target.value)}
                placeholder="seusite.com.br"
              />
              <p className="text-xs text-muted-foreground">
                Apenas para referência interna. Nenhum dado de impressões é importado
                automaticamente.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="robots_extra">Regras adicionais do robots.txt</Label>
            <Textarea
              id="robots_extra"
              value={form.robots_extra}
              onChange={(event) => update("robots_extra", event.target.value)}
              rows={3}
              placeholder={"User-agent: GPTBot\nDisallow: /"}
            />
            <p className="text-xs text-muted-foreground">
              Inseridas depois das regras padrão. O sitemap é declarado automaticamente.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar configurações
        </Button>
      </div>
    </form>
  );
}