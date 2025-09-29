import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { createComment } from "@/lib/actions/comment.action";
import CommentsList from "./CommentsList";

interface CommentsSectionProps {
  guideId: string;
  currentUserImage?: string;
}

const CommentsSection = ({
  guideId,
  currentUserImage,
}: CommentsSectionProps) => {
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      toast({
        title: "Comment trống",
        description: "Vui lòng nhập nội dung comment trước khi gửi.",
        variant: "destructive",
      });
      return;
    }

    if (!guideId) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy ID của guide. Vui lòng refresh trang.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingComment(true);

    try {
      const result = await createComment({
        content: commentText.trim(),
        guideId: guideId,
      });

      if (result.success) {
        toast({
          title: "Comment has been added",
          description: "Your comment has been posted successfully.",
          variant: "default",
        });

        // Clear the comment input
        setCommentText("");

        // Trigger refresh of comments list
        setRefreshTrigger((prev) => prev + 1);

        console.log("Comment created:", result.data);
      } else {
        toast({
          title: "Không thể thêm comment",
          description:
            result.error?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi không mong muốn xảy ra. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-dark-card rounded-lg ">
      {/* Header */}
      {/* <div className="px-6 py-4 border-b border-light-border dark:border-dark-border">
        <h3 className="text-lg font-semibold text-dark-text dark:text-light-text">
          Bình luận
        </h3>
      </div> */}

      {/* Add Comment Form */}
      <div className="p-6 ">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={currentUserImage} />
            <AvatarFallback className="bg-primary-100 text-primary-600 font-medium">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Input
              className="h-10 flex-1 bg-light-background dark:bg-dark-background border-light-border dark:border-dark-border focus:border-primary-500 focus:ring-primary-500"
              placeholder="Comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
              disabled={isSubmittingComment}
            />
            <Button
              className="w-10 h-10 p-0 bg-primary-500 hover:bg-primary-600"
              size={"icon"}
              onClick={handleSubmitComment}
              disabled={isSubmittingComment || !commentText.trim()}
            >
              {isSubmittingComment ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <FaPlus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="pb-4">
        <CommentsList guideId={guideId} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default CommentsSection;
