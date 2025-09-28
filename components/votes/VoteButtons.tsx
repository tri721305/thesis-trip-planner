"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { createVote, hasVoted } from "@/lib/actions/vote.action";
import { toast } from "@/hooks/use-toast";

interface VoteButtonsProps {
  targetId: string;
  targetType: "guide" | "comment";
  upvotes?: number;
  downvotes?: number;
  className?: string;
}

export default function VoteButtons({
  targetId,
  targetType,
  upvotes = 0,
  downvotes = 0,
  className = "",
}: VoteButtonsProps) {
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes);
  const [loading, setLoading] = useState(false);

  // Check if user has already voted
  useEffect(() => {
    const checkVoteStatus = async () => {
      try {
        const result = await hasVoted({ targetId, targetType });
        if (result.success && result.data) {
          setHasUpvoted(result.data.hasUpvoted);
          setHasDownvoted(result.data.hasDownvoted);
        }
      } catch (error) {
        console.error("Error checking vote status:", error);
      }
    };

    checkVoteStatus();
  }, [targetId, targetType]);

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (loading) return;

    console.log("🗳️ Vote attempt START:", {
      targetId,
      targetType,
      voteType,
      currentStates: {
        hasUpvoted,
        hasDownvoted,
        currentUpvotes,
        currentDownvotes,
      },
      timestamp: new Date().toISOString(),
    });

    setLoading(true);
    try {
      console.log("🗳️ About to call createVote function");

      const result = await createVote({
        targetId,
        targetType,
        voteType,
      });

      console.log("🗳️ createVote returned:", {
        result,
        success: result?.success,
        error: result?.error,
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : "null",
        fullResult: JSON.stringify(result, null, 2),
      });

      if (result.success) {
        console.log("✅ Vote successful, updating UI state");

        if (voteType === "upvote") {
          if (hasUpvoted) {
            console.log("📉 Removing upvote");
            // Remove upvote
            setHasUpvoted(false);
            setCurrentUpvotes((prev) => prev - 1);
          } else {
            console.log("📈 Adding upvote");
            // Add upvote
            setHasUpvoted(true);
            setCurrentUpvotes((prev) => prev + 1);
            // If was downvoted, remove downvote
            if (hasDownvoted) {
              console.log("📉 Also removing downvote");
              setHasDownvoted(false);
              setCurrentDownvotes((prev) => prev - 1);
            }
          }
        } else {
          if (hasDownvoted) {
            console.log("📈 Removing downvote");
            // Remove downvote
            setHasDownvoted(false);
            setCurrentDownvotes((prev) => prev - 1);
          } else {
            console.log("📉 Adding downvote");
            // Add downvote
            setHasDownvoted(true);
            setCurrentDownvotes((prev) => prev + 1);
            // If was upvoted, remove upvote
            if (hasUpvoted) {
              console.log("📈 Also removing upvote");
              setHasUpvoted(false);
              setCurrentUpvotes((prev) => prev - 1);
            }
          }
        }

        toast({
          title: "Vote recorded",
          description: `Your ${voteType} has been recorded.`,
        });
      } else {
        console.error("❌ Vote failed:", {
          result,
          error: result?.error,
          message: result?.error?.message,
        });
        toast({
          title: "Error",
          description:
            result.error?.message || "Failed to record vote. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Vote error caught in component:", {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        errorName: error instanceof Error ? error.name : typeof error,
      });
      toast({
        title: "Error",
        description: `An error occurred while voting: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log("🔚 Vote attempt finished");
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Upvote Button */}
      <Button
        variant={hasUpvoted ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote("upvote")}
        disabled={loading}
        className={`flex items-center gap-1 ${
          hasUpvoted
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "hover:bg-green-50 hover:border-green-300 hover:text-green-600"
        }`}
      >
        <ChevronUp className="w-4 h-4" />
        <span className="text-sm font-medium">{currentUpvotes}</span>
      </Button>

      {/* Downvote Button */}
      <Button
        variant={hasDownvoted ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote("downvote")}
        disabled={loading}
        className={`flex items-center gap-1 ${
          hasDownvoted
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "hover:bg-red-50 hover:border-red-300 hover:text-red-600"
        }`}
      >
        <ChevronDown className="w-4 h-4" />
        <span className="text-sm font-medium">{currentDownvotes}</span>
      </Button>

      {/* Net Score */}
      {/* <div className="ml-2 text-sm text-gray-500">
        Score: {currentUpvotes - currentDownvotes}
      </div> */}
    </div>
  );
}
