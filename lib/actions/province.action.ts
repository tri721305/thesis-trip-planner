import Province, { IProvince } from "@/database/province.model";
import dbConnect from "@/lib/mongoose";

export async function getProvinces(): Promise<ActionResponse<any[]>> {
  console.log("getProvinces");

  try {
    // Kết nối database
    await dbConnect();

    // Lấy tất cả provinces từ MongoDB
    const provinces = await Province.find({})
      .sort({ tentinh: 1 }) // Sắp xếp theo tên tỉnh
      .lean(); // Sử dụng lean() để tăng hiệu suất

    console.log(`Found ${provinces.length} provinces`);

    return {
      success: true,
      data: provinces,
    };
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return {
      success: false,
      error: {
        message: "Không thể lấy danh sách tỉnh/thành phố",
        details:
          error instanceof Error ? { general: [error.message] } : undefined,
      },
    };
  }
}

// Lấy thông tin chi tiết của một tỉnh theo ID
export async function getProvinceById(
  id: string
): Promise<ActionResponse<any>> {
  try {
    await dbConnect();

    const province = await Province.findById(id).lean();

    if (!province) {
      return {
        success: false,
        error: {
          message: "Không tìm thấy tỉnh/thành phố",
        },
      };
    }

    return {
      success: true,
      data: province,
    };
  } catch (error) {
    console.error("Error fetching province by ID:", error);
    return {
      success: false,
      error: {
        message: "Không thể lấy thông tin tỉnh/thành phố",
        details:
          error instanceof Error ? { general: [error.message] } : undefined,
      },
    };
  }
}

// Lấy tỉnh theo mã tỉnh
export async function getProvinceByCode(
  matinh: string
): Promise<ActionResponse<any>> {
  try {
    await dbConnect();

    const province = await Province.findOne({ matinh }).lean();

    if (!province) {
      return {
        success: false,
        error: {
          message: "Không tìm thấy tỉnh/thành phố với mã này",
        },
      };
    }

    return {
      success: true,
      data: province,
    };
  } catch (error) {
    console.error("Error fetching province by code:", error);
    return {
      success: false,
      error: {
        message: "Không thể lấy thông tin tỉnh/thành phố",
        details:
          error instanceof Error ? { general: [error.message] } : undefined,
      },
    };
  }
}

// Tìm kiếm tỉnh theo tên
export async function searchProvinces(
  query: string
): Promise<ActionResponse<any[]>> {
  try {
    await dbConnect();

    const provinces = await Province.find({
      $or: [
        { tentinh: { $regex: query, $options: "i" } },
        { tenhc: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ tentinh: 1 })
      .limit(20) // Giới hạn 20 kết quả
      .lean();

    return {
      success: true,
      data: provinces,
    };
  } catch (error) {
    console.error("Error searching provinces:", error);
    return {
      success: false,
      error: {
        message: "Không thể tìm kiếm tỉnh/thành phố",
        details:
          error instanceof Error ? { general: [error.message] } : undefined,
      },
    };
  }
}

// Lấy thống kê tổng quan về provinces
export async function getProvincesStats(): Promise<
  ActionResponse<{
    totalProvinces: number;
    provincesWithGeometry: number;
    totalArea: number;
    totalPopulation: number;
  }>
> {
  try {
    await dbConnect();

    const stats = await Province.aggregate([
      {
        $group: {
          _id: null,
          totalProvinces: { $sum: 1 },
          provincesWithGeometry: {
            $sum: {
              $cond: [{ $ne: ["$geometry", null] }, 1, 0],
            },
          },
          totalArea: { $sum: "$dientichkm2" },
          totalPopulation: { $sum: "$dansonguoi" },
        },
      },
    ]);

    const result = stats[0] || {
      totalProvinces: 0,
      provincesWithGeometry: 0,
      totalArea: 0,
      totalPopulation: 0,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error getting provinces stats:", error);
    return {
      success: false,
      error: {
        message: "Không thể lấy thống kê tỉnh/thành phố",
        details:
          error instanceof Error ? { general: [error.message] } : undefined,
      },
    };
  }
}
