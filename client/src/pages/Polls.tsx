import { useState } from "react";
import { Button } from "@/components/ui/button";
import PollCard from "@/components/PollCard";
import EmptyState from "@/components/EmptyState";
import { BarChart3, Plus } from "lucide-react";

//todo: remove mock functionality
const mockPolls = [
  {
    id: "1",
    question: "Okul pikniği için hangi tarihi tercih edersiniz?",
    options: [
      { id: "1", text: "15 Haziran Cumartesi", votes: 34 },
      { id: "2", text: "22 Haziran Cumartesi", votes: 28 },
      { id: "3", text: "29 Haziran Cumartesi", votes: 15 },
    ],
    isOpen: true,
  },
  {
    id: "2",
    question: "Hangi kulüp etkinliğine katılmak istersiniz?",
    options: [
      { id: "1", text: "Robotik Kulübü", votes: 45 },
      { id: "2", text: "Tiyatro Kulübü", votes: 38 },
      { id: "3", text: "Müzik Kulübü", votes: 52 },
      { id: "4", text: "Spor Kulübü", votes: 41 },
    ],
    isOpen: true,
  },
  {
    id: "3",
    question: "Kantinde hangi yeni ürünü görmek istersiniz?",
    options: [
      { id: "1", text: "Sağlıklı atıştırmalıklar", votes: 67 },
      { id: "2", text: "Taze meyve suları", votes: 89 },
      { id: "3", text: "Vejetaryen sandviçler", votes: 34 },
    ],
    isOpen: false,
  },
];

export default function Polls() {
  const [polls] = useState(mockPolls);
  const [votedPolls, setVotedPolls] = useState<Record<string, string>>({});

  const handleVote = (pollId: string, optionId: string) => {
    setVotedPolls((prev) => ({ ...prev, [pollId]: optionId }));
    console.log("Oy verildi - Anket:", pollId, "Seçenek:", optionId);
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Oylamalar</h1>
            <p className="text-muted-foreground">Aktif ve tamamlanmış oylamaları görüntüleyin</p>
          </div>
          <Button data-testid="button-new-poll">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Oylama
          </Button>
        </div>
      </div>

      {polls.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
            return (
              <PollCard
                key={poll.id}
                question={poll.question}
                options={poll.options}
                totalVotes={totalVotes}
                hasVoted={!!votedPolls[poll.id]}
                userVote={votedPolls[poll.id]}
                isOpen={poll.isOpen}
                onVote={(optionId) => handleVote(poll.id, optionId)}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="Henüz oylama yok"
          description="İlk oylamayı oluşturun ve öğrencilerin görüşlerini alın."
        />
      )}
    </div>
  );
}
