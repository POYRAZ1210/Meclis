import { useState } from "react";
import PollCard from "../PollCard";

export default function PollCardExample() {
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<string>();
  const [options, setOptions] = useState([
    { id: "1", text: "Evet, katılmak istiyorum", votes: 45 },
    { id: "2", text: "Hayır, katılamam", votes: 12 },
    { id: "3", text: "Belki, kararsızım", votes: 23 },
  ]);

  const handleVote = (optionId: string) => {
    setOptions(prev => 
      prev.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      )
    );
    setUserVote(optionId);
    setHasVoted(true);
    console.log("Oy verildi:", optionId);
  };

  return (
    <div className="p-4 max-w-2xl">
      <PollCard
        question="Okul pikniğine katılmak ister misiniz?"
        options={options}
        totalVotes={options.reduce((sum, opt) => sum + opt.votes, 0)}
        hasVoted={hasVoted}
        userVote={userVote}
        isOpen={true}
        onVote={handleVote}
      />
    </div>
  );
}
