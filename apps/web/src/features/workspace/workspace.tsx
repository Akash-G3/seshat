import { useLogout } from "@features/auth/useLogout";

export function Workspace () {
    const logout = useLogout();
    return (
        <>
        <button onClick={logout}     className="
    fixed right-6 top-6
    rounded-lg bg-orange-500 px-5 py-2.5
    font-medium text-white
    shadow-lg shadow-orange-500/20
    transition-all duration-200
    hover:-translate-y-0.5 hover:bg-orange-400
    active:translate-y-0
  "
>Log out</button>
        </>
    )
}
