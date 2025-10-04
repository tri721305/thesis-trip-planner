"use server";

import Invitation from "@/models/invitation.model";
import Planner from "@/database/plan.model";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongoose";
import { ActionResponse } from "@/types/global";
import { getCurrentUser } from "@/lib/auth";

/**
 * Gửi lời mời cho người dùng tham gia planner
 */
export async function sendPlannerInvitation({
  plannerId,
  userId,
  message,
}: {
  plannerId: string;
  userId: string;
  message?: string;
}): Promise<ActionResponse<{ success: boolean }>> {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: { message: "Unauthorized" },
      };
    }

    // Kiểm tra planner có tồn tại không
    const planner = await Planner.findById(plannerId);
    if (!planner) {
      return {
        success: false,
        error: { message: "Planner not found" },
      };
    }

    // Kiểm tra người dùng có quyền mời không
    if (planner.author.toString() !== currentUser._id.toString()) {
      return {
        success: false,
        error: { message: "Only the planner owner can send invitations" },
      };
    }

    // Kiểm tra người dùng được mời có tồn tại không
    const invitee = await User.findById(userId);
    if (!invitee) {
      return {
        success: false,
        error: { message: "User not found" },
      };
    }

    // Tạo lời mời mới
    const invitation = new Invitation({
      plannerId,
      inviterId: currentUser._id,
      inviteeId: userId,
      status: "pending",
      message,
    });

    // Lưu lời mời
    await invitation.save();

    // Thêm thông báo trong ứng dụng cho người được mời
    // (Phần này sẽ được triển khai trong phần notifications)

    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error sending invitation:", error);
    // Xử lý trường hợp duplicate invitation
    if (error.code === 11000) {
      return {
        success: false,
        error: { message: "An invitation has already been sent to this user" },
      };
    }
    return {
      success: false,
      error: { message: error.message || "Failed to send invitation" },
    };
  }
}

/**
 * Phản hồi lời mời (chấp nhận/từ chối)
 */
export async function respondToInvitation({
  invitationId,
  accept,
}: {
  invitationId: string;
  accept: boolean;
}): Promise<ActionResponse<{ success: boolean }>> {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: { message: "Unauthorized" },
      };
    }

    // Tìm lời mời
    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return {
        success: false,
        error: { message: "Invitation not found" },
      };
    }

    // Kiểm tra xem lời mời có phải cho user hiện tại không
    if (invitation.inviteeId.toString() !== currentUser._id.toString()) {
      return {
        success: false,
        error: { message: "This invitation is not for you" },
      };
    }

    // Cập nhật trạng thái lời mời
    invitation.status = accept ? "accepted" : "declined";
    invitation.respondedAt = new Date();

    await invitation.save();

    // Nếu chấp nhận, thêm người dùng vào tripmates của planner
    if (accept) {
      await Planner.findByIdAndUpdate(invitation.plannerId, {
        $addToSet: {
          tripmates: {
            userId: currentUser._id,
            name: currentUser.name,
            email: currentUser.email,
            image: currentUser.image,
          },
        },
      });
    }

    revalidatePath("/invitations");
    revalidatePath(`/planners/${invitation.plannerId}`);

    return { success: true, data: { success: true } };
  } catch (error: any) {
    console.error("Error responding to invitation:", error);
    return {
      success: false,
      error: { message: error.message || "Failed to respond to invitation" },
    };
  }
}

/**
 * Lấy danh sách lời mời cho người dùng hiện tại
 */
interface FormattedInvitation {
  _id: string;
  plannerId: string;
  plannerTitle: string;
  plannerDescription?: string;
  startDate: string;
  endDate: string;
  inviterId: string;
  inviterName: string;
  inviterUsername?: string;
  inviterImage?: string;
  message?: string;
  createdAt: string;
}

export async function getUserInvitations(): Promise<
  ActionResponse<{
    invitations: FormattedInvitation[];
  }>
> {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: { message: "Unauthorized" },
      };
    }

    // Lấy danh sách lời mời chưa phản hồi dành cho người dùng hiện tại
    const invitations = await Invitation.find({
      inviteeId: currentUser._id,
      status: "pending",
    })
      .populate({
        path: "plannerId",
        select: "title description startDate endDate author",
        populate: { path: "author", select: "name username image" },
      })
      .populate("inviterId", "name username image");

    // Định dạng lại kết quả để dễ sử dụng ở client, chuyển ObjectId thành string
    const formattedInvitations = invitations.map((inv) => ({
      _id: inv._id.toString(),
      plannerId: inv.plannerId._id.toString(),
      plannerTitle: inv.plannerId.title,
      plannerDescription: inv.plannerId.description,
      startDate: inv.plannerId.startDate.toISOString(),
      endDate: inv.plannerId.endDate.toISOString(),
      inviterId: inv.inviterId._id.toString(),
      inviterName: inv.inviterId.name,
      inviterUsername: inv.inviterId.username,
      inviterImage: inv.inviterId.image,
      message: inv.message,
      createdAt: inv.createdAt.toISOString(),
    }));

    return { success: true, data: { invitations: formattedInvitations } };
  } catch (error: any) {
    console.error("Error getting invitations:", error);
    return {
      success: false,
      error: { message: error.message || "Failed to get invitations" },
    };
  }
}

/**
 * Lấy số lượng lời mời chưa phản hồi
 */
export async function getInvitationCount(): Promise<
  ActionResponse<{ count: number }>
> {
  try {
    await dbConnect();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: true, data: { count: 0 } };
    }

    const count = await Invitation.countDocuments({
      inviteeId: currentUser._id,
      status: "pending",
    });

    return { success: true, data: { count } };
  } catch (error: any) {
    console.error("Error counting invitations:", error);
    return { success: true, data: { count: 0 } };
  }
}
