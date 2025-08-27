// Ví dụ sử dụng getHotels với filter lodging.source

import { getHotels } from "@/lib/actions/hotel.action";

// Ví dụ các cách gọi API với filter source

// 1. Tìm kiếm trong tên, địa chỉ và source
const searchExample = async () => {
  const result = await getHotels({
    page: 1,
    pageSize: 10,
    query: "wanderlog", // Sẽ tìm trong name, address, và source
  });
  return result;
};

// 2. Filter chỉ lấy hotels từ source cụ thể
const filterBySourceExample = async () => {
  const result = await getHotels({
    page: 1,
    pageSize: 10,
    filter: {
      source: "wanderlog", // Chỉ lấy hotels từ wanderlog
    },
  });
  return result;
};

// 3. Sort by wanderlog source (wanderlog lên đầu + sắp xếp theo rating)
const sortByWanderlogExample = async () => {
  const result = await getHotels({
    page: 1,
    pageSize: 10,
    filter: {
      sortBy: "wanderlog", // Hotels từ wanderlog lên đầu, sort theo rating
    },
  });
  return result;
};

// 4. Kết hợp search + filter + sort
const combinedExample = async () => {
  const result = await getHotels({
    page: 1,
    pageSize: 10,
    query: "luxury hotel",
    filter: {
      source: "wanderlog",
      sortBy: "rating",
    },
  });
  return result;
};

// 5. Tìm kiếm các options sort khác
const otherSortOptions = async () => {
  // Sort by rating
  const byRating = await getHotels({
    filter: { sortBy: "rating" },
  });

  // Sort by price
  const byPrice = await getHotels({
    filter: { sortBy: "price" },
  });

  return { byRating, byPrice };
};

export {
  searchExample,
  filterBySourceExample,
  sortByWanderlogExample,
  combinedExample,
  otherSortOptions,
};
