// import { useLogout } from "@features/auth/useLogout";
import { Sidebar } from "../components/Sidebar";

// export function Workspace () {
//     const logout = useLogout();
//     return (
//         <>

//        <Sidebar />
//         <button onClick={logout}     className="
//     fixed right-6 top-6
//     rounded-lg bg-orange-500 px-5 py-2.5
//     font-medium text-white
//     shadow-lg shadow-orange-500/20
//     transition-all duration-200
//     hover:-translate-y-0.5 hover:bg-orange-400
//     active:translate-y-0
//   "
// >Log out</button>
//         </>
//     )
// }
export function Workspace() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8 text-gray-400">Select a note</main>
    </div>
  );
}