// import { useEffect, useState } from "react";
// import { getAll, remove } from "../../services/settingsService";
// import MasterForm from "./MasterForm";
// import DeleteDialog from "./DeleteDialog";

// const SettingsTable = ({ selectedMenu }) => {
//   const [rows, setRows] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [formOpen, setFormOpen] = useState(false);
//   const [deleteOpen, setDeleteOpen] = useState(false);

//   const [editData, setEditData] = useState(null);
//   const [deleteItem, setDeleteItem] = useState(null);

//   useEffect(() => {
//     fetchData();
//   }, [selectedMenu]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       const data = await getAll(selectedMenu.endpoint);

//       setRows(data || []);
//     } catch (error) {
//       console.error(error);
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredRows = rows.filter((item) =>
//     item.name?.toLowerCase().includes(search.toLowerCase())
//   );

//   const handleAdd = () => {
//     setEditData(null);
//     setFormOpen(true);
//   };

//   const handleEdit = (item) => {
//     setEditData(item);
//     setFormOpen(true);
//   };

//   const handleDeleteClick = (item) => {
//     setDeleteItem(item);
//     setDeleteOpen(true);
//   };

//   const handleDelete = async () => {
//     try {
//       await remove(selectedMenu.endpoint, deleteItem.id);

//       setRows((prev) =>
//         prev.filter((item) => item.id !== deleteItem.id)
//       );

//       setDeleteOpen(false);
//       setDeleteItem(null);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <>
//       <section className="w-full">

//         {/* Header */}
//         <div className="mb-3 flex flex-wrap items-center gap-2">

//           <div className="relative flex-1 sm:max-w-xs">
//             <input
//               type="text"
//               placeholder={`Search ${selectedMenu.label}`}
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="
//                 w-full rounded-lg border border-slate-300
//                 bg-white px-4 py-2 text-sm
//                 outline-none
//                 transition
//                 focus:border-blue-500
//                 focus:ring-2 focus:ring-blue-200
//               "
//             />
//           </div>

//           <button
//             onClick={handleAdd}
//             className="
//               rounded-lg
//               bg-blue-600
//               px-4 py-2
//               text-sm font-semibold text-white
//               transition
//               hover:bg-blue-700
//             "
//           >
//             + Add {selectedMenu.label}
//           </button>

//           <span
//             className="
//               rounded-full border border-blue-300
//               px-3 py-1.5
//               text-xs font-semibold text-blue-600
//             "
//           >
//             {selectedMenu.label}: {filteredRows.length}
//           </span>
//         </div>

//         {/* Table */}
//         <div
//           className="
//             overflow-hidden
//             rounded-xl
//             border border-slate-200
//             bg-white
//             shadow-sm
//           "
//         >
//           {loading ? (
//             <div className="flex h-40 items-center justify-center">
//               <div
//                 className="
//                   h-7 w-7 animate-spin
//                   rounded-full
//                   border-4 border-slate-200
//                   border-t-blue-600
//                 "
//               />
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[600px] text-sm">

//                 <thead>
//                   <tr className="bg-blue-600 text-left text-white">
//                     <th className="px-4 py-3 font-semibold">
//                       ID
//                     </th>

//                     <th className="px-4 py-3 font-semibold">
//                       {selectedMenu.label}
//                     </th>

//                     <th className="px-4 py-3 text-center font-semibold">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {filteredRows.map((item) => (
//                     <tr
//                       key={item.id}
//                       className="
//                         border-b border-slate-100
//                         even:bg-slate-50
//                         hover:bg-blue-50
//                       "
//                     >
//                       <td className="px-4 py-3">
//                         {item.id}
//                       </td>

//                       <td className="px-4 py-3 font-medium text-slate-700">
//                         {item.name}
//                       </td>

//                       <td className="px-4 py-3">
//                         <div className="flex justify-center gap-2">
//                           <button
//                             onClick={() => handleEdit(item)}
//                             className="
//                               rounded-md bg-blue-600
//                               px-3 py-1
//                               text-xs font-medium text-white
//                               hover:bg-blue-700
//                             "
//                           >
//                             Edit
//                           </button>

//                           <button
//                             onClick={() => handleDeleteClick(item)}
//                             className="
//                               rounded-md bg-red-500
//                               px-3 py-1
//                               text-xs font-medium text-white
//                               hover:bg-red-600
//                             "
//                           >
//                             Delete
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>

//               </table>
//             </div>
//           )}

//           {!loading && filteredRows.length === 0 && (
//             <div className="p-10 text-center text-sm text-slate-500">
//               No {selectedMenu.label.toLowerCase()} found.
//             </div>
//           )}
//         </div>

//       </section>

//       <MasterForm
//         open={formOpen}
//         onClose={() => {
//           setFormOpen(false);
//           setEditData(null);
//         }}
//         onSaved={fetchData}
//         selectedMenu={selectedMenu}
//         editData={editData}
//       />

//       <DeleteDialog
//         open={deleteOpen}
//         onClose={() => setDeleteOpen(false)}
//         onConfirm={handleDelete}
//         item={deleteItem}
//         selectedMenu={selectedMenu}
//       />
//     </>
//   );
// };

// export default SettingsTable;
