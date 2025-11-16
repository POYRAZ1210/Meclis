import IdeaCard from "../IdeaCard";

export default function IdeaCardExample() {
  return (
    <div className="p-4 max-w-2xl space-y-4">
      <IdeaCard
        title="Okul Bahçesine Daha Fazla Oturma Alanı"
        excerpt="Teneffüslerde oturacak yer bulamıyoruz. Bahçeye daha fazla bank ve oturma alanı eklenebilir mi?"
        authorName="Zeynep Kaya"
        authorInitials="ZK"
        createdAt="8 Mayıs 2025"
        status="approved"
        commentCount={12}
        onReadMore={() => console.log("Fikir detayı")}
      />
      <IdeaCard
        title="Dijital Kütüphane Sistemi"
        excerpt="E-kitap okumak için dijital bir kütüphane sistemi kurulmasını öneriyorum."
        authorName="Ali Demir"
        authorInitials="AD"
        createdAt="7 Mayıs 2025"
        status="pending"
        commentCount={5}
        onReadMore={() => console.log("Fikir detayı")}
      />
    </div>
  );
}
