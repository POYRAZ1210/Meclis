import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getEvents, type EventWithStatus } from "@/lib/api/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Check
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/tr";

dayjs.locale("tr");

const DAYS_OF_WEEK = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

export default function Takvim() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: getEvents,
    enabled: !!user,
  });

  const eventsWithDates = useMemo(() => {
    if (!events) return [];
    return events.filter(event => event.event_date);
  }, [events]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventWithStatus[]>();
    eventsWithDates.forEach(event => {
      if (event.event_date) {
        const dateKey = dayjs(event.event_date).format("YYYY-MM-DD");
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(event);
      }
    });
    return map;
  }, [eventsWithDates]);

  const calendarDays = useMemo(() => {
    const startOfMonth = currentDate.startOf("month");
    const endOfMonth = currentDate.endOf("month");
    const startDay = startOfMonth.day();
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
    
    const days: (dayjs.Dayjs | null)[] = [];
    
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null);
    }
    
    let day = startOfMonth;
    while (day.isBefore(endOfMonth) || day.isSame(endOfMonth, "day")) {
      days.push(day);
      day = day.add(1, "day");
    }
    
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    
    return days;
  }, [currentDate]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.format("YYYY-MM-DD");
    return eventsByDate.get(dateKey) || [];
  }, [selectedDate, eventsByDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month"));
  };

  const goToNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month"));
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
    setSelectedDate(dayjs());
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 lg:px-6 py-8">
        <div className="mb-8">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="heading-takvim">
          Etkinlik Takvimi
        </h1>
        <p className="text-muted-foreground">
          Okul etkinliklerini takvim görünümünde inceleyin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-xl">
                  {MONTHS[currentDate.month()]} {currentDate.year()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    data-testid="button-today"
                  >
                    Bugün
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPreviousMonth}
                    data-testid="button-prev-month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextMonth}
                    data-testid="button-next-month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }
                  
                  const dateKey = day.format("YYYY-MM-DD");
                  const dayEvents = eventsByDate.get(dateKey) || [];
                  const isToday = day.isSame(dayjs(), "day");
                  const isSelected = selectedDate && day.isSame(selectedDate, "day");
                  const hasEvents = dayEvents.length > 0;
                  
                  return (
                    <button
                      key={dateKey}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        aspect-square p-1 rounded-lg flex flex-col items-center justify-start
                        transition-all hover-elevate
                        ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                        ${isSelected ? "bg-primary text-primary-foreground" : ""}
                        ${!isSelected && hasEvents ? "bg-accent" : ""}
                      `}
                      data-testid={`calendar-day-${dateKey}`}
                    >
                      <span className={`text-sm font-medium ${isSelected ? "" : isToday ? "text-primary" : ""}`}>
                        {day.date()}
                      </span>
                      {hasEvents && (
                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                          {dayEvents.slice(0, 3).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-primary"}`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {selectedDate 
                  ? selectedDate.format("D MMMM YYYY") 
                  : "Tarih Seçin"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <p className="text-muted-foreground text-sm">
                  Etkinlikleri görmek için takvimden bir gün seçin.
                </p>
              ) : selectedDateEvents.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Bu tarihte etkinlik bulunmuyor.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Yaklaşan Etkinlikler</CardTitle>
            </CardHeader>
            <CardContent>
              {eventsWithDates.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Yaklaşan etkinlik bulunmuyor.
                </p>
              ) : (
                <div className="space-y-3">
                  {eventsWithDates
                    .filter(e => e.event_date && dayjs(e.event_date).isAfter(dayjs().subtract(1, "day")))
                    .sort((a, b) => dayjs(a.event_date).diff(dayjs(b.event_date)))
                    .slice(0, 5)
                    .map((event) => (
                      <EventCard key={event.id} event={event} showDate />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

interface EventCardProps {
  event: EventWithStatus;
  showDate?: boolean;
}

function EventCard({ event, showDate = false }: EventCardProps) {
  return (
    <div 
      className="p-3 rounded-lg bg-muted hover-elevate transition-all"
      data-testid={`event-card-${event.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm" data-testid={`text-event-name-${event.id}`}>
          {event.name}
        </h4>
        {event.has_applied && (
          <Badge variant="default" className="bg-green-600 shrink-0 text-xs">
            <Check className="h-3 w-3 mr-1" />
            Başvurdunuz
          </Badge>
        )}
      </div>
      
      {event.description && (
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {event.description}
        </p>
      )}
      
      {showDate && event.event_date && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{dayjs(event.event_date).format("D MMMM YYYY, HH:mm")}</span>
        </div>
      )}
      
      {!showDate && event.event_date && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{dayjs(event.event_date).format("HH:mm")}</span>
        </div>
      )}
    </div>
  );
}
