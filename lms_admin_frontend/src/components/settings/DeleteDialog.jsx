// const DeleteDialog = ({
//     open,
//     onClose,
//     onConfirm,
//     selectedMenu,
//     item,
// }) => {
//     if (!open) return null;

//     return (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">

//             <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">

//                 <div className="border-b border-slate-200 px-6 py-4">
//                     <h2 className="text-lg font-semibold text-red-600">
//                         Delete {selectedMenu?.label}
//                     </h2>
//                 </div>

//                 <div className="px-6 py-5 text-sm leading-6 text-slate-600">
//                     Are you sure you want to delete{" "}
//                     <strong className="text-red-600">
//                         {item?.name}
//                     </strong>
//                     ?

//                     <p className="mt-3">
//                         This action cannot be undone.
//                     </p>
//                 </div>

//                 <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

//                     <button
//                         onClick={onClose}
//                         className="
//               rounded-lg border border-slate-300
//               px-4 py-2
//               text-sm font-medium
//               text-slate-700
//               hover:bg-slate-50
//             "
//                     >
//                         Cancel
//                     </button>

//                     <button
//                         onClick={onConfirm}
//                         className="
//               rounded-lg bg-red-600
//               px-4 py-2
//               text-sm font-semibold text-white
//               hover:bg-red-700
//             "
//                     >
//                         Delete
//                     </button>

//                 </div>

//             </div>
//         </div>
//     );
// };

// export default DeleteDialog;
