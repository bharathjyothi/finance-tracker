import {
  Car,
  Clapperboard,
  CreditCard,
  HeartPulse,
  Home,
  Landmark,
  MoreHorizontal,
  PiggyBank,
  Repeat,
  Shield,
  ShoppingCart,
  Trees,
  TrendingUp,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  home: Home,
  zap: Zap,
  shield: Shield,
  car: Car,
  "shopping-cart": ShoppingCart,
  utensils: Utensils,
  trees: Trees,
  repeat: Repeat,
  clapperboard: Clapperboard,
  "heart-pulse": HeartPulse,
  "more-horizontal": MoreHorizontal,
  landmark: Landmark,
  "piggy-bank": PiggyBank,
  "trending-up": TrendingUp,
  "credit-card": CreditCard,
};

export function resolveIcon(name: string | null | undefined): LucideIcon {
  return (name && ICONS[name]) || MoreHorizontal;
}

export const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  checking: "Checking",
  savings: "Savings / HYSA",
  brokerage: "Brokerage",
  credit_card: "Credit Card",
};
