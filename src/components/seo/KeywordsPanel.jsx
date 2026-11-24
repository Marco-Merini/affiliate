import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import KeywordDialog from "@/components/seo/KeywordDialog";
import { deleteKeyword } from "@/lib/seo-fns";
import { KEYWORD_INTENTS, KEYWORD_PRIORITIES, KEYWORD_STATUSES, labelOf } from "@/lib/keywords";

const PRIORITY_CLASS = {
  high: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "border-border bg-muted text-muted-foreground",
};

const STATUS_CLASS = {
  planned: "border-border bg-muted text-muted-foreground",
  in_progress: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  published: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export default function KeywordsPanel({ keywords, categories }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const remove = useServerFn(deleteKeyword);
  const router = useRouter();

  const categoryName = (id) => categories.find((category) => category.id === id)?.name ?? "—";

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (keyword) => {
    setEditing(keyword);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await remove({ data: { id: pendingDelete.id } });
      toast.success("Palavra-chave removida");
      setPendingDelete(null);
      await router.invalidate();
    } catch (error) {
      toast.error(error?.message || "Não foi possível remover a palavra-chave");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">Palavras-chave</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Planejamento de termos para guias e páginas de categoria. Nenhum volume é estimado sem
            fonte informada.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Nova
        </Button>
      </CardHeader>
      <CardContent>
        {keywords.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Palavra-chave</TableHead>
                  <TableHead>Intenção</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((keyword) => (
                  <TableRow key={keyword.id}>
                    <TableCell className="max-w-[220px] font-medium">
                      <span className="line-clamp-2">{keyword.keyword}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {labelOf(KEYWORD_INTENTS, keyword.intent)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {categoryName(keyword.category_id)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={PRIORITY_CLASS[keyword.priority]}>
                        {labelOf(KEYWORD_PRIORITIES, keyword.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_CLASS[keyword.status]}>
                        {labelOf(KEYWORD_STATUSES, keyword.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                      {keyword.target_url || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(keyword)}
                          aria-label={`Editar ${keyword.keyword}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPendingDelete(keyword)}
                          aria-label={`Remover ${keyword.keyword}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Nenhuma palavra-chave cadastrada. Comece pelas buscas que descrevem o que o visitante
            quer comprar.
          </p>
        )}
      </CardContent>

      <KeywordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        keyword={editing}
        categories={categories}
      />

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover palavra-chave?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.keyword}” será excluída do planejamento. Essa ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}