"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getPlannerByUserId,
  deletePlanner,
  // Các hàm chưa có, sẽ triển khai sau
} from "@/lib/actions/planner.action";

// Hàm tạm thời để tìm kiếm planners công khai
// Sẽ được thay thế bởi API thực tế sau này
const searchPublicPlanners = async ({
  searchQuery,
  limit = 10,
  offset = 0,
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  searchQuery: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
}) => {
  try {
    // Sử dụng API hiện có để lấy tất cả planners, sau đó lọc ở client-side
    const allPlannersResponse = await getPlannerByUserId({
      limit: 100, // Giữ giá trị cao để có đủ dữ liệu để lọc
      offset: 0,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    });

    if (!allPlannersResponse.success || !allPlannersResponse.data) {
      throw new Error(
        allPlannersResponse.error?.message || "Failed to fetch planners"
      );
    }

    // Lọc các planner có type là "public"
    let publicPlanners = allPlannersResponse.data.planners.filter(
      (planner) => planner.type === "public"
    );

    // Tìm kiếm theo từ khóa nếu có
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      publicPlanners = publicPlanners.filter(
        (planner) =>
          planner.title?.toLowerCase().includes(query) ||
          planner.destination?.name?.toLowerCase().includes(query) ||
          (planner.details?.some((detail: any) =>
            detail.notes?.toLowerCase().includes(query)
          ) ??
            false)
      );
    }

    // Phân trang kết quả
    const total = publicPlanners.length;
    const paginatedPlanners = publicPlanners.slice(offset, offset + limit);

    return {
      success: true,
      data: {
        planners: paginatedPlanners,
        total,
        hasMore: offset + limit < total,
      },
    };
  } catch (error) {
    console.error("Error searching public planners:", error);
    return {
      success: false,
      error: {
        message: "Failed to search public planners",
      },
    };
  }
};
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  MoreVertical,
  PenSquare,
  Loader2,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Globe,
} from "lucide-react";
import Link from "next/link";
import moment from "moment";
import { toast } from "@/hooks/use-toast";

const PlannersManagementPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [planners, setPlanners] = useState<any[]>([]);
  const [publicPlanners, setPublicPlanners] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [publicTotalCount, setPublicTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [publicPage, setPublicPage] = useState(1);
  const [state, setState] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publicError, setPublicError] = useState<string | null>(null);
  const [selectedPlanner, setSelectedPlanner] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const ITEMS_PER_PAGE = 3; // Changed from 10 to 3 for testing pagination

  const fetchPlanners = async (newPage = page, newState = state) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPlannerByUserId({
        limit: ITEMS_PER_PAGE,
        offset: (newPage - 1) * ITEMS_PER_PAGE,
        sortBy: "createdAt",
        sortOrder: "desc",
        state: (newState as any) || undefined,
        // Tạm thời gỡ bỏ includeShared vì API chưa hỗ trợ
        // Sẽ cập nhật trong API sau
      });

      if (response.success && response.data) {
        setPlanners(response.data.planners);
        setTotalCount(response.data.total);
      } else {
        setError(response.error?.message || "Failed to fetch planners");
        setPlanners([]);
      }
    } catch (err) {
      console.error("Error fetching planners:", err);
      setError("An unexpected error occurred");
      setPlanners([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách planners công khai
  const fetchPublicPlanners = async (
    newPage = publicPage,
    query = searchQuery
  ) => {
    setSearchLoading(true);
    setPublicError(null);
    try {
      const response = await searchPublicPlanners({
        searchQuery: query,
        limit: ITEMS_PER_PAGE,
        offset: (newPage - 1) * ITEMS_PER_PAGE,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (response.success && response.data) {
        setPublicPlanners(response.data.planners);
        setPublicTotalCount(response.data.total);
      } else {
        setPublicError(
          response.error?.message || "Failed to fetch public planners"
        );
        setPublicPlanners([]);
      }
    } catch (err) {
      console.error("Error fetching public planners:", err);
      setPublicError("An unexpected error occurred");
      setPublicPlanners([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanners();
    // Chỉ lấy public planners khi đang ở tab public
    if (activeTab === "public") {
      fetchPublicPlanners();
    }
  }, [activeTab]);

  const handleStateChange = (newState: string | null) => {
    setState(newState);
    setPage(1);
    fetchPlanners(1, newState);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPlanners(newPage, state);
  };

  const handlePublicPageChange = (newPage: number) => {
    setPublicPage(newPage);
    fetchPublicPlanners(newPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPublicPage(1);
    fetchPublicPlanners(1, searchQuery);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "public" && publicPlanners.length === 0) {
      fetchPublicPlanners();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlanner) return;

    setDeleteLoading(selectedPlanner._id);
    try {
      const response = await deletePlanner({
        plannerId: selectedPlanner._id,
      });

      if (response.success) {
        toast({
          title: "Planner deleted",
          description: `"${selectedPlanner.title}" has been deleted successfully.`,
        });
        // Refresh planners list
        fetchPlanners();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to delete planner",
          description:
            response.error?.message || "An error occurred during deletion.",
        });
      }
    } catch (err) {
      console.error("Error deleting planner:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while deleting the planner.",
      });
    } finally {
      setDeleteLoading(null);
      setSelectedPlanner(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeleteClick = (planner: any) => {
    setSelectedPlanner(planner);
    setIsDeleteDialogOpen(true);
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case "planning":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Planning
          </Badge>
        );
      case "ongoing":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Ongoing
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{state}</Badge>;
    }
  };

  const renderPagination = (isPublic = false) => {
    const count = isPublic ? publicTotalCount : totalCount;
    const currentPage = isPublic ? publicPage : page;
    const handleChange = isPublic ? handlePublicPageChange : handlePageChange;

    if (count <= ITEMS_PER_PAGE) return null;

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
    const showEllipsis = totalPages > 5;

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) handleChange(currentPage - 1);
              }}
              className={
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
            let pageNum;
            if (!showEllipsis || totalPages <= 5) {
              pageNum = index + 1;
            } else if (currentPage <= 3) {
              pageNum = index + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + index;
            } else {
              pageNum = currentPage - 2 + index;
            }

            return (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleChange(pageNum);
                  }}
                  isActive={pageNum === currentPage}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {showEllipsis && currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) handleChange(currentPage + 1);
              }}
              className={
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Your Travel Plans</h1>
          <p className="text-gray-500">Manage and organize your travel plans</p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/planners/create">
            <Plus className="mr-2 h-4 w-4" /> Create New Plan
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Filter Travel Plans</h2>
        <p className="text-gray-600 text-sm mb-4">
          Browse your own plans, shared plans, or explore public plans from
          others
        </p>
      </div>

      <Tabs
        defaultValue="all"
        className="w-full"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="all" onClick={() => handleStateChange(null)}>
            My Plans
          </TabsTrigger>
          <TabsTrigger
            value="planning"
            onClick={() => handleStateChange("planning")}
          >
            Planning
          </TabsTrigger>
          <TabsTrigger
            value="ongoing"
            onClick={() => handleStateChange("ongoing")}
          >
            Ongoing
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            onClick={() => handleStateChange("completed")}
          >
            Completed
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            onClick={() => handleStateChange("cancelled")}
          >
            Cancelled
          </TabsTrigger>
          <TabsTrigger value="public">Public Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <PlannersList
            planners={planners}
            loading={loading}
            error={error}
            getStateLabel={getStateLabel}
            onDelete={handleDeleteClick}
            deleteLoading={deleteLoading}
          />
          {renderPagination()}
        </TabsContent>

        {["planning", "ongoing", "completed", "cancelled"].map((tabState) => (
          <TabsContent key={tabState} value={tabState} className="mt-0">
            <PlannersList
              planners={state === tabState ? planners : []}
              loading={loading}
              error={error}
              getStateLabel={getStateLabel}
              onDelete={handleDeleteClick}
              deleteLoading={deleteLoading}
            />
            {state === tabState && renderPagination()}
          </TabsContent>
        ))}

        <TabsContent value="public" className="mt-0">
          <form onSubmit={handleSearch} className="mb-6 flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by title, destination, or place..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={searchLoading}>
              {searchLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </form>

          <PublicPlannersList
            planners={publicPlanners}
            loading={searchLoading}
            error={publicError}
            getStateLabel={getStateLabel}
          />
          {renderPagination(true)}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Travel Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPlanner?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={!!deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={!!deleteLoading}
            >
              {deleteLoading === selectedPlanner?._id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface PlannersListProps {
  planners: any[];
  loading: boolean;
  error: string | null;
  getStateLabel: (state: string) => React.ReactNode;
  onDelete: (planner: any) => void;
  deleteLoading: string | null;
}

const PlannersList = ({
  planners,
  loading,
  error,
  getStateLabel,
  onDelete,
  deleteLoading,
}: PlannersListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-xl">Loading travel plans...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-800">Error</h3>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  if (planners.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mb-4 text-gray-400">
          <MapPin className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold">No travel plans found</h3>
        <p className="text-gray-600 mt-2">
          Create your first travel plan to get started
        </p>
        <Button asChild className="mt-4">
          <Link href="/planners/create">
            <Plus className="mr-2 h-4 w-4" /> Create Plan
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {planners.map((planner) => (
        <Card key={planner._id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-[180px] h-[140px] md:h-auto bg-gray-100 relative shrink-0">
              {planner.image ? (
                <img
                  src={planner.image}
                  alt={planner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
              )}
            </div>

            <CardContent className="flex-1 p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{planner.title}</h3>
                    {planner.state && getStateLabel(planner.state)}
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {planner.destination?.name || "Unknown location"}
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/planners/${planner._id}`}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/planners/${planner._id}/edit`}>
                        <PenSquare className="h-4 w-4 mr-2" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => onDelete(planner)}
                      disabled={deleteLoading === planner._id}
                    >
                      {deleteLoading === planner._id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap gap-4 text-sm mt-2">
                {planner.startDate && planner.endDate && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    <span>
                      {moment(planner.startDate).format("MMM DD")} -{" "}
                      {moment(planner.endDate).format("MMM DD, YYYY")}
                    </span>
                  </div>
                )}

                {planner.tripmates && planner.tripmates.length > 0 && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-gray-500" />
                    <span>
                      {planner.tripmates.length}{" "}
                      {planner.tripmates.length === 1
                        ? "tripmate"
                        : "tripmates"}
                    </span>
                  </div>
                )}

                {planner.type && (
                  <div className="flex items-center">
                    <Badge
                      variant="secondary"
                      className="rounded-full px-2 py-0"
                    >
                      {planner.type}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex mt-4 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/planners/${planner._id}`}>View Plan</Link>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <Link href={`/planners/${planner._id}/edit`}>Edit Plan</Link>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Component to display public planners
interface PublicPlannersListProps {
  planners: any[];
  loading: boolean;
  error: string | null;
  getStateLabel: (state: string) => React.ReactNode;
}

const PublicPlannersList = ({
  planners,
  loading,
  error,
  getStateLabel,
}: PublicPlannersListProps) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-xl">Searching planners...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-800">Error</h3>
        <p className="text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  if (planners.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mb-4 text-gray-400">
          <Globe className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold">No public planners found</h3>
        <p className="text-gray-600 mt-2">
          Try a different search term or browse our featured planners
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {planners.map((planner) => (
        <Card key={planner._id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-[180px] h-[140px] md:h-auto bg-gray-100 relative shrink-0">
              {planner.image ? (
                <img
                  src={planner.image}
                  alt={planner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <MapPin className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>

            <CardContent className="flex-1 p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/planners/${planner._id}`}
                    className="hover:underline"
                  >
                    <h3 className="font-bold text-xl mb-1">{planner.title}</h3>
                  </Link>

                  {planner.author && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={planner.author.image || ""} />
                        <AvatarFallback>
                          {planner.author.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        Created by {planner.author.name || "Anonymous"}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {getStateLabel(planner.state)}
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800"
                    >
                      Public
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/planners/${planner._id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 text-sm mt-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {planner.startDate && planner.endDate
                      ? `${moment(planner.startDate).format(
                          "MMM D"
                        )} - ${moment(planner.endDate).format("MMM D, YYYY")}`
                      : "Dates not set"}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {planner.destination?.name || "Destination not set"}
                  </span>
                </div>
                {planner.tripmates && planner.tripmates.length > 0 && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{planner.tripmates.length} travelers</span>
                  </div>
                )}
              </div>
              {planner.details && (
                <div className="text-sm text-gray-500 mt-2">
                  {planner.details.length} days planned
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PlannersManagementPage;
