"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Plus, Trash } from "lucide-react";
import { Separator } from "../ui/separator";
import { z } from "zod";
import { ItemGuideSchema, NewItemGuideSchema } from "@/lib/validation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import Collaps from "../Collaps";

import InputWithIcon from "./InputIcon";
import { FaEllipsis, FaNoteSticky } from "react-icons/fa6";
import { MdChecklist } from "react-icons/md";
import Checklist from "./Checklist";
import "./style.css";
import PlaceSearch from "../search/PlaceSearch";
import { usePlaceSelection } from "@/hooks/usePlaceSelection";
import { FaMapMarker } from "react-icons/fa";
import ImageGallery from "../images/ImageGallery";
import { useGuideContentStore } from "@/store/guideContentStore";

// const ItemsGuideSchema = z.object({
//   items: z.array(ItemGuideSchema).optional(),
// });
const ItemsGuideSchema = z.object({
  data: z.array(NewItemGuideSchema).optional(),
});

type ItemsGuideFormData = z.infer<typeof ItemsGuideSchema>;

const ContentGuide = () => {
  const [dialogStates, setDialogStates] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [selectedAttractions, setSelectedAttractions] = useState<any[]>([]);
  const { clearPlaceSelection, getSelectedPlace } = usePlaceSelection();
  const form = useForm<ItemsGuideFormData>({
    resolver: zodResolver(ItemsGuideSchema),
    defaultValues: {
      data: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "data",
  });

  const { watch } = form;
  const { setSections } = useGuideContentStore();
  const isDialogOpen = (index: number) => {
    return dialogStates[index] || false;
  };
  const itemsWatch = watch("data");

  useEffect(() => {
    console.log("Change Items Watch", itemsWatch);

    if (itemsWatch && itemsWatch.length > 0) {
      const sections = itemsWatch.map((item, index) => ({
        type: item.type,
        name: item.name || "",
        data: item.data || [],
        index, // Add index for tracking
      }));

      console.log("Setting sections:", sections);
      setSections(sections);
    }
  }, [itemsWatch, setSections]);

  console.log("Items Watcvh", itemsWatch);
  const handleAddList = (type: "route" | "list") => {
    if (type == "route") {
      const listRoute = fields?.filter((item) => item?.type == "route");
      append({
        type: type,
        name: `Day ${listRoute?.length + 1}`,
        data: [],
      });
    } else if (type == "list") {
      append({
        type: type,
        name: "",
        data: [],
      });
    }
  };

  const handleRemove = (index: number) => {
    if (fields.length > 0) {
      remove(index);
    }
  };

  const handleAddNoteItem = (parentIndex: number) => {
    const currentItems = form.getValues(`data.${parentIndex}.data`) || [];
    const newPosition = currentItems.length + 1;

    const newNoteItem = {
      type: "note" as const,
      content: "",
    };

    // Update the form with new item
    const updatedItems = [...currentItems, newNoteItem];
    form.setValue(`data.${parentIndex}.data`, updatedItems);
  };

  // const handleAddChecklistItem = (parentIndex: number) => {
  //   const currentItems = form.getValues(`data.${parentIndex}.data`) || [];
  //   const newPosition = currentItems.length + 1;

  //   const newChecklistItem = {
  //     type: "checklist" as const,
  //     items: [], // Empty checklist array
  //   };

  //   // Update the form with new item
  //   const handleAddPlaceItem = (parentIndex: number) => {
  //     const currentItems =
  //       form.getValues(`data.${parentIndex}.data`) || [];
  //     const newPosition = currentItems.length + 1;

  //     const newPlaceItem = {
  //       name: "",
  //       type: "list" as const,
  //       index: newPosition,
  //       data: [
  //         {
  //           type: "place" as const,
  //           name: "",
  //           address: "",
  //           coordinates: [],
  //           note: "",
  //           imgUrls: [],
  //         },
  //       ],
  //     };

  //     // Update the form with new item
  //     const updatedItems = [...currentItems, newPlaceItem];
  //     form.setValue(`details.${parentIndex}.details`, updatedItems);
  //   };
  //   // Update the form with new item
  //   const updatedItems = [...currentItems, newPlaceItem];
  //   form.setValue(`items.${parentIndex}.items`, updatedItems);
  // };
  const handleAddChecklistItem = (parentIndex: number) => {
    const currentItems = form.getValues(`data.${parentIndex}.data`) || [];
    const newPosition = currentItems.length + 1;

    const newChecklistItem = {
      type: "checklist" as const,
      items: [], // Empty checklist array
    };

    // Update the form with new item
    const updatedItems = [...currentItems, newChecklistItem];
    form.setValue(`data.${parentIndex}.data`, updatedItems);
  };

  const handleAddPlaceItem = (parentIndex: number) => {
    const currentItems = form.getValues(`data.${parentIndex}.data`) || [];
    const newPosition = currentItems.length + 1;
    const newPlaceItem = {
      type: "place" as const,
      name: "War Remnants Museum",
      address: "28 Vo Van Tan, Ward 6, District 3, Ho Chi Minh City",
      description: "A museum dedicated to the history of the Vietnam War.",
      tags: ["museum", "history", "war"],
      phone: "+84 28 3930 5587",
      images: ["https://example.com/war-museum-1.jpg"],
      website: "https://warremnantsmuseum.com/",
      location: {
        type: "Point" as const,
        coordinates: [106.688, 10.776],
      },
      note: "The War Remnants Museum provides a poignant insight into the Vietnam War.",
    };
    // Update the form with new item
    const updatedItems = [...currentItems, newPlaceItem];
    form.setValue(`data.${parentIndex}.data`, updatedItems);
  };
  const renderDetailForm = (index: number) => {
    const currentRouteItems = form.watch(`data.${index}.data`) || [];

    const updateItemData = (itemIndex: number, newData: any) => {
      const updatedItems = [...currentRouteItems];

      // Update the appropriate field based on item type
      const itemType = updatedItems[itemIndex].type;
      if (itemType === "note") {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          content: newData,
        };
      } else if (itemType === "checklist") {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          items: Array.isArray(newData) ? newData : [newData],
        };
      } else if (itemType === "place") {
        // Handle place type updates as needed
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          ...newData,
        };
      }

      form.setValue(`data.${index}.data`, updatedItems);
    };

    // Helper function to remove item
    const removeItem = (itemIndex: number) => {
      const updatedItems = currentRouteItems.filter((_, i) => i !== itemIndex);
      form.setValue(`data.${index}.data`, updatedItems);
    };

    return (
      <div className="flex items-center justify-between flex-col">
        <Collaps
          titleFeature={
            <div className="flex-1">
              <Form {...form}>
                <div className="flex  items-center gap-2 justify-between">
                  <FormField
                    control={form.control}
                    name={`data.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="min-h-[48px] min-w-[260px] flex rounded-[8px] bg-white active:!background-form focus:background-light800_darkgradient hover:background-light800_darkgradient relative  grow items-center gap-1  px-4">
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            className="border-none font-semibold !text-[24px] shadow-none no-focus "
                            placeholder="Add a Title (e.g, Restaurant )"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  ></FormField>
                  <FormField
                    control={form.control}
                    name={`data.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="w-[100px] rounded-[8px] overflow-hidden background-form border-none shadow-none">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="border-none font-semibold shadow-none">
                                <SelectValue
                                  placeholder="Select type"
                                  className="font-semibold"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="list">List</SelectItem>
                              <SelectItem value="route">Route</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  ></FormField>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      // set
                    }}
                  >
                    <FaEllipsis />
                  </Button>
                </div>
              </Form>
            </div>
          }
          itemExpand={
            <div className="flex flex-col gap-2">
              {currentRouteItems?.map((item, idx) => {
                // Calculate the place number for this specific item
                const testPlace = currentRouteItems.slice(0, idx + 1);
                const placeIndex = currentRouteItems
                  .slice(0, idx + 1)
                  .filter((i) => i.type === "place").length;

                if (item.type == "note") {
                  return (
                    <div
                      key={`note-${idx}`}
                      className="flex gap-2 items-center item-hover-btn"
                    >
                      <InputWithIcon
                        placeholder="Write or paste notes here"
                        icon={<FaNoteSticky />}
                        onChange={(value) =>
                          updateItemData(idx, value.target.value)
                        }
                      />
                      <Button
                        onClick={() => {
                          removeItem(idx);
                        }}
                        className=" hover-btn !bg-transparent border-none shadow-none text-light800_dark300  flex items-center justify-center"
                      >
                        <Trash />
                      </Button>
                    </div>
                  );
                }
                if (item.type == "checklist") {
                  return (
                    <div
                      key={`checklist-${idx}`}
                      className="flex gap-2 items-center item-hover-btn"
                    >
                      <Checklist
                        className="flex-1"
                        onChange={(newItems) => updateItemData(idx, newItems)}
                        onRemove={() => removeItem(idx)}
                        key={idx}
                        items={item.items as string[]}
                      />
                      <Button
                        onClick={() => {
                          removeItem(idx);
                        }}
                        className=" hover-btn !bg-transparent border-none shadow-none text-light800_dark300  flex items-center justify-center"
                      >
                        <Trash />
                      </Button>
                    </div>
                  );
                }
                if (item.type == "place") {
                  const listImgs = item?.imageKeys?.map(
                    (item: string) =>
                      `https://itin-dev.wanderlogstatic.com/freeImageSmall/${item}`
                  );
                  return (
                    <div
                      key={`place-${idx}`}
                      className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg"
                    >
                      <section>
                        <div className="relative">
                          <FaMapMarker size={28} className="text-pink-500" />
                          <p className="text-[12px] text-white font-bold absolute top-[4px] left-[10px]">
                            {placeIndex}
                          </p>
                        </div>
                      </section>
                      <section className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.name || "Unnamed Place"}
                        </h3>
                        {item.address && (
                          <p className="text-sm text-gray-600 mb-2">
                            {item.address}
                          </p>
                        )}
                        {/* {item.description && (
                          <p className="text-sm text-gray-700 mb-2">
                            {item.description}
                          </p>
                        )}
                        {item.note && (
                          <p className="text-xs text-gray-500 italic">
                            Note: {item.note}
                          </p>
                        )} */}
                      </section>
                      <section>
                        <ImageGallery
                          images={listImgs}
                          mainImageIndex={0}
                          alt="Gallery description"
                          // className="w-full"
                        />
                      </section>
                      {/* <section>
                        <Button
                          onClick={() => removeItem(idx)}
                          className="hover-btn !bg-transparent border-none shadow-none text-light800_dark300 flex items-center justify-center"
                        >
                          <Trash size={16} />
                        </Button>
                      </section> */}
                    </div>
                  );
                }
              })}
              <div className="flex items-center gap-2">
                <PlaceSearch
                  onPlaceSelect={(place) => {
                    handlePlaceSelect(place, index);
                  }}
                  placeholder="Search for museums, parks, temples, beaches..."
                  maxResults={8}
                />
                <Button
                  onClick={() => {
                    handleAddNoteItem(index);
                  }}
                  className="shadow-none background-light800_dark300 hover:!bg-gray-300 dark:hover:!bg-dark-200 text-black dark:text-white rounded-full w-[48px] flex items-center h-[48px]"
                >
                  <FaNoteSticky />
                </Button>
                <Button
                  onClick={() => handleAddChecklistItem(index)}
                  className="shadow-none background-light800_dark300 hover:!bg-gray-300 dark:hover:!bg-dark-200 text-black dark:text-white  rounded-full w-[48px] flex items-center h-[48px]"
                >
                  <MdChecklist />
                </Button>
              </div>
            </div>
          }
        />

        {index + 1 < fields?.length && <Separator className="my-[24px] " />}
        {/* {isOpenDialog && (
          <ReusableDialog
            open={isOpenDialog}
            setOpen={setIsOpenDialog}
            data={{
              title: "Add hotels or lodging",
              content: <div>Hello</div>,
              showCloseButton: false,
            }}
          />
        )} */}
      </div>
    );
  };

  useEffect(() => {
    const selectedPlace = getSelectedPlace();

    if (selectedPlace) {
      // Add to our list
      setSelectedAttractions((prev) => {
        // Check if already exists
        const exists = prev.some((attr) => attr.id === selectedPlace.id);
        if (!exists) {
          return [...prev, selectedPlace];
        }
        return prev;
      });

      // Clear URL params
      clearPlaceSelection();
    }
  }, [getSelectedPlace, clearPlaceSelection]);
  const handlePlaceSelect = (place: any, index: any) => {
    // Direct selection from component
    const currentItems = form.getValues(`data.${index}.data`) || [];
    // const newPosition = currentItems.length + 1;

    const newPlaceItem = {
      type: "place" as const,
      ...place,
    };

    // Update the form with new item
    const updatedItems = [...currentItems, newPlaceItem];
    form.setValue(`data.${index}.data`, updatedItems);

    // setSelectedAttractions((prev) => {
    //   const exists = prev.some((attr) => attr.id === place.id);
    //   if (!exists) {
    //     return [...prev, place];
    //   }
    //   return prev;
    // });
  };
  return (
    <div>
      <div>
        {fields?.map((field, index) => (
          <div
            key={field?.id ? field?.id : index.toString()}
            id={field?.id ? field?.id : index.toString()}
          >
            {index === 0 && <Separator className="mb-[24px]" />}
            <div className="flex items-center  justify-between">
              <Card className="border-none w-full shadow-none">
                <CardContent className="relative !p-0">
                  {renderDetailForm(index)}
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
      <Separator className="my-[24px]" />
      <div className="my-4 route-list-container">
        <div className="flex gap-2">
          <Button
            onClick={() => {
              handleAddList("list");
            }}
            className=" !bg-primary-500 !text-white font-bold rounded-[100px]"
          >
            <Plus />
            New List
          </Button>
          <Button
            onClick={() => {
              handleAddList("route");
            }}
            className="!bg-white !text-primary-500 font-bold border border-primary-500 hover:bg-primary-500 hover:text-white rounded-[100px]"
          >
            <Plus />
            New Route
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentGuide;
