import React from "react";
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
import Link from "next/link";
import { BiRightArrow } from "react-icons/bi";
import InputWithIcon from "./InputIcon";
import { FaMapMarkerAlt, FaMarker, FaSave } from "react-icons/fa";
import { FaNoteSticky } from "react-icons/fa6";
import { MdChecklist } from "react-icons/md";
import Checklist from "./Checklist";
import "./style.css";
const mockData = [
  {
    type: "route",
    title: "Day1",
    subheading: "Khám phá thành phố Hồ Chí Minh",
    items: [
      {
        type: "place",
        data: {
          info: {
            name: "Cu Chi Tunnels",
            address: "Cu Chi Tunnels, Ho Chi Minh City, Vietnam",
            coordinates: [106.456, 10.567],
            note: "",
            imgUrls: [""],
          },
        },
        position: 1,
      },
      {
        type: "note",
        data: { info: "Mang theo giày thể thao, nước uống và đồ ăn nhẹ." },
        position: 2,
      },
      {
        type: "checklist",
        data: {
          info: ["Quần", "Áo", "Giày thể thao", "Nước uống", "Đồ ăn nhẹ"],
        },
      },
    ],
  },
];

const ItemsGuideSchema = z.object({
  items: z.array(ItemGuideSchema).optional(),
});

type ItemsGuideFormData = z.infer<typeof ItemsGuideSchema>;

const ContentGuide = () => {
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
  const itemsWatch = watch("items");

  const handleAddList = (type: "route" | "list") => {
    if (type == "route") {
      const listRoute = fields?.filter((item) => item?.type == "route");
      append({
        type: type,
        title: `Day ${listRoute?.length + 1}`,
        subheading: "",
        items: [],
      });
    } else if (type == "list") {
      append({
        type: type,
        title: "",
        subheading: "",
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
                </div>
              </Form>
            </div>
          }
          itemExpand={
            <div className="flex flex-col gap-2">
              {currentRouteItems?.map((item, idx) => {
                if (item.type == "note") {
                  return (
                    <div className="flex gap-2 items-center item-hover-btn">
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
                    <div className="flex gap-2 items-center item-hover-btn">
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
                  return <div>Place</div>;
                }
              })}
              <div className="flex items-center gap-2">
                <InputWithIcon
                  placeholder="Add a Place"
                  icon={<FaMapMarkerAlt />}
                />
                <Button
                  onClick={() => {
                    handleAddNoteItem(index);
                  }}
                  className="shadow-none background-form text-black rounded-full w-[48px] flex items-center h-[48px]"
                >
                  <FaNoteSticky />
                </Button>
                <Button
                  onClick={() => handleAddChecklistItem(index)}
                  className="shadow-none background-form text-black rounded-full w-[48px] flex items-center h-[48px]"
                >
                  <MdChecklist />
                </Button>
              </div>
            </div>
          }
        />

        {index + 1 < fields?.length && <Separator className="my-1 mt-4" />}
      </div>
    );
  };

  console.log("itemsWatch", itemsWatch);
  return (
    <div>
      <div>
        {fields?.map((field, index) => (
          <div id={field?.id || index.toString()}>
            {index === 0 && <Separator className="my-1" />}
            <div className="flex items-center  justify-between">
              <Card key={field.id} className="border-none w-full shadow-none">
                <CardContent className="relative !p-0">
                  {renderDetailForm(index)}
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
      <Separator className="my-1" />
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
