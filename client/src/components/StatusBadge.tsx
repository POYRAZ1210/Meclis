import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

type Status = "pending" | "approved" | "rejected";

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    pending: {
      label: "Beklemede",
      icon: Clock,
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    },
    approved: {
      label: "Onaylandı",
      icon: CheckCircle2,
      className: "bg-green-500/10 text-green-500 border-green-500/20",
    },
    rejected: {
      label: "Reddedildi",
      icon: XCircle,
      className: "bg-red-500/10 text-red-500 border-red-500/20",
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <Badge variant="outline" className={className} data-testid={`badge-status-${status}`}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
