import { model, models, Schema } from "mongoose";

interface GeometryCoordinates {
  Point: [number, number];
  LineString: Array<[number, number]>;
  Polygon: Array<Array<[number, number]>>;
  MultiPolygon: Array<Array<Array<[number, number]>>>;
}

export interface IProvince {
  matinh: string;
  tentinh: string;
  ma: string;
  loai: string;
  tenhc: string;
  cay: number;
  con: string;
  dientichkm2: number;
  dansonguoi: number;
  trungtamhc: string;
  kinhdo: number;
  vido: number;
  truocsapnhap?: string;
  geometry_type?: string;
  geometry_coordinate_count?: number;
  geometry?: {
    type: keyof GeometryCoordinates;
    coordinates: GeometryCoordinates[keyof GeometryCoordinates];
  };
}

export interface IProvinceDoc extends IProvince, Document {}

const ProvinceSchema = new Schema<IProvince>(
  {
    matinh: { type: String, required: true, unique: true, trim: true },
    tentinh: { type: String, required: true, trim: true },
    ma: { type: String, required: true, trim: true },
    loai: { type: String, required: true, trim: true },
    tenhc: { type: String, required: true, trim: true },
    cay: { type: Number, default: 0 },
    con: { type: String },
    dientichkm2: { type: Number, min: 0 },
    dansonguoi: { type: Number, min: 0 },
    trungtamhc: { type: String, trim: true },
    kinhdo: { type: Number, min: -180, max: 180 },
    vido: { type: Number, min: -90, max: 90 },
    truocsapnhap: { type: String, trim: true },
    geometry: {
      type: {
        type: String,
        enum: [
          "Polygon",
          "MultiPolygon",
          "Point",
          "LineString",
          "MultiPoint",
          "MultiLineString",
        ],
        required: false,
      },
      coordinates: {
        type: Schema.Types.Mixed,
        required: false,
        validate: {
          validator: function (coordinates: any) {
            // Custom validation based on geometry type
            const geometryType = this.geometry?.type;
            if (geometryType === "Point") {
              return Array.isArray(coordinates) && coordinates.length === 2;
            }
            // Add more validation for other types...
            return true;
          },
          message: "Invalid coordinates format for geometry type",
        },
      },
    },
    geometry_type: { type: String, required: false },
    geometry_coordinate_count: { type: Number, required: false, min: 0 },
  },
  {
    timestamps: true,
  }
);

ProvinceSchema.index({ geometry: "2dsphere" });

const Province =
  models?.Province || model<IProvince>("Province", ProvinceSchema);
export default Province;
