import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  Megaphone,
  Network,
  Package,
  PenLine,
  Plug,
  Settings,
  Tags,
  Target,
} from "lucide-react";

export const NAV_GROUPS = [
  {
    label: "Visão geral",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard },
      { label: "Oportunidades", to: "/oportunidades", icon: Target },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { label: "Produtos", to: "/produtos", icon: Package },
      { label: "Programas", to: "/programas", icon: Network },
      { label: "Categorias", to: "/categorias", icon: Tags },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      { label: "Campanhas", icon: Megaphone, phase: 3 },
      { label: "Estúdio de conteúdo", icon: PenLine, phase: 3 },
      { label: "Aprovações", icon: CheckCircle2, phase: 4 },
      { label: "Calendário", icon: CalendarDays, phase: 4 },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Integrações", icon: Plug, phase: 5 },
      { label: "Analytics", icon: BarChart3, phase: 6 },
      { label: "Configurações", to: "/configuracoes", icon: Settings },
    ],
  },
];

export const getPageTitle = (pathname) => {
  if (pathname === "/") return "Dashboard";
  const match = NAV_GROUPS.flatMap((group) => group.items).find(
    (item) => item.to && item.to !== "/" && pathname.startsWith(item.to),
  );
  return match?.label ?? "AffiliateFlow";
};