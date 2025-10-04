"use client";

import { useEffect, useState } from "react";
import { getInvitationCount } from "@/lib/actions/invitation.action";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function InvitationBadge() {
  const [invitationCount, setInvitationCount] = useState(0);

  useEffect(() => {
    const fetchInvitationCount = async () => {
      try {
        const result = await getInvitationCount();
        if (result.success) {
          setInvitationCount(result.data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching invitation count:", error);
      }
    };

    fetchInvitationCount();

    // Kiểm tra lời mời định kỳ
    const interval = setInterval(fetchInvitationCount, 60000); // mỗi phút
    return () => clearInterval(interval);
  }, []);

  if (invitationCount === 0) {
    return (
      <Link href="/invitations" className="relative">
        <Bell className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <Link href="/invitations" className="relative">
      <Bell className="h-5 w-5" />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
        {invitationCount > 9 ? "9+" : invitationCount}
      </span>
    </Link>
  );
}
