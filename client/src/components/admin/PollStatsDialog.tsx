import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PollStatsDialogProps {
  pollId: string;
  pollQuestion: string;
}

const COLORS = ['#6b1c9e', '#d61b3c', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function PollStatsDialog({ pollId, pollQuestion }: PollStatsDialogProps) {
  const [open, setOpen] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/polls', pollId, 'stats'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch(`/api/admin/polls/${pollId}/stats`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch stats');
      }

      return res.json();
    },
    enabled: open,
  });

  // Prepare pie chart data for overall class breakdown
  const classChartData = stats?.overall_class_breakdown 
    ? Object.entries(stats.overall_class_breakdown).map(([name, value]) => ({
        name,
        value: value as number,
      }))
    : [];

  // Prepare data for each option's class breakdown
  const optionClassData = stats?.option_stats?.map((opt: any) => {
    return {
      ...opt,
      classChartData: Object.entries(opt.class_breakdown).map(([name, value]) => ({
        name,
        value: value as number,
      })),
    };
  }) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid={`button-stats-${pollId}`}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Detaylı İstatistikler
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{pollQuestion}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <div className="space-y-6 overflow-y-auto pr-2 flex-1">
            {/* Overall Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Genel İstatistikler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Oy</p>
                    <p className="text-2xl font-bold">{stats.total_votes}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seçenek Sayısı</p>
                    <p className="text-2xl font-bold">{stats.poll.options.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Class Breakdown */}
            {classChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sınıf Bazlı Katılım</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={classChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={75}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {classChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                      {classChartData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded flex-shrink-0" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="font-semibold">{item.value} oy</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Per-Option Stats */}
            {optionClassData.map((opt: any, idx: number) => (
              <Card key={opt.option_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{opt.option_text}</CardTitle>
                  <p className="text-sm text-muted-foreground">{opt.total_votes} oy ({stats.total_votes > 0 ? Math.round((opt.total_votes / stats.total_votes) * 100) : 0}%)</p>
                </CardHeader>
                <CardContent>
                  {opt.classChartData.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                      <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={opt.classChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={65}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {opt.classChartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
                        <p className="font-semibold mb-2 text-sm">Sınıf Dağılımı:</p>
                        {opt.classChartData.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded flex-shrink-0" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm">{item.name}</span>
                            </div>
                            <span className="font-semibold">{item.value} oy</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Bu seçeneğe henüz oy verilmedi</p>
                  )}

                  {/* Voter List */}
                  {opt.votes.length > 0 && (
                    <div className="mt-6">
                      <p className="font-semibold mb-2 text-sm">Oy Verenler:</p>
                      <div className="space-y-1 max-h-[160px] overflow-y-auto pr-2 border rounded-md p-2 bg-background/50">
                        {opt.votes.map((vote: any, vIdx: number) => (
                          <div key={vIdx} className="text-sm flex items-center justify-between py-1.5 px-2 rounded hover-elevate">
                            <span>
                              {vote.profile?.first_name} {vote.profile?.last_name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {vote.profile?.class_name || 'Sınıf yok'} 
                              {vote.profile?.student_no ? ` - ${vote.profile.student_no}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">İstatistik bulunamadı</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
