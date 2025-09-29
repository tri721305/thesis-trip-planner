import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import CommentItem from "./CommentItem";
import { getComments } from "@/lib/actions/comment.action";
import { useToast } from "@/hooks/use-toast";

interface CommentsListProps {
  guideId: string;
  refreshTrigger?: number; // Prop để trigger refresh khi có comment mới
}

interface CommentData {
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
}

const CommentsList = ({ guideId, refreshTrigger }: CommentsListProps) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"latest" | "oldest" | "popular">(
    "latest"
  );
  const { toast } = useToast();

  // Load comments function
  const loadComments = async (
    pageNum: number = 1,
    resetList: boolean = true
  ) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await getComments({
        guideId,
        page: pageNum,
        pageSize: 10,
        filter,
      });

      if (result.success && result.data) {
        const newComments = result.data.comments as unknown as CommentData[];

        if (resetList) {
          setComments(newComments);
        } else {
          setComments((prev) => [...prev, ...newComments]);
        }

        setHasMore(result.data.isNext);
        setPage(pageNum);
      } else {
        toast({
          title: "Lỗi tải comments",
          description: result.error?.message || "Không thể tải comments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load comments when component mounts or filter changes
  useEffect(() => {
    if (guideId) {
      loadComments(1, true);
    }
  }, [guideId, filter]);

  // Refresh comments when new comment is added
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && guideId) {
      loadComments(1, true);
    }
  }, [refreshTrigger]);

  // Load more comments
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadComments(page + 1, false);
    }
  };

  // Change filter
  const handleFilterChange = (newFilter: "latest" | "oldest" | "popular") => {
    if (newFilter !== filter) {
      setFilter(newFilter);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Đang tải comments...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Filter buttons */}
      <div className="flex gap-2 mb-4 border-b border-light-border dark:border-dark-border pb-3">
        <Button
          variant={filter === "latest" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("latest")}
        >
          Newest
        </Button>
        <Button
          variant={filter === "popular" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("popular")}
        >
          Popular
        </Button>
        <Button
          variant={filter === "oldest" ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilterChange("oldest")}
        >
          Oldest
        </Button>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Chưa có comment nào. Hãy là người đầu tiên bình luận!</p>
        </div>
      ) : (
        <div className="space-y-0">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onVoteUpdate={() => loadComments(1, true)}
            />
          ))}
        </div>
      )}

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang tải...
              </>
            ) : (
              "Xem thêm comments"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentsList;
