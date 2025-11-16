import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users } from "lucide-react";

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
  onVote?: (optionId: string) => void;
}

export default function PollCard({
  question,
  options,
  totalVotes,
  hasVoted = false,
  userVote,
  isOpen = true,
  onVote,
}: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>(userVote || "");

  const handleVote = () => {
    if (selectedOption && onVote) {
      onVote(selectedOption);
    }
  };

  return (
    <Card className="hover-elevate transition-all" data-testid="card-poll">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg leading-tight">{question}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasVoted && isOpen ? (
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
        ) : (
          <>
            <div className="space-y-3">
              {options.map((option) => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                const isUserVote = userVote === option.id;
                return (
                  <div key={option.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={isUserVote ? "font-medium" : ""}>
                        {option.text}
                        {isUserVote && " (Sizin oyunuz)"}
                      </span>
                      <span className="text-muted-foreground">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2">
              <Users className="h-3 w-3" />
              <span>{totalVotes} kişi oy verdi</span>
            </div>
            {!isOpen && (
              <p className="text-sm text-yellow-500">Bu oylama kapatılmıştır</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
