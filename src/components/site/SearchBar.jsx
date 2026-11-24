import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SearchBar({
  defaultValue = "",
  placeholder = "O que você procura? Ex.: fone bluetooth",
  size = "md",
  showButton = true,
  className,
}) {
  const [value, setValue] = useState(defaultValue);
  const navigate = useNavigate();
  const large = size === "lg";

  const submit = (event) => {
    event.preventDefault();
    navigate({ to: "/produtos", search: { q: value.trim() || undefined } });
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn(
        "flex w-full items-center gap-2 rounded-full border border-border bg-card pl-4 pr-1.5",
        large ? "h-14" : "h-11",
        className,
      )}
    >
      <Search
        className={cn("shrink-0 text-muted-foreground", large ? "h-5 w-5" : "h-4 w-4")}
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label="Pesquisar produtos"
        className={cn(
          "h-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0",
          large ? "text-base" : "text-sm",
        )}
      />
      {showButton ? (
        <Button
          type="submit"
          className={cn("shrink-0 rounded-full px-5", large ? "h-11" : "h-8 text-[13px]")}
        >
          Buscar
        </Button>
      ) : null}
    </form>
  );
}