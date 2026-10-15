// const SettingsSidebar = ({
//   menuItems,
//   selectedMenu,
//   onSelect,
// }) => {
//   return (
//     <aside
//       className="
//         group
//         sticky top-4
//         z-20
//         w-12
//         shrink-0
//         overflow-hidden
//         rounded-3xl
//         bg-gradient-to-b from-blue-400 to-blue-600
//         p-1.5
//         shadow-lg
//         transition-all duration-300
//         hover:w-52
//       "
//     >
//       <ul className="space-y-1">
//         {menuItems.map((item) => {
//           const active = selectedMenu?.id === item.id;

//           return (
//             <li
//               key={item.id}
//               onClick={() => onSelect(item)}
//               className={`
//                 flex h-9 cursor-pointer items-center gap-3
//                 rounded-2xl px-2
//                 whitespace-nowrap
//                 transition-colors
//                 ${
//                   active
//                     ? "bg-white text-blue-700 font-semibold"
//                     : "text-white hover:bg-white/15"
//                 }
//               `}
//             >
//               <span className="flex h-6 w-6 shrink-0 items-center justify-center text-sm">
//                 {item.icon}
//               </span>

//               <span
//                 className="
//                   w-0 overflow-hidden opacity-0
//                   text-xs
//                   transition-all duration-300
//                   group-hover:w-auto
//                   group-hover:opacity-100
//                 "
//               >
//                 {item.label}
//               </span>
//             </li>
//           );
//         })}
//       </ul>
//     </aside>
//   );
// };

// export default SettingsSidebar;
