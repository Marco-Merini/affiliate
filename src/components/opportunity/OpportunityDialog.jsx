import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import ScoreBadge from "@/components/opportunity/ScoreBadge";
import {
  OPPORTUNITY_SIGNALS,
  computeOpportunityScore,
  opportunitySignalsFrom,
  opportunityTier,
  signalsProvided,
} from "@/lib/opportunity";
import { saveProductSignals } from "@/lib/server-fns";

export default function OpportunityDialog({ open, onOpenChange, product }) {
  const [signals, setSignals] = useState({});
  const queryClient = useQueryClient();
  const save = useServerFn(saveProductSignals);

  useEffect(() => {
    if (open) setSignals(opportunitySignalsFrom(product));
  }, [open, product]);

  const score = computeOpportunityScore(signals);
  const provided = signalsProvided(signals);

  const mutation = useMutation({
    mutationFn: (payload) => save({ data: { id: product.id, ...payload } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      toast.success("Análise de oportunidade salva.");
      onOpenChange(false);
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível salvar a análise."),
  });

  const setSignal = (key, value) =>
    setSignals((current) => ({ ...current, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Analisar oportunidade</DialogTitle>
          <DialogDescription>
            {product?.name} · registre de 0 a 10 o que você observa no mercado. O score combina os
            sinais com pesos diferentes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              Score calculado
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {provided} de {OPPORTUNITY_SIGNALS.length} sinais avaliados ·{" "}
              {opportunityTier(score).label}
            </p>
          </div>
          <ScoreBadge score={score} className="px-3 py-1 text-[15px]" />
        </div>

        <div className="space-y-4">
          {OPPORTUNITY_SIGNALS.map((signal) => {
            const value = signals[signal.key];
            const informed = value !== null && value !== undefined;

            return (
              <div key={signal.key} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium leading-tight">
                      {signal.label}
                      <span className="ml-1.5 text-[10.5px] font-normal text-muted-foreground">
                        peso {signal.weight}%
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{signal.hint}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="w-10 text-right text-[12px] font-semibold tabular-nums">
                      {informed ? `${value}/10` : "—"}
                    </span>
                    {informed && (
                      <button
                        type="button"
                        aria-label="Limpar sinal"
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                        onClick={() => setSignal(signal.key, null)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <Slider
                  value={[informed ? Number(value) : 0]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={([next]) => setSignal(signal.key, next)}
                />
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(signals)}
          >
            {mutation.isPending ? "Salvando..." : "Salvar análise"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}