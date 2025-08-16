import { RefObject } from "react";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface PlannerSection {
  id: string;
  name: string;
  type: "note" | "generalTips" | "lodging" | "itinerary" | "detail";
  index?: number; // For detail sections
}

interface PlannerContentState {
  // State
  sections: PlannerSection[];
  sectionRefs: Map<string, RefObject<HTMLDivElement>>; // Store refs by section id

  // Computed values
  detailCount: number;
  totalSections: number;

  // Actions
  setSections: (sections: PlannerSection[]) => void;
  updateSection: (id: string, section: PlannerSection) => void;
  addSection: (section: PlannerSection) => void;
  removeSection: (id: string) => void;

  // Refs
  setSectionRef: (id: string, ref: RefObject<HTMLDivElement>) => void;
  scrollToSection: (id: string) => void;

  // Computed getters
  getDetailSections: () => PlannerSection[];
  getMainSections: () => PlannerSection[];
  getSectionById: (id: string) => PlannerSection | undefined;
}

export const usePlannerContentStore = create<PlannerContentState>()(
  devtools(
    (set, get) => ({
      // Initial state
      sections: [],
      sectionRefs: new Map(),
      detailCount: 0,
      totalSections: 0,

      // Actions
      setSections: (sections) => {
        const details = sections.filter((s) => s.type === "detail");
        const totalSections = sections.length;

        set({
          sections,
          detailCount: details.length,
          totalSections,
        });
      },

      setSectionRef: (id, ref) => {
        const sectionRefs = new Map(get().sectionRefs);
        sectionRefs.set(id, ref);
        set({ sectionRefs });
      },

      scrollToSection: (id) => {
        const { sectionRefs } = get();
        const ref = sectionRefs.get(id);

        if (ref?.current) {
          ref.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });

          // Optional: Add highlight effect
          ref.current.style.transition = "all 0.3s ease";
          ref.current.style.borderLeft = "4px solid #ffb57f";
          ref.current.style.paddingLeft = "8px";
          setTimeout(() => {
            ref.current!.style.borderLeft = "";
            ref.current!.style.paddingLeft = "";
          }, 1000);
        }
      },

      updateSection: (id, section) => {
        const sections = get().sections.map((s) => (s.id === id ? section : s));
        get().setSections(sections);
      },

      addSection: (section) => {
        const sections = [...get().sections, section];
        get().setSections(sections);
      },

      removeSection: (id) => {
        const sections = get().sections.filter((s) => s.id !== id);
        get().setSections(sections);
      },

      // Computed getters
      getDetailSections: () =>
        get().sections.filter((s) => s.type === "detail"),
      getMainSections: () => get().sections.filter((s) => s.type !== "detail"),
      getSectionById: (id) => get().sections.find((s) => s.id === id),
    }),
    {
      name: "planner-content-store", // DevTools name
    }
  )
);
