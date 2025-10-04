"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getGuideByUserId,
  deleteGuide,
  searchPublicGuides,
} from "@/lib/actions/guide.action";
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
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  MoreVertical,
  PenSquare,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Globe,
  User,
} from "lucide-react";
import Link from "next/link";
import moment from "moment";
import { toast } from "@/hooks/use-toast";
// import { toast } from "@/components/ui/use-toast";
const GuidesManagementPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [guides, setGuides] = useState<any[]>([]);
  const [publicGuides, setPublicGuides] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [publicTotalCount, setPublicTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [publicPage, setPublicPage] = useState(1);
  const [state, setState] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publicError, setPublicError] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const ITEMS_PER_PAGE = 3; // Changed from 10 to 3 for testing pagination

  const fetchGuides = async (
    newPage = page,
    newState = state,
    query = searchQuery
  ) => {
    setLoading(true);
    setError(null);
    try {
      // First, get all guides (or a larger number) to filter client-side
      const response = await getGuideByUserId({
        limit: query ? 100 : ITEMS_PER_PAGE, // Get more if we're searching
        page: query ? 1 : newPage, // Start from first page when searching
        sortBy: "createdAt",
        sortOrder: "desc",
        state: (newState as any) || undefined,
      });

      if (response.success && response.data) {
        let filteredGuides = response.data.guides;

        // If there's a search query, filter guides
        if (query) {
          const searchTerm = query.toLowerCase().trim();
          filteredGuides = filteredGuides.filter(
            (guide: any) =>
              guide.title?.toLowerCase().includes(searchTerm) ||
              guide.destination?.name?.toLowerCase().includes(searchTerm) ||
              guide.description?.toLowerCase().includes(searchTerm) ||
              (guide.content &&
                typeof guide.content === "string" &&
                guide.content.toLowerCase().includes(searchTerm))
          );

          // Manual pagination for filtered results
          const totalFilteredCount = filteredGuides.length;
          const start = (newPage - 1) * ITEMS_PER_PAGE;
          filteredGuides = filteredGuides.slice(start, start + ITEMS_PER_PAGE);

          setTotalCount(totalFilteredCount);
        } else {
          // No search query, use API pagination
          setTotalCount(response.data.totalCount);
        }

        setGuides(filteredGuides);
      } else {
        setError(response.error?.message || "Failed to fetch guides");
        setGuides([]);
      }
    } catch (err) {
      console.error("Error fetching guides:", err);
      setError("An unexpected error occurred");
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicGuides = async (
    newPage = publicPage,
    query = searchQuery
  ) => {
    setSearchLoading(true);
    setPublicError(null);
    try {
      const response = await searchPublicGuides({
        searchQuery: query,
        limit: ITEMS_PER_PAGE,
        page: newPage,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (response.success && response.data) {
        setPublicGuides(response.data.guides);
        setPublicTotalCount(response.data.totalCount);
      } else {
        setPublicError(
          response.error?.message || "Failed to fetch public guides"
        );
        setPublicGuides([]);
      }
    } catch (err) {
      console.error("Error fetching public guides:", err);
      setPublicError("An unexpected error occurred");
      setPublicGuides([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
    // Only fetch public guides if we're on the public tab
    if (activeTab === "public") {
      fetchPublicGuides();
    }
  }, [activeTab]);

  const handleStateChange = (newState: string | null) => {
    setState(newState);
    setPage(1);
    fetchGuides(1, newState);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchGuides(newPage, state, searchQuery);
  };

  const handlePublicPageChange = (newPage: number) => {
    setPublicPage(newPage);
    fetchPublicGuides(newPage);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPublicPage(1);
    fetchPublicGuides(1, searchQuery);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchQuery(""); // Clear search query when changing tabs

    if (value === "public" && publicGuides.length === 0) {
      fetchPublicGuides();
    } else if (
      value === "all" ||
      ["planning", "ongoing", "completed", "cancelled"].includes(value)
    ) {
      // Reset page to 1 when switching between tabs
      setPage(1);
      fetchGuides(1, value === "all" ? null : value);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGuide) return;

    setDeleteLoading(selectedGuide._id);
    try {
      const response = await deleteGuide({
        guideId: selectedGuide._id,
      });

      if (response.success) {
        toast({
          title: "Guide deleted",
          description: `"${selectedGuide.title}" has been deleted successfully.`,
        });
        // Refresh guides list
        fetchGuides();
      } else {
        toast({
          variant: "destructive",
          title: "Failed to delete guide",
          description:
            response.error?.message || "An error occurred during deletion.",
        });
      }
    } catch (err) {
      console.error("Error deleting guide:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while deleting the guide.",
      });
    } finally {
      setDeleteLoading(null);
      setSelectedGuide(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeleteClick = (guide: any) => {
    setSelectedGuide(guide);
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
          <h1 className="text-3xl font-bold mb-1">Travel Guides</h1>
          <p className="text-gray-500">
            Manage your guides and discover public guides from other travelers
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/guides/create">
            <Plus className="mr-2 h-4 w-4" /> Create New Guide
          </Link>
        </Button>
      </div>

      <Tabs
        defaultValue="all"
        className="w-full"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="all" onClick={() => handleStateChange(null)}>
            <User className="h-4 w-4 mr-2" /> My Guides
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
          <TabsTrigger value="public">
            <Globe className="h-4 w-4 mr-2" /> Public Guides
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {/* Search bar for my guides */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Search My Guides</h2>
            <p className="text-gray-600 text-sm mb-3">
              Find your guides by title, destination, or content
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1); // Reset to first page when searching
                fetchGuides(1, state, searchQuery);
              }}
              className="flex gap-2"
            >
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search my guides by title or destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </form>
          </div>

          <GuidesList
            guides={guides}
            loading={loading}
            error={error}
            getStateLabel={getStateLabel}
            onDelete={handleDeleteClick}
            deleteLoading={deleteLoading}
          />
          {renderPagination(false)}
        </TabsContent>

        {["planning", "ongoing", "completed", "cancelled"].map((tabState) => (
          <TabsContent key={tabState} value={tabState} className="mt-0">
            <GuidesList
              guides={state === tabState ? guides : []}
              loading={loading}
              error={error}
              getStateLabel={getStateLabel}
              onDelete={handleDeleteClick}
              deleteLoading={deleteLoading}
            />
            {state === tabState && renderPagination(false)}
          </TabsContent>
        ))}

        <TabsContent value="public" className="mt-0">
          {/* Enhanced search bar for public guides */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Search Public Guides</h2>
            <p className="text-gray-600 text-sm mb-3">
              Find travel guides by guide name, destination, or content
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by title, destination, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
          </div>

          <PublicGuidesList
            guides={publicGuides}
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
            <DialogTitle>Delete Guide</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedGuide?.title}"? This
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
              {deleteLoading === selectedGuide?._id ? (
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

interface GuidesListProps {
  guides: any[];
  loading: boolean;
  error: string | null;
  getStateLabel: (state: string) => React.ReactNode;
  onDelete: (guide: any) => void;
  deleteLoading: string | null;
}

const GuidesList = ({
  guides,
  loading,
  error,
  getStateLabel,
  onDelete,
  deleteLoading,
}: GuidesListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-xl">Loading guides...</span>
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

  if (guides.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mb-4 text-gray-400">
          <MapPin className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold">No guides found</h3>
        <p className="text-gray-600 mt-2">
          Create your first guide to get started
        </p>
        <Button asChild className="mt-4">
          <Link href="/guides/create">
            <Plus className="mr-2 h-4 w-4" /> Create Guide
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {guides.map((guide) => (
        <Card key={guide._id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-[180px] h-[140px] md:h-auto bg-gray-100 relative shrink-0">
              {guide.image ? (
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
              )}
            </div>

            <CardContent className="flex-1 p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{guide.title}</h3>
                    {guide.state && getStateLabel(guide.state)}
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{guide.destination?.name || "Unknown location"}</span>
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
                      <Link href={`/guides/${guide._id}`}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/guides/${guide._id}/edit`}>
                        <PenSquare className="h-4 w-4 mr-2" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => onDelete(guide)}
                      disabled={deleteLoading === guide._id}
                    >
                      {deleteLoading === guide._id ? (
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
                {guide.startDate && guide.endDate && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    <span>
                      {moment(guide.startDate).format("MMM DD")} -{" "}
                      {moment(guide.endDate).format("MMM DD, YYYY")}
                    </span>
                  </div>
                )}

                {guide.views !== undefined && (
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1 text-gray-500" />
                    <span>
                      {guide.views} {guide.views === 1 ? "view" : "views"}
                    </span>
                  </div>
                )}

                {guide.upvotes !== undefined && (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-gray-500" />
                    <span>
                      {guide.upvotes}{" "}
                      {guide.upvotes === 1 ? "upvote" : "upvotes"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex mt-4 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/guides/${guide._id}`}>View Guide</Link>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <Link href={`/guides/${guide._id}/edit`}>Edit Guide</Link>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Component to display public guides
interface PublicGuidesListProps {
  guides: any[];
  loading: boolean;
  error: string | null;
  getStateLabel: (state: string) => React.ReactNode;
}

const PublicGuidesList = ({
  guides,
  loading,
  error,
  getStateLabel,
}: PublicGuidesListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-xl">Searching guides...</span>
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

  if (guides.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mb-4 text-gray-400">
          <Globe className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold">No public guides found</h3>
        <p className="text-gray-600 mt-2">
          Try a different search term or browse our featured guides
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {guides.map((guide) => (
        <Card key={guide._id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-[180px] h-[140px] md:h-auto bg-gray-100 relative shrink-0">
              {guide.image ? (
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
              )}
            </div>

            <CardContent className="flex-1 p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{guide.title}</h3>
                    {guide.state && getStateLabel(guide.state)}
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{guide.destination?.name || "Unknown location"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm mt-2">
                {guide.startDate && guide.endDate && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    <span>
                      {moment(guide.startDate).format("MMM DD")} -{" "}
                      {moment(guide.endDate).format("MMM DD, YYYY")}
                    </span>
                  </div>
                )}

                {guide.views !== undefined && (
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1 text-gray-500" />
                    <span>
                      {guide.views} {guide.views === 1 ? "view" : "views"}
                    </span>
                  </div>
                )}

                {guide.upvotes !== undefined && (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1 text-gray-500" />
                    <span>
                      {guide.upvotes}{" "}
                      {guide.upvotes === 1 ? "upvote" : "upvotes"}
                    </span>
                  </div>
                )}

                {/* Show author if available */}
                {guide.author && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-gray-500" />
                    <span>
                      By{" "}
                      {guide.author.name ||
                        guide.author.username ||
                        "Anonymous"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex mt-4 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/guides/view/${guide._id}`}>View Guide</Link>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default GuidesManagementPage;
