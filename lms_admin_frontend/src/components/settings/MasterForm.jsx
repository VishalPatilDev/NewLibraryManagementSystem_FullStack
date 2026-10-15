// import { useEffect, useState } from "react";
// import {
//   create,
//   update,
// } from "../../services/settingsService";

// const MasterForm = ({
//   open,
//   onClose,
//   onSaved,
//   selectedMenu,
//   editData,
// }) => {
//   const [name, setName] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     setName(editData?.name || "");
//   }, [editData, open]);

//   if (!open) return null;

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!name.trim()) return;

//     try {
//       setLoading(true);

//       if (editData) {
//         await update(
//           selectedMenu.endpoint,
//           editData.id,
//           name
//         );
//       } else {
//         await create(
//           selectedMenu.endpoint,
//           name
//         );
//       }

//       onClose();
//       onSaved();
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

//       <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

//         {/* Header */}
//         <div className="bg-gradient-to-b from-blue-400 to-blue-600 px-6 py-4 text-center text-white">
//           <h2 className="text-lg font-bold">
//             {editData ? "Edit" : "Create"}{" "}
//             {selectedMenu.label}
//           </h2>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6">

//           <label className="mb-2 block text-sm font-medium text-slate-700">
//             {selectedMenu.label}
//           </label>

//           <input
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder={`Enter ${selectedMenu.label}`}
//             className="
//               w-full rounded-lg
//               border border-slate-300
//               px-4 py-2.5 text-sm
//               outline-none
//               focus:border-blue-500
//               focus:ring-2 focus:ring-blue-200
//             "
//           />

//           <div className="mt-6 flex justify-end gap-3">

//             <button
//               type="button"
//               onClick={onClose}
//               className="
//                 rounded-lg px-4 py-2
//                 text-sm font-medium text-blue-600
//                 hover:bg-blue-50
//               "
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={loading}
//               className="
//                 rounded-lg bg-blue-600
//                 px-5 py-2
//                 text-sm font-semibold text-white
//                 hover:bg-blue-700
//                 disabled:cursor-not-allowed
//                 disabled:bg-blue-300
//               "
//             >
//               {loading ? "Saving..." : "Save"}
//             </button>

//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default MasterForm;
