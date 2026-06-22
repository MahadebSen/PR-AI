import { Bolt, Code, ShieldCheck } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: ShieldCheck,
    iconClass: "text-severity-critical",
    title: "Security",
    description:
      "OWASP vulnerabilities, secret leaks, injection risks, and unsafe patterns.",
  },
  {
    icon: Bolt,
    iconClass: "text-severity-warning",
    title: "Performance",
    description:
      "N+1 queries, memory leaks, blocking operations, and hot-path inefficiencies.",
  },
  {
    icon: Code,
    iconClass: "text-link",
    title: "Code Quality",
    description:
      "Complexity, test gaps, naming issues, duplication, and maintainability.",
  },
];

export function FeatureCards() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {features.map((feature) => (
        <Card
          key={feature.title}
          className="border-border/80 bg-gradient-to-b from-card to-background shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        >
          <CardHeader className="text-center">
            <feature.icon
              className={`mx-auto mb-2 size-8 ${feature.iconClass}`}
            />
            <CardTitle className="text-base">{feature.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center text-sm leading-relaxed">
              {feature.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
