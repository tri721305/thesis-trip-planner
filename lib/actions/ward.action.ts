import Ward from "@/database/ward.model";
import action from "../handler/action";
import { handleError } from "../handler/error";
import {
  GetWardAndPolygonByIdSchema,
  GetWardByNameSchema,
  GetWardByProvinceIdSchema,
} from "../validation";

export async function getWardById(
  params: GetWardByProvinceIdParams
): Promise<ActionResponse<{}>> {
  const validationResult = await action({
    params,
    schema: GetWardByProvinceIdSchema,
    authorize: false,
  });

  console.log("params", params, validationResult);

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { provinceId } = validationResult.params!;

  try {
    const wards = await Ward.find({ matinh: provinceId })
      .select("-geometry") // Loại bỏ trường geometry
      .lean(); // Sử dụng lean() để tăng hiệu suất

    if (!wards || wards.length === 0) {
      throw new Error("Không tìm thấy phường/xã nào cho tỉnh này");
    }
    return { success: true, data: wards };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getWardAndPolygonById(
  params: GetWardAndPolygonByIdParams
): Promise<ActionResponse<{}>> {
  try {
    const validationResult = await action({
      params,
      schema: GetWardAndPolygonByIdSchema,
      authorize: false,
    });
    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const ward = await Ward.findById(params.wardId).lean();

    if (!ward) {
      throw new Error("Không tìm thấy phường/xã");
    }

    return { success: true, data: ward };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getWardByName(
  params: GetWardByName
): Promise<ActionResponse<{}>> {
  const validationResult = await action({
    params,
    schema: GetWardByNameSchema,
    authorize: false,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const ward = await Ward.find({ tenhc: params.wardName })
    .select("-geometry") // Loại bỏ trường geometry
    .lean(); // Sử dụng lean() để tăng hiệu suất;

  if (!ward) {
    throw new Error("Không tìm thấy phường/xã với tên này");
  }

  return {
    success: true,
    data: JSON.parse(JSON.stringify(ward)),
  };
}
