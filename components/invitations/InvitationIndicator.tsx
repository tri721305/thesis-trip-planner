"use client";

import { useEffect, useState } from "react";
import { getInvitationCount } from "@/lib/actions/invitation.action";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InvitationIndicatorProps {
  className?: string;
}

const InvitationIndicator = ({ className }: InvitationIndicatorProps) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const result = await getInvitationCount();
        if (result.success) {
          setCount(result.data.count);
        }
      } catch (error) {
        console.error("Error fetching invitation count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();

    // Thiết lập polling mỗi 5 phút để cập nhật số lời mời
    const intervalId = setInterval(fetchCount, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading || count === 0) {
    return (
      <Link
        href="/invitations"
        className={cn("relative flex items-center justify-center", className)}
        title="Invitations"
      >
        <Mail className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <Link
      href="/invitations"
      className={cn("relative flex items-center justify-center", className)}
      title={`${count} pending invitation${count !== 1 ? "s" : ""}`}
    >
      <Mail className="h-5 w-5" />
      <Badge
        className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center px-1 py-0 text-xs bg-red-500 text-white"
        variant="destructive"
      >
        {count > 99 ? "99+" : count}
      </Badge>
    </Link>
  );
};

export default InvitationIndicator;
