// 'use client';

// import { useState } from 'react';

// interface UploadAllResponse {
//   success: boolean;
//   message: string;
//   summary?: {
//     totalFiles: number;
//     successCount: number;
//     skipCount: number;
//     errorCount: number;
//     totalProvinces: number;
//   };
//   results?: Array<{
//     file: string;
//     status: 'success' | 'skipped';
//     message: string;
//     data: {
//       id?: string;
//       matinh: string;
//       tentinh: string;
//       loai: string;
//       dientichkm2?: number;
//       dansonguoi?: number;
//       kinhdo?: number;
//       vido?: number;
//     };
//   }>;
//   errors?: string[];
//   allProvinces?: Array<{
//     _id: string;
//     matinh: string;
//     tentinh: string;
//     loai: string;
//     dientichkm2: number;
//     dansonguoi: number;
//   }>;
// }

// export default function UploadAllProvincesButton() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
//   const [message, setMessage] = useState('');
//   const [uploadData, setUploadData] = useState<UploadAllResponse['summary'] | null>(null);
//   const [provinces, setProvinces] = useState<UploadAllResponse['allProvinces']>([]);
//   const [showDetails, setShowDetails] = useState(false);

//   const handleUpload = async () => {
//     setIsLoading(true);
//     setStatus('idle');
//     setMessage('');
//     setUploadData(null);
//     setProvinces([]);

//     try {
//       console.log('🚀 Bắt đầu upload tất cả tỉnh thành...');

//       const response = await fetch('/api/upload-all-provinces', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });

//       const result: UploadAllResponse = await response.json();

//       if (result.success) {
//         setStatus('success');
//         setMessage(result.message);
//         setUploadData(result.summary || null);
//         setProvinces(result.allProvinces || []);
//         console.log('✅ Upload thành công:', result.summary);
//       } else {
//         setStatus('error');
//         setMessage(result.message || 'Upload thất bại');
//         console.error('❌ Upload thất bại:', result);
//       }

//     } catch (error) {
//       setStatus('error');
//       setMessage(error instanceof Error ? error.message : 'Lỗi mạng khi upload');
//       console.error('❌ Lỗi upload:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center space-y-6 p-6">
//       {/* Upload Button */}
//       <button
//         onClick={handleUpload}
//         disabled={isLoading}
//         className={`
//           px-8 py-4 rounded-lg font-semibold text-white min-w-[280px]
//           transition-all duration-200 ease-in-out shadow-lg
//           ${isLoading
//             ? 'bg-gray-400 cursor-not-allowed'
//             : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 hover:shadow-xl'
//           }
//           ${status === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
//           ${status === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
//         `}
//       >
//         {isLoading ? (
//           <div className="flex items-center justify-center space-x-3">
//             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//             <span>Đang upload...</span>
//           </div>
//         ) : (
//           <div className="flex items-center justify-center space-x-2">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
//             </svg>
//             <span>Upload Tất Cả Tỉnh Thành (34)</span>
//           </div>
//         )}
//       </button>

//       {/* Status Message */}
//       {message && (
//         <div className={`
//           p-4 rounded-lg text-sm max-w-2xl text-center border
//           ${status === 'success' ? 'bg-green-50 text-green-800 border-green-200' : ''}
//           ${status === 'error' ? 'bg-red-50 text-red-800 border-red-200' : ''}
//         `}>
//           <div className="flex items-center justify-center space-x-2">
//             {status === 'success' && (
//               <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//               </svg>
//             )}
//             {status === 'error' && (
//               <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//               </svg>
//             )}
//             <span className="font-medium">{message}</span>
//           </div>
//         </div>
//       )}

//       {/* Upload Summary */}
//       {uploadData && status === 'success' && (
//         <div className="bg-gray-50 rounded-lg p-6 w-full max-w-2xl">
//           <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
//             <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
//             </svg>
//             Thống Kê Upload:
//           </h3>
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
//             <div className="text-center p-3 bg-blue-100 rounded-lg">
//               <div className="text-2xl font-bold text-blue-600">{uploadData.totalFiles}</div>
//               <div className="text-blue-700">File JSON</div>
//             </div>
//             <div className="text-center p-3 bg-green-100 rounded-lg">
//               <div className="text-2xl font-bold text-green-600">{uploadData.successCount}</div>
//               <div className="text-green-700">Thành công</div>
//             </div>
//             <div className="text-center p-3 bg-yellow-100 rounded-lg">
//               <div className="text-2xl font-bold text-yellow-600">{uploadData.skipCount}</div>
//               <div className="text-yellow-700">Đã tồn tại</div>
//             </div>
//             <div className="text-center p-3 bg-red-100 rounded-lg">
//               <div className="text-2xl font-bold text-red-600">{uploadData.errorCount}</div>
//               <div className="text-red-700">Lỗi</div>
//             </div>
//             <div className="text-center p-3 bg-indigo-100 rounded-lg">
//               <div className="text-2xl font-bold text-indigo-600">{uploadData.totalProvinces}</div>
//               <div className="text-indigo-700">Tổng DB</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Provinces List */}
//       {provinces.length > 0 && status === 'success' && (
//         <div className="w-full max-w-4xl">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-semibold text-gray-800 flex items-center">
//               <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               Danh Sách Tỉnh Thành ({provinces.length}):
//             </h3>
//             <button
//               onClick={() => setShowDetails(!showDetails)}
//               className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
//             >
//               {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
//             </button>
//           </div>

//           {showDetails && (
//             <div className="bg-white rounded-lg border overflow-hidden">
//               <div className="max-h-96 overflow-y-auto">
//                 <table className="w-full text-sm">
//                   <thead className="bg-gray-50 sticky top-0">
//                     <tr>
//                       <th className="px-4 py-3 text-left font-medium text-gray-700">STT</th>
//                       <th className="px-4 py-3 text-left font-medium text-gray-700">Tên Tỉnh</th>
//                       <th className="px-4 py-3 text-left font-medium text-gray-700">Loại</th>
//                       <th className="px-4 py-3 text-left font-medium text-gray-700">Mã</th>
//                       <th className="px-4 py-3 text-left font-medium text-gray-700">Diện Tích</th>
//                       <th className="px-4 py-3 text-left font-medium text-gray-700">Dân Số</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {provinces.map((province, index) => (
//                       <tr key={province._id} className="hover:bg-gray-50">
//                         <td className="px-4 py-3 text-gray-600">{index + 1}</td>
//                         <td className="px-4 py-3 font-medium text-gray-900">{province.tentinh}</td>
//                         <td className="px-4 py-3 text-gray-600">
//                           <span className={`
//                             px-2 py-1 rounded-full text-xs font-medium
//                             ${province.loai.includes('thành phố') ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
//                           `}>
//                             {province.loai}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 text-gray-600 font-mono">{province.matinh}</td>
//                         <td className="px-4 py-3 text-gray-600">{province.dientichkm2} km²</td>
//                         <td className="px-4 py-3 text-gray-600">{province.dansonguoi.toLocaleString()}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Loading Indicator */}
//       {isLoading && (
//         <div className="text-sm text-gray-600 text-center">
//           <div className="flex items-center justify-center space-x-2">
//             <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
//             <span>Đang xử lý {provinces.length > 0 ? provinces.length : '34'} file JSON và upload lên MongoDB...</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
