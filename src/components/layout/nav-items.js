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
  Search,
  Settings,
  Store,
  Tags,
  Target,
} from "lucide-react";

export const NAV_GROUPS = [
  {
    label: "Visão geral",
    items: [
      { label: "Dashboard", to: "/painel", icon: LayoutDashboard },
      { label: "Oportunidades", to: "/oportunidades", icon: Target },
    ],
  },
  {
    label: "Vitrine",
    items: [
      { label: "SEO e Google", to: "/seo", icon: Search },
      { label: "Vitrine pública", to: "/", icon: Store },
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
      { label: "Campanhas", to: "/campanhas", icon: Megaphone },
      { label: "Estúdio de conteúdo", to: "/estudio", icon: PenLine },
      { label: "Aprovações", to: "/aprovacoes", icon: CheckCircle2 },
      { label: "Calendário", to: "/calendario", icon: CalendarDays },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Integrações", icon: Plug, phase: 5 },
      { label: "Analytics", to: "/analytics", icon: BarChart3 },
      { label: "Configurações", to: "/configuracoes", icon: Settings },
    ],
  },
];

export const getPageTitle = (pathname) => {
  if (pathname === "/painel") return "Dashboard";
  const match = NAV_GROUPS.flatMap((group) => group.items).find(
    (item) => item.to && item.to !== "/" && pathname.startsWith(item.to),
  );
  return match?.label ?? "AffiliateFlow";
};