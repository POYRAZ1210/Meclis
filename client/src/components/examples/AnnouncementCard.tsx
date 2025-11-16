import AnnouncementCard from "../AnnouncementCard";

export default function AnnouncementCardExample() {
  return (
    <div className="p-4 max-w-2xl">
      <AnnouncementCard
        title="Yaz Tatili Duyurusu"
        content="Sevgili öğrenciler, yaz tatili 15 Haziran tarihinde başlayacaktır. Tüm öğrencilerin bu tarihten itibaren okulda bulunması zorunlu değildir. İyi tatiller dileriz!"
        authorName="Müdür Yardımcısı"
        createdAt="10 Mayıs 2025"
        onReadMore={() => console.log("Devamını oku")}
      />
    </div>
  );
}
