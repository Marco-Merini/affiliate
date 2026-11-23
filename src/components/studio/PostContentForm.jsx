import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PLATFORMS } from "@/lib/constants";
import { CAPTION_LIMIT, POST_FORMATS } from "@/lib/studio";

const NONE = "none";

export default function PostContentForm({ form, onChange, campaigns, products, links }) {
  const productLinks = links.filter((link) => link.product_id === form.product_id);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1.5">
        <Label htmlFor="post-title">Título interno</Label>
        <Input
          id="post-title"
          value={form.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="Ex.: Fone ANC — carrossel de 3 slides"
          maxLength={160}
        />
        <p className="text-[11px] text-muted-foreground">Só aparece no painel, nunca na publicação.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Plataforma</Label>
          <Select value={form.platform} onValueChange={(value) => onChange("platform", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Formato</Label>
          <Select value={form.format} onValueChange={(value) => onChange("format", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POST_FORMATS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Campanha</Label>
          <Select
            value={form.campaign_id || NONE}
            onValueChange={(value) => onChange("campaign_id", value === NONE ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sem campanha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sem campanha</SelectItem>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Produto divulgado</Label>
          <Select
            value={form.product_id || NONE}
            onValueChange={(value) => {
              onChange("product_id", value === NONE ? "" : value);
              onChange("affiliate_link_id", "");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sem produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sem produto</SelectItem>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Link de afiliado</Label>
        <Select
          value={form.affiliate_link_id || NONE}
          onValueChange={(value) => onChange("affiliate_link_id", value === NONE ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sem link" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sem link</SelectItem>
            {productLinks.map((link) => (
              <SelectItem key={link.id} value={link.id}>
                {link.label || link.url}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          {form.product_id
            ? productLinks.length === 0
              ? "Este produto ainda não tem links cadastrados."
              : "O link usado no CTA desta publicação."
            : "Escolha um produto para ver os links disponíveis."}
        </p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="post-caption">Legenda</Label>
          <span className="text-[11px] text-muted-foreground">
            {form.caption.length}/{CAPTION_LIMIT}
          </span>
        </div>
        <Textarea
          id="post-caption"
          value={form.caption}
          onChange={(event) => onChange("caption", event.target.value.slice(0, CAPTION_LIMIT))}
          rows={6}
          placeholder="Texto que aparece na publicação. Escreva a promessa, o benefício e a chamada para ação."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="post-cta">Chamada para ação</Label>
          <Input
            id="post-cta"
            value={form.cta}
            onChange={(event) => onChange("cta", event.target.value)}
            placeholder="Ex.: Confira o link na bio"
            maxLength={240}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="post-hashtags">Hashtags</Label>
          <Input
            id="post-hashtags"
            value={form.hashtags}
            onChange={(event) => onChange("hashtags", event.target.value)}
            placeholder="fonebluetooth, tecnologia, promocao"
          />
          <p className="text-[11px] text-muted-foreground">Separe por vírgula. O # é adicionado sozinho.</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-description">Texto de apoio</Label>
        <Textarea
          id="post-description"
          value={form.description}
          onChange={(event) => onChange("description", event.target.value)}
          rows={3}
          placeholder="Detalhes do produto para consulta interna ou para os slides."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="post-disclosure">Aviso de afiliado</Label>
        <Input
          id="post-disclosure"
          value={form.affiliate_disclosure}
          onChange={(event) => onChange("affiliate_disclosure", event.target.value)}
          placeholder="Conteúdo de afiliado: posso receber comissão pelas compras feitas pelos links."
          maxLength={300}
        />
      </div>
    </div>
  );
}