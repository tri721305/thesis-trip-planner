import { add } from "date-fns";

export const mockUpDataGuide = {
  name: "Ho Chi Minh City Guide",
  author: {
    name: "Minh Trí",
    image: "https://example.com/author-image.jpg",
  },
  note: "A comprehensive guide to exploring Ho Chi Minh City, Vietnam.",
  details: [
    {
      type: "generalTips",
      data: "This guide provides essential tips for navigating Ho Chi Minh City, including transportation,",
      index: 0,
      name: "General Tips",
    },
    {
      type: "route",
      name: "Day 1",
      index: 1,
      data: [
        {
          type: "note",
          data: "Start your journey at Ben Thanh Market, a bustling hub of local culture and cuisine.",
        },
        {
          type: "checklist",
          data: ["bag", "passport", "camera"],
        },
        {
          type: "place",
          data: {
            name: "Rex Hotel",
            address: "141 Nguyen Hue, Ben Nghe, District 1, Ho Chi Minh City",
            description:
              "A historic hotel known for its rooftop bar and central location.",
            tags: ["hotel", "luxury", "central"],
            phone: "+84 28 3829 2185",
            images: ["https://example.com/rex-hotel-1.jpg"],
            website: "https://www.rexhotelvietnam.com/",
            location: {
              type: "Point",
              coordinates: [106.695, 10.776],
            },
            note: "The Rex Hotel is a landmark in Ho Chi Minh City, offering luxury accommodations and a rich history.",
          },
        },
        {
          type: "place",
          data: {
            name: "War Remnants Museum",
            address: "28 Vo Van Tan, Ward 6, District 3, Ho Chi Minh City",
            desciption:
              "A museum dedicated to the history of the Vietnam War, featuring exhibits on the war's impact on Vietnam and its people.",
            tags: ["museum", "history", "war"],
            phone: "+84 28 3930 5587",
            images: ["https://example.com/war-museum-1.jpg"],
            website: "https://warremnantsmuseum.com/",
            location: {
              type: "Point",
              coordinates: [106.688, 10.776],
            },
            note: "The War Remnants Museum provides a poignant insight into the Vietnam War and its lasting effects.",
          },
        },
      ],
    },
  ],
};
