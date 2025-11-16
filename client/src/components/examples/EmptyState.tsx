import EmptyState from "../EmptyState";
import { Bell } from "lucide-react";

export default function EmptyStateExample() {
  return (
    <div className="p-8 bg-card rounded-lg">
      <EmptyState
        icon={Bell}
        title="Henüz duyuru yok"
        description="İlk duyuruyu oluşturmak için aşağıdaki butona tıklayın."
        actionLabel="Yeni Duyuru"
        onAction={() => console.log("Yeni duyuru ekle")}
      />
    </div>
  );
}
