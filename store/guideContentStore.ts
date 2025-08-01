import { RefObject } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface GuideItem {
  type: "note" | "checklist" | "place";
  content?: string;
  items?: string[];
  name?: string;
  address?: string;
  [key: string]: any;
}
interface GuideSection {
  type: "route" | "list";
  name: string;
  data: GuideItem[];
}

interface GuideContentState {
  // State
  sections: GuideSection[];
  sectionRefs: Map<number, RefObject<HTMLDivElement>>; // Store refs by inde
  // Computed values
  routeCount: number;
  listCount: number;
  totalPlaces: number;
  totalItems: number;

  // Actions
  setSections: (sections: GuideSection[]) => void;
  updateSection: (index: number, section: GuideSection) => void;
  addSection: (section: GuideSection) => void;
  removeSection: (index: number) => void;

  // Refs
  setSectionRef: (index: number, ref: RefObject<HTMLDivElement>) => void;
  scrollToSection: (index: number) => void;

  // Computed getters
  getRoutes: () => GuideSection[];
  getLists: () => GuideSection[];
  getSectionsByType: (type: "route" | "list") => GuideSection[];
  getPlaceCount: () => number;
}

export const useGuideContentStore = create<GuideContentState>()(
  devtools(
    (set, get) => ({
      // Initial state
      sections: [],
      sectionRefs: new Map(),
      routeCount: 0,
      listCount: 0,
      totalPlaces: 0,
      totalItems: 0,

      // Actions
      setSections: (sections) => {
        const routes = sections.filter((s) => s.type === "route");
        const lists = sections.filter((s) => s.type === "list");
        const totalPlaces = sections.reduce(
          (acc, section) =>
            acc + section.data.filter((item) => item.type === "place").length,
          0
        );
        const totalItems = sections.reduce(
          (acc, section) => acc + section.data.length,
          0
        );

        set({
          sections,
          routeCount: routes.length,
          listCount: lists.length,
          totalPlaces,
          totalItems,
        });
      },

      setSectionRef: (index, ref) => {
        const sectionRefs = new Map(get().sectionRefs);
        sectionRefs.set(index, ref);
        set({ sectionRefs });
      },

      scrollToSection: (index) => {
        const { sectionRefs } = get();
        const ref = sectionRefs.get(index);

        if (ref?.current) {
          ref.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
          });

          // Optional: Add highlight effect
          ref.current.style.transition = "all 0.3s ease";
          // ref.current.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
          ref.current.style.borderLeft = "4px solid #ffb57f";
          ref.current.style.paddingLeft = "8px";
          setTimeout(() => {
            ref.current!.style.backgroundColor = "";
            ref.current!.style.borderLeft = "";
          }, 1000);
        }
      },

      updateSection: (index, section) => {
        const sections = [...get().sections];
        sections[index] = section;
        get().setSections(sections);
      },

      addSection: (section) => {
        const sections = [...get().sections, section];
        get().setSections(sections);
      },

      removeSection: (index) => {
        const sections = get().sections.filter((_, i) => i !== index);
        get().setSections(sections);
      },

      // Computed getters
      getRoutes: () => get().sections.filter((s) => s.type === "route"),
      getLists: () => get().sections.filter((s) => s.type === "list"),
      getSectionsByType: (type) =>
        get().sections.filter((s) => s.type === type),
      getPlaceCount: () => get().totalPlaces,
    }),
    {
      name: "guide-content-store", // DevTools name
    }
  )
);
