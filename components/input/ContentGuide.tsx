"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Plus, Trash } from "lucide-react";
import { Separator } from "../ui/separator";
import { z } from "zod";
import { ItemGuideSchema } from "@/lib/validation";
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

const ItemsGuideSchema = z.object({
  items: z.array(ItemGuideSchema).optional(),
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
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { watch } = form;

  const isDialogOpen = (index: number) => {
    return dialogStates[index] || false;
  };
  const itemsWatch = watch("items");
  console.log("itemsWatch", itemsWatch);

  const handleAddList = (type: "route" | "list") => {
    if (type == "route") {
      const listRoute = fields?.filter((item) => item?.type == "route");
      append({
        type: type,
        title: `Day ${listRoute?.length + 1}`,
        // subheading: "",
        items: [],
      });
    } else if (type == "list") {
      append({
        type: type,
        title: "",
        // subheading: "",
        items: [],
      });
    }
  };

  const handleRemove = (index: number) => {
    if (fields.length > 0) {
      remove(index);
    }
  };

  const handleAddNoteItem = (parentIndex: number) => {
    const currentItems = form.getValues(`items.${parentIndex}.items`) || [];
    const newPosition = currentItems.length + 1;

    const newNoteItem = {
      type: "note" as const,
      position: newPosition,
      data: {
        info: "", // Empty note content
      },
    };

    // Update the form with new item
    const updatedItems = [...currentItems, newNoteItem];
    form.setValue(`items.${parentIndex}.items`, updatedItems);
  };

  const handleAddChecklistItem = (parentIndex: number) => {
    const currentItems = form.getValues(`items.${parentIndex}.items`) || [];
    const newPosition = currentItems.length + 1;

    const newChecklistItem = {
      type: "checklist" as const,
      position: newPosition,
      data: {
        info: [], // Empty checklist array
      },
    };

    // Update the form with new item
    const updatedItems = [...currentItems, newChecklistItem];
    form.setValue(`items.${parentIndex}.items`, updatedItems);
  };

  const handleAddPlaceItem = (parentIndex: number) => {
    const currentItems = form.getValues(`items.${parentIndex}.items`) || [];
    const newPosition = currentItems.length + 1;

    const newPlaceItem = {
      type: "place" as const,
      position: newPosition,
      data: {
        info: {
          name: "",
          address: "",
          coordinates: [],
          note: "",
          imgUrls: [],
        },
      },
    };

    // Update the form with new item
    const updatedItems = [...currentItems, newPlaceItem];
    form.setValue(`items.${parentIndex}.items`, updatedItems);
  };

  const renderDetailForm = (index: number) => {
    const currentRouteItems = form.watch(`items.${index}.items`) || [];

    const updateItemData = (itemIndex: number, newData: any) => {
      const updatedItems = [...currentRouteItems];
      console.log("updateItemData", itemIndex, newData);
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        data: {
          ...updatedItems[itemIndex].data,
          info: newData,
        },
      };
      form.setValue(`items.${index}.items`, updatedItems);
    };

    // Helper function to remove item
    const removeItem = (itemIndex: number) => {
      const updatedItems = currentRouteItems.filter((_, i) => i !== itemIndex);
      form.setValue(`items.${index}.items`, updatedItems);
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
                    name={`items.${index}.title`}
                    render={({ field }) => (
                      <FormItem className="min-h-[48px] min-w-[260px] flex rounded-[8px] bg-white active:!background-form focus:background-light800_darkgradient hover:background-light800_darkgradient relative  grow items-center gap-1  px-4">
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            className="border-none font-semibold !text-[18px] shadow-none no-focus "
                            placeholder="Add a Title (e.g, Restaurant )"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  ></FormField>
                  <FormField
                    control={form.control}
                    name={`items.${index}.type`}
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
                        items={item.data.info as string[]}
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
                  return <div key={`place-${idx}`}>Place</div>;
                }
              })}
              <div className="flex items-center gap-2">
                {/* <InputWithIcon
                  placeholder="Add a Place"
                  icon={<FaMapMarkerAlt />}
                /> */}
                <PlaceSearch
                  onPlaceSelect={handlePlaceSelect}
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
                  className="shadow-none background-light800_dark300 hover:!bg-gray-300 dark:hover:!bg-dark-200 text-black dark:text-white text-black rounded-full w-[48px] flex items-center h-[48px]"
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
  const handlePlaceSelect = (place: any) => {
    // Direct selection from component
    setSelectedAttractions((prev) => {
      const exists = prev.some((attr) => attr.id === place.id);
      if (!exists) {
        return [...prev, place];
      }
      return prev;
    });
  };
  console.log("selectedAttractions", selectedAttractions);
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
      <div className="mt-4 route-list-container">
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
