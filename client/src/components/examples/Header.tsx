import Header from "../Header";

export default function HeaderExample() {
  return (
    <Header 
      isAuthenticated={true}
      userRole="admin"
      userName="Ahmet Yılmaz"
      onLogout={() => console.log("Çıkış yapıldı")}
    />
  );
}
