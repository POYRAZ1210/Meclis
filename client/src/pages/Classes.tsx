import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Users } from "lucide-react";
import EmptyState from "@/components/EmptyState";

//todo: remove mock functionality
const mockStudents = [
  { id: "1", firstName: "Ahmet", lastName: "Yılmaz", studentNo: "101", className: "9-A", gender: "Erkek" },
  { id: "2", firstName: "Ayşe", lastName: "Demir", studentNo: "102", className: "9-A", gender: "Kız" },
  { id: "3", firstName: "Mehmet", lastName: "Kaya", studentNo: "103", className: "9-A", gender: "Erkek" },
  { id: "4", firstName: "Zeynep", lastName: "Çelik", studentNo: "104", className: "9-B", gender: "Kız" },
  { id: "5", firstName: "Ali", lastName: "Şahin", studentNo: "105", className: "9-B", gender: "Erkek" },
  { id: "6", firstName: "Fatma", lastName: "Arslan", studentNo: "201", className: "10-A", gender: "Kız" },
  { id: "7", firstName: "Mustafa", lastName: "Öztürk", studentNo: "202", className: "10-A", gender: "Erkek" },
  { id: "8", firstName: "Elif", lastName: "Yıldız", studentNo: "203", className: "10-B", gender: "Kız" },
];

const classNames = ["Tümü", "9-A", "9-B", "10-A", "10-B"];

export default function Classes() {
  const [selectedClass, setSelectedClass] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = mockStudents.filter((student) => {
    const matchesClass = selectedClass === "Tümü" || student.className === selectedClass;
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentNo.includes(searchQuery);
    return matchesClass && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sınıflar</h1>
        <p className="text-muted-foreground">Öğrenci listelerini sınıflara göre görüntüleyin</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filtrele</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Sınıf</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger data-testid="select-class">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classNames.map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ara</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="İsim veya numara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-students"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{filteredStudents.length}</span> öğrenci bulundu
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {filteredStudents.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numara</TableHead>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>Sınıf</TableHead>
                      <TableHead>Cinsiyet</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                        <TableCell className="font-medium">{student.studentNo}</TableCell>
                        <TableCell>
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.className}</TableCell>
                        <TableCell>{student.gender}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8">
                <EmptyState
                  icon={Users}
                  title="Öğrenci bulunamadı"
                  description="Seçili filtrelere uygun öğrenci bulunamadı."
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
