import { ILodging } from "@/database/blog.model";
import { NextResponse } from "next/server";

declare global {
  interface Tag {
    _id: string;
    name: string;
  }

  interface Author {
    _id: string;
    name: string;
    image: string;
  }

  interface Blog {
    _id: string;
    title: string;
    description: string;
    note: string;
    tags: Types.ObjectId[];
    views: number;
    upvotes: number;
    downvotes: number;
    comments: number;
    author: Types.ObjectId;
    lodging: ILodging[];
  }
  interface Question {
    _id: string;
    title: string;
    tags: Tag[];
    author: Author;
    createdAt: Date;
    upvotes: number;
    answers: number;
    views: number;
    createdAt: Date;
  }

  interface Guide {
    _id: string;
    title: string;
    content: string;
    tags: Tag[];
    author: Author;
    createdAt: Date;
    upvotes: number;
    downvotes: number;
    answers: number;
    views: number;
    createdAt: Date;
  }

  interface CreateGuideParams {
    title: string;
    content: string;
    tags: string[];
    images1?: File[];
  }

  interface AuthCredentials {
    name: string;
    username: string;
    email: string;
    password: string;
  }

  type ActionResponse<T = null> = {
    success: boolean;
    data?: T;
    error?: {
      message: string;
      details?: Record<string, string[]>;
    };
    status?: number;
  };

  type SuccessResponse<T = null> = ActionResponse<T> & {
    success: true;
  };

  type ErrorResponse = ActionResponse<undefined> & {
    success: false;
  };

  type APIErrorResponse = NextResponse<ErrorResponse>;
  type APIResponse<T = null> = NextResponse<SuccessResponse<T>> | ErrorResponse;

  interface RouteParams {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string>>;
  }

  interface DialogAction {
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
    disabled?: boolean;
    loading?: boolean;
  }
  interface DialogActions {
    primary?: DialogAction;
    secondary?: DialogAction;
    cancel?: {
      label: string;
      onClick?: () => void;
    };
  }
  interface DialogData {
    title?: string;
    description?: string;
    content: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    showCloseButton?: boolean;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    actions?: DialogActions;
  }
  interface ReusableDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    data: DialogData;
  }

  // Test form GUIDE
  interface PlaceInfo {
    name: string;
    address: string;
    coordinates: [number, number];
    note: string;
    imgUrls: string[];
    duration?: string;
    cost?: {
      type: string;
      number: string;
    };
  }
  interface ItineraryItem {
    id: string;
    type: "place" | "note" | "checklist";
    position: number;
    data: {
      info: PlaceInfo | string | string[];
    };
  }

  interface DayRoute {
    id: string;
    type: "route";
    title: string;
    subheading: string;
    items: ItineraryItem[];
    autoFillDay?: boolean;
    optimizeRoute?: boolean;
    duration?: string;
    distance?: string;
  }

  interface ItineraryFormData {
    routes: DayRoute[];
  }

  interface PaginatedSearchParams {
    page?: number;
    pageSize?: number;
    query?: string;
    filter?: string;
  }
  interface Hotel {
    _id: string;
    offerId: string;
    name: string;
    images: object[];
    location: object;
    priceRates: object[];
    priceRate: object;
  }
}

export {};
