import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { createVote, hasVoted } from "@/lib/actions/vote.action";
import { toast } from "@/hooks/use-toast";
import { BiSolidDislike, BiSolidLike } from "react-icons/bi";

interface CommentItemProps {
  comment: {
    _id: string;
    content: string;
    author: {
      _id: string;
      username: string;
      name: string;
      image?: string;
    };
    createdAt: string;
    editedAt?: string;
    upvotes: number;
    downvotes: number;
    replies?: any[];
  };
  onVoteUpdate?: () => void;
}

const CommentItem = ({ comment, onVoteUpdate }: CommentItemProps) => {
  const [isVoting, setIsVoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(comment.upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(comment.downvotes);

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
      });
    } catch (error) {
      return "just now";
    }
  };

  // Check if user has voted on component mount
  useEffect(() => {
    const checkUserVote = async () => {
      try {
        const result = await hasVoted({
          targetId: comment._id,
          targetType: "comment",
        });

        if (result.success && result.data) {
          setHasUpvoted(result.data.hasUpvoted);
          setHasDownvoted(result.data.hasDownvoted);
        }
      } catch (error) {
        console.error("Error checking vote status:", error);
      }
    };

    checkUserVote();
  }, [comment._id]);

  // Update local counts when comment prop changes
  useEffect(() => {
    setLocalUpvotes(comment.upvotes);
    setLocalDownvotes(comment.downvotes);
  }, [comment.upvotes, comment.downvotes]);

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      const result = await createVote({
        targetId: comment._id,
        targetType: "comment",
        voteType,
      });

      if (result.success) {
        // Toggle vote state
        if (voteType === "upvote") {
          if (hasUpvoted) {
            // Remove upvote
            setHasUpvoted(false);
            setLocalUpvotes((prev) => prev - 1);
          } else {
            // Add upvote, remove downvote if exists
            setHasUpvoted(true);
            setLocalUpvotes((prev) => prev + 1);
            if (hasDownvoted) {
              setHasDownvoted(false);
              setLocalDownvotes((prev) => prev - 1);
            }
          }
        } else {
          // downvote
          if (hasDownvoted) {
            // Remove downvote
            setHasDownvoted(false);
            setLocalDownvotes((prev) => prev - 1);
          } else {
            // Add downvote, remove upvote if exists
            setHasDownvoted(true);
            setLocalDownvotes((prev) => prev + 1);
            if (hasUpvoted) {
              setHasUpvoted(false);
              setLocalUpvotes((prev) => prev - 1);
            }
          }
        }

        // Trigger parent component refresh
        onVoteUpdate?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to vote. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex gap-3 p-4 border-b border-light-border dark:border-dark-border">
      {/* Avatar */}
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={comment.author.image} alt={comment.author.username} />
        <AvatarFallback className="bg-primary-100 text-primary-600 font-medium">
          {comment.author.username?.charAt(0).toUpperCase() ||
            comment.author.name?.charAt(0).toUpperCase() ||
            "U"}
        </AvatarFallback>
      </Avatar>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Author info and timestamp */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-dark-text dark:text-light-text">
            {comment.author.name || comment.author.username}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatTime(comment.createdAt)}
            {comment.editedAt && (
              <span className="ml-1 text-xs">(đã chỉnh sửa)</span>
            )}
          </span>
        </div>

        {/* Comment content */}
        <div className="text-dark-text dark:text-light-text mb-3">
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {comment.content}
          </p>
        </div>

        {/* Actions and engagement */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          {/* Upvotes/Downvotes */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote("upvote")}
              disabled={isVoting}
              className={`flex items-center gap-1 hover:text-blue-600 transition-colors disabled:opacity-50 ${
                hasUpvoted ? "text-blue-600" : ""
              }`}
            >
              <span
                className={`${hasUpvoted ? "scale-110" : ""} transition-transform`}
              >
                <BiSolidLike />
              </span>
              {localUpvotes > 0 && <span>{localUpvotes}</span>}
            </button>
            <button
              onClick={() => handleVote("downvote")}
              disabled={isVoting}
              className={`flex items-center gap-1 hover:text-red-600 transition-colors disabled:opacity-50 ${
                hasDownvoted ? "text-red-600" : ""
              }`}
            >
              <span
                className={`${hasDownvoted ? "scale-110" : ""} transition-transform`}
              >
                <BiSolidDislike />
              </span>
              {localDownvotes > 0 && <span>{localDownvotes}</span>}
            </button>
          </div>

          {/* Replies count */}
          {comment.replies && comment.replies.length > 0 && (
            <span className="text-xs">{comment.replies.length} phản hồi</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
