import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BarChart3, Users, CheckCircle } from "lucide-react";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollCardProps {
  question: string;
  options: PollOption[];
  totalVotes: number;
  hasVoted?: boolean;
  userVote?: string;
  isOpen?: boolean;
  resultsPublished?: boolean;
  onVote?: (optionId: string) => void;
}

export default function PollCard({
  question,
  options,
  totalVotes,
  hasVoted = false,
  userVote,
  isOpen = true,
  resultsPublished = false,
  onVote,
}: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>(userVote || "");
  const [showChangeDialog, setShowChangeDialog] = useState(false);

  const handleVote = () => {
    if (selectedOption && onVote) {
      // If user has already voted, show confirmation dialog
      if (hasVoted && selectedOption !== userVote) {
        setShowChangeDialog(true);
      } else {
        onVote(selectedOption);
      }
    }
  };

  const confirmVoteChange = () => {
    if (selectedOption && onVote) {
      setShowChangeDialog(false);
      onVote(selectedOption);
    }
  };

  return (
    <Card className="group border-border/50" data-testid="card-poll">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/50">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-base leading-tight">{question}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasVoted && isOpen && !resultsPublished ? (
          <>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} data-testid={`radio-option-${option.id}`} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button
              onClick={handleVote}
              disabled={!selectedOption}
              className="w-full"
              data-testid="button-vote"
            >
              Oy Ver
            </Button>
          </>
        ) : hasVoted && !resultsPublished ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-lg">Oyunuz Kaydedildi!</p>
              <p className="text-sm text-muted-foreground">
                Sonuçlar yönetici tarafından yayınlandığında burada görünecek
              </p>
            </div>
            {isOpen && (
              <>
                <div className="w-full border-t pt-4">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Oyunuzu değiştirmek ister misiniz?
                  </p>
                  <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                    {options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={`change-${option.id}`} data-testid={`radio-change-${option.id}`} />
                        <Label htmlFor={`change-${option.id}`} className="flex-1 cursor-pointer">
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Button
                    onClick={handleVote}
                    disabled={!selectedOption || selectedOption === userVote}
                    variant="outline"
                    className="w-full mt-3"
                    data-testid="button-change-vote"
                  >
                    Oyumu Değiştir
                  </Button>
                </div>
              </>
            )}
            {!isOpen && (
              <p className="text-sm text-yellow-500 mt-4">
                Bu oylama kapatılmıştır. Sonuçlar henüz yayınlanmadı.
              </p>
            )}
          </div>
        ) : resultsPublished ? (
          <>
            <div className="space-y-3">
              {options.map((option) => {
                const isUserVote = userVote === option.id;
                return (
                  <div key={option.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={isUserVote ? "font-medium" : ""}>
                        {option.text}
                        {isUserVote && " (Sizin oyunuz)"}
                      </span>
                      <span className="text-muted-foreground font-medium">
                        {option.votes} oy
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
              <Users className="h-3 w-3" />
              <span>Toplam {totalVotes} kişi oy verdi</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ Sonuçlar yayınlandı
            </p>
          </>
        ) : null}

        {isOpen && !resultsPublished && (
          <AlertDialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Oyunuzu değiştirmek istediğinize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Şu an <strong>{options.find(o => o.id === userVote)?.text}</strong> seçeneğine oy vermişsiniz.
                  Bunu <strong>{options.find(o => o.id === selectedOption)?.text}</strong> olarak değiştirmek üzeresiniz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={confirmVoteChange}>
                  Evet, Değiştir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
