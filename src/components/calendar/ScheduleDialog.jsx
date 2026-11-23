import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { schedulePost } from "@/lib/server-fns";

export default function ScheduleDialog({ open, onOpenChange, post, defaultDay }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const queryClient = useQueryClient();
  const schedule = useServerFn(schedulePost);

  useEffect(() => {
    if (open) {
      setDate(defaultDay ?? "");
      setTime("10:00");
    }
  }, [open, defaultDay, post?.id]);

  const save = useMutation({
    mutationFn: () =>
      schedule({
        data: { id: post.id, scheduled_for: `${date}T${time}:00-03:00` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post-editor", post.id] });
      queryClient.invalidateQueries({ queryKey: ["approval-counts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
      toast.success("Publicação agendada.");
      onOpenChange(false);
    },
    onError: (error) => toast.error(error?.message ?? "Não foi possível agendar."),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar publicação</DialogTitle>
          <DialogDescription>
            {post?.title} · horário de Brasília. A distribuição é feita pela fila de publicação.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="schedule-date">Data</Label>
            <Input
              id="schedule-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="schedule-time">Horário</Label>
            <Input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => save.mutate()}
            disabled={!date || !time || save.isPending}
          >
            {save.isPending ? "Agendando..." : "Agendar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}