// import UploadProvinceButton from "@/components/upload/UploadProvinceButton";
// import UploadAllProvincesButton from "@/components/upload/UploadAllProvincesButton";

// export default function UploadDataPage() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
//       <div className="max-w-4xl mx-auto px-4">
//         <div className="bg-white rounded-xl shadow-xl overflow-hidden">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
//             <h1 className="text-3xl font-bold text-white mb-2">
//               Data Upload Center
//             </h1>
//             <p className="text-blue-100">
//               Upload Province data from JSON file to MongoDB database
//             </p>
//           </div>

//           {/* Main Content */}
//           <div className="p-8">
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
//                 <svg
//                   className="w-8 h-8 text-blue-600"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7c0-2.21 1.79-4 4-4h8c2.21 0 4 1.79 4 4M4 7l8 4 8-4"
//                   />
//                 </svg>
//               </div>
//               <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//                 Province Data Upload
//               </h2>
//               <p className="text-gray-600 max-w-2xl mx-auto">
//                 Upload province data from JSON files to MongoDB database.
//                 You can upload a single province (Ho Chi Minh City) or all 34 provinces at once.
//               </p>
//             </div>

//             {/* Upload Section */}
//             <div className="border-t border-gray-200 pt-8">
//               {/* Single Province Upload */}
//               <div className="mb-12">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
//                   Upload Single Province (Ho Chi Minh City)
//                 </h3>
//                 <UploadProvinceButton />
//               </div>

//               {/* Divider */}
//               <div className="relative mb-12">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-gray-300" />
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-4 bg-white text-gray-500">Hoặc</span>
//                 </div>
//               </div>

//               {/* All Provinces Upload */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
//                   Upload Tất Cả Tỉnh Thành (34 Tỉnh)
//                 </h3>
//                 <UploadAllProvincesButton />
//               </div>
//             </div>

//             {/* Information Section */}
//             <div className="mt-12 grid md:grid-cols-2 gap-6">
//               <div className="bg-blue-50 rounded-lg p-6">
//                 <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
//                   <svg
//                     className="w-5 h-5 mr-2"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                   Dữ liệu sẽ được upload:
//                 </h3>
//                 <ul className="text-sm text-blue-800 space-y-2">
//                   <li className="flex items-start">
//                     <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
//                     Thông tin hành chính (tên, mã, loại tỉnh)
//                   </li>
//                   <li className="flex items-start">
//                     <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
//                     Diện tích và dân số của từng tỉnh
//                   </li>
//                   <li className="flex items-start">
//                     <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
//                     Tọa độ địa lý (kinh độ, vĩ độ)
//                   </li>
//                   <li className="flex items-start">
//                     <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
//                     34 tỉnh thành phố trên toàn quốc
//                   </li>
//                 </ul>
//               </div>

//               <div className="bg-green-50 rounded-lg p-6">
//                 <h3 className="font-semibold text-green-900 mb-3 flex items-center">
//                   <svg
//                     className="w-5 h-5 mr-2"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                   Tính năng:
//                 </h3>
//                 <ul className="text-sm text-green-800 space-y-2">
//                   <li className="flex items-start">
//                     <span className="inline-block w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
//                     Tự động kiểm tra dữ liệu trùng lặp
//                   </li>
//                   <li className="flex items-start">
//                     <span className="inline-block w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
//                     Xác thực dữ liệu và xử lý lỗi
//                   </li>
//                   <li className="flex items-start">
//                     <span className="inline-block w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
//                     Hiển thị trạng thái upload thời gian thực
//                   </li>
//                   <li className="flex items-start">
//                     <span className="inline-block w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
//                     Thống kê chi tiết sau khi upload
//                   </li>
//                   <li className="flex items-start">
//                     <span className="inline-block w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
//                     Hỗ trợ upload từng tỉnh hoặc tất cả cùng lúc
//                   </li>
//                 </ul>
//               </div>
//             </div>

//             {/* File Info */}
//             <div className="mt-8 bg-gray-50 rounded-lg p-4">
//               <h4 className="font-medium text-gray-800 mb-2">Data Source:</h4>
//               <p className="text-sm text-gray-600">
//                 <code className="bg-gray-200 px-2 py-1 rounded text-xs">
//                   database/data/thành_phố_Hồ_Chí_Minh.json
//                 </code>
//               </p>
//               <p className="text-xs text-gray-500 mt-1">
//                 Contains administrative boundary data for Ho Chi Minh City and
//                 surrounding areas
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="text-center mt-8">
//           <p className="text-sm text-gray-500">
//             Make sure your MongoDB connection is configured properly before
//             uploading
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
