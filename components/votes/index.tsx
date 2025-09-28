import VoteButtons from "./VoteButtons";
import VoteStats from "./VoteStats";

// Example usage in a Guide component
export function GuideVoteExample({ guide }: { guide: any }) {
  return (
    <div className="space-y-4">
      {/* Vote Stats Display */}
      <VoteStats
        upvotes={guide.upvotes}
        downvotes={guide.downvotes}
        views={guide.views}
        comments={guide.comments}
        showLabels={true}
        className="p-4 bg-gray-50 rounded-lg"
      />

      {/* Interactive Vote Buttons */}
      <VoteButtons
        targetId={guide._id}
        targetType="guide"
        upvotes={guide.upvotes}
        downvotes={guide.downvotes}
        className="p-4 border rounded-lg"
      />
    </div>
  );
}

export { VoteButtons, VoteStats };
