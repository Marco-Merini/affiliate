import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SearchBar({
  defaultValue = "",
  placeholder = "O que você procura? Ex.: fone bluetooth",
  className,
}) {
  const [value, setValue] = useState(defaultValue);
  const navigate = useNavigate();

  const submit = (event) => {
    event.preventDefault();
    navigate({ to: "/produtos", search: { q: value.trim() || undefined } });
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl border border-border bg-background p-1.5 shadow-sm",
        className,
      )}
    >
      <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label="Pesquisar produtos"
        className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      <Button type="submit" size="sm" className="shrink-0">
        Buscar
      </Button>
    </form>
  );
}