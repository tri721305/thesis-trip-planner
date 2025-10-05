"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Mail,
  User,
  Edit,
  Upload,
  X,
  MapIcon,
  BookOpen,
} from "lucide-react";
// import { useToast } from "@/components/ui/use-toast";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfileImage } from "@/lib/actions/user.action";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import AvatarPlaceholder from "@/components/ui/avatar-placeholder";
import TripPlaceholder from "@/components/ui/trip-placeholder";
import GuidePlaceholder from "@/components/ui/guide-placeholder";

interface ProfileContentProps {
  user: any;
  plans: any[];
  guides: any[];
  isCurrentUser: boolean;
  currentUserId: string;
}

const ProfileContent = ({
  user,
  plans,
  guides,
  isCurrentUser,
  currentUserId,
}: ProfileContentProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageClick = () => {
    if (isCurrentUser && !isUploading) {
      handleUploadImage();
    }
  };

  const handleUploadImage = () => {
    // Tạo một input file ẩn
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = false;

    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File quá lớn",
          description: "Vui lòng chọn ảnh có kích thước nhỏ hơn 5MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "File không hợp lệ",
          description: "Vui lòng chọn file ảnh (jpg, png, webp, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Show preview immediately while uploading
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      try {
        setIsUploading(true);

        // Gọi function upload ảnh
        const result = await updateUserProfileImage({
          userId: currentUserId,
          imageFile: file,
        });

        if (result.success && result.data) {
          // Cleanup preview URL
          URL.revokeObjectURL(previewUrl);

          toast({
            title: "Upload thành công!",
            description: "Ảnh đại diện đã được cập nhật",
            variant: "success",
          });

          // Force reload the page to show updated image everywhere
          window.location.reload();
        } else {
          // Revert to original image on failure
          setPreviewImage(null);
          URL.revokeObjectURL(previewUrl);

          toast({
            title: "Upload thất bại",
            description:
              result.error?.message ||
              "Không thể upload ảnh. Vui lòng thử lại!",
            variant: "destructive",
          });
          console.error("Upload failed:", result.error);
        }
      } catch (error) {
        // Revert to original image on error
        setPreviewImage(null);
        URL.revokeObjectURL(previewUrl);

        toast({
          title: "Có lỗi xảy ra",
          description:
            "Không thể upload ảnh. Vui lòng kiểm tra kết nối mạng và thử lại!",
          variant: "destructive",
        });
        console.error("Error uploading image:", error);
      } finally {
        setIsUploading(false);
      }
    };

    // Trigger file picker
    input.click();
  };

  // We no longer need cancelImageUpload since we're uploading immediately

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Sidebar */}
        <div className="w-full md:w-1/3">
          <Card className="p-6">
            <div className="flex flex-col items-center">
              {/* Profile Image */}
              <div className="relative mb-4">
                <div
                  className={`w-32 h-32 rounded-full overflow-hidden relative ${isCurrentUser && !isUploading ? "cursor-pointer" : ""}`}
                  onClick={isUploading ? undefined : handleImageClick}
                >
                  {isUploading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {previewImage || user.image ? (
                    <Image
                      src={previewImage || user.image}
                      alt={user.name || "User"}
                      fill
                      className={`object-cover ${isUploading ? "opacity-60" : ""}`}
                      sizes="(max-width: 128px) 100vw, 128px"
                    />
                  ) : (
                    <AvatarPlaceholder size={128} className="h-full w-full" />
                  )}
                  {isCurrentUser && !isUploading && !previewImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Edit className="text-white" size={24} />
                    </div>
                  )}
                </div>
              </div>

              {/* Loading indicator while uploading */}
              {isUploading && (
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-blue-500 animate-spin mr-2"></div>
                    <span className="text-sm text-muted-foreground">
                      Uploading...
                    </span>
                  </div>
                </div>
              )}

              {/* User Name */}
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <p className="text-muted-foreground mb-4">@{user.username}</p>

              {/* User Info */}
              <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground" size={18} />
                  <span>
                    Member since{" "}
                    {formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>

                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="text-muted-foreground" size={18} />
                    <span>{user.email}</span>
                  </div>
                )}

                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground" size={18} />
                    <span>{user.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <MapIcon className="text-muted-foreground" size={18} />
                  <span>{plans.length} Trip Plans</span>
                </div>

                <div className="flex items-center gap-2">
                  <BookOpen className="text-muted-foreground" size={18} />
                  <span>{guides.length} Guides</span>
                </div>
              </div>

              {/* Edit Profile Button */}
              {isCurrentUser && (
                <Button className="w-full mt-6">Edit Profile</Button>
              )}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs defaultValue="plans">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="plans">Trip Plans</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
            </TabsList>

            {/* Trip Plans Tab */}
            <TabsContent value="plans">
              <h3 className="text-xl font-bold mb-4">My Trip Plans</h3>
              {plans.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {plans.map((plan) => (
                    <Card
                      key={plan._id}
                      className="p-4 hover:shadow-md transition-shadow"
                    >
                      <Link href={`/planner/${plan._id}`} className="block">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 relative rounded-md overflow-hidden">
                            {plan.image ? (
                              <Image
                                src={plan.image}
                                alt={plan.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 96px) 100vw, 96px"
                              />
                            ) : (
                              <TripPlaceholder
                                width={96}
                                height={96}
                                className="h-full w-full"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">
                              {plan.title}
                            </h4>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin size={14} className="mr-1" />
                              <span>
                                {plan.destination?.name ||
                                  "Unknown destination"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Calendar size={14} className="mr-1" />
                              <span>
                                {new Date(plan.startDate).toLocaleDateString()}{" "}
                                - {new Date(plan.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="mt-2 text-sm">
                              <span
                                className={`px-2 py-0.5 rounded-full ${
                                  plan.state === "planning"
                                    ? "bg-blue-100 text-blue-800"
                                    : plan.state === "ongoing"
                                      ? "bg-green-100 text-green-800"
                                      : plan.state === "completed"
                                        ? "bg-gray-100 text-gray-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                              >
                                {plan.state.charAt(0).toUpperCase() +
                                  plan.state.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-muted-foreground">No trip plans found</p>
                  {isCurrentUser && (
                    <Button className="mt-4" asChild>
                      <Link href="/create-planner">Create a new trip plan</Link>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Guides Tab */}
            <TabsContent value="guides">
              <h3 className="text-xl font-bold mb-4">My Guides</h3>
              {guides.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {guides.map((guide) => (
                    <Card
                      key={guide._id}
                      className="p-4 hover:shadow-md transition-shadow"
                    >
                      <Link href={`/guide/${guide._id}`} className="block">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 relative rounded-md overflow-hidden">
                            {guide.image ? (
                              <Image
                                src={guide.image}
                                alt={guide.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 96px) 100vw, 96px"
                              />
                            ) : (
                              <GuidePlaceholder
                                width={96}
                                height={96}
                                className="h-full w-full"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">
                              {guide.title}
                            </h4>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <MapPin size={14} className="mr-1" />
                              <span>
                                {guide.destination?.name ||
                                  "Unknown destination"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Calendar size={14} className="mr-1" />
                              <span>
                                Created{" "}
                                {formatDistanceToNow(
                                  new Date(guide.createdAt),
                                  { addSuffix: true, locale: vi }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-muted-foreground">No guides found</p>
                  {isCurrentUser && (
                    <Button className="mt-4" asChild>
                      <Link href="/create-guide">Create a new guide</Link>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;
