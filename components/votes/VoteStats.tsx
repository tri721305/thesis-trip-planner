"use client";

import { ThumbsUp, ThumbsDown, Eye, MessageCircle } from "lucide-react";

interface VoteStatsProps {
  upvotes?: number;
  downvotes?: number;
  views?: number;
  comments?: number;
  className?: string;
  showLabels?: boolean;
}

export default function VoteStats({
  upvotes = 0,
  downvotes = 0,
  views = 0,
  comments = 0,
  className = "",
  showLabels = false,
}: VoteStatsProps) {
  const netScore = upvotes - downvotes;

  return (
    <div
      className={`flex items-center gap-4 text-sm text-gray-500 ${className}`}
    >
      {/* Upvotes */}
      <div className="flex items-center gap-1">
        <ThumbsUp className="w-4 h-4 text-green-500" />
        <span className="font-medium text-green-600">{upvotes}</span>
        {showLabels && <span>upvotes</span>}
      </div>

      {/* Downvotes */}
      <div className="flex items-center gap-1">
        <ThumbsDown className="w-4 h-4 text-red-500" />
        <span className="font-medium text-red-600">{downvotes}</span>
        {showLabels && <span>downvotes</span>}
      </div>

      {/* Net Score */}
      <div className="flex items-center gap-1">
        <span className="text-xs">Score:</span>
        <span
          className={`font-bold ${
            netScore > 0
              ? "text-green-600"
              : netScore < 0
                ? "text-red-600"
                : "text-gray-500"
          }`}
        >
          {netScore > 0 ? "+" : ""}
          {netScore}
        </span>
      </div>

      {/* Views */}
      {views > 0 && (
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{views}</span>
          {showLabels && <span>views</span>}
        </div>
      )}

      {/* Comments */}
      {comments > 0 && (
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{comments}</span>
          {showLabels && <span>comments</span>}
        </div>
      )}
    </div>
  );
}
