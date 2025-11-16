import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Search, Users, Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { getProfiles, getClassNames } from "@/lib/api/profiles";

export default function Classes() {
  const [selectedClass, setSelectedClass] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["/api/profiles", selectedClass],
    queryFn: () => getProfiles(selectedClass),
  });

  const { data: classNamesData, isLoading: loadingClassNames } = useQuery({
    queryKey: ["/api/class-names"],
    queryFn: getClassNames,
  });

  const classNames = ["Tümü", ...(classNamesData || [])];

  const filteredStudents = profiles?.filter((profile) => {
    const matchesSearch =
      profile.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.student_no?.includes(searchQuery);
    return matchesSearch;
  }) || [];

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
          {loadingProfiles ? (
            <Card>
              <CardContent className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : filteredStudents.length > 0 ? (
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
                        <TableCell className="font-medium">{student.student_no || "-"}</TableCell>
                        <TableCell>
                          {student.first_name} {student.last_name}
                        </TableCell>
                        <TableCell>{student.class_name || "-"}</TableCell>
                        <TableCell>{student.gender || "-"}</TableCell>
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
