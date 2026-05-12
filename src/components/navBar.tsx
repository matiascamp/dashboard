'use client'
import { usePathname, useRouter } from "next/navigation"
import { ReactNode } from "react"
import { ChevronLeft } from "lucide-react"

const NavBar = ({ children }: { children: ReactNode }) => {
  const { back } = useRouter()
  const pathname = usePathname()

  const isHome = pathname === '/' || pathname === '/login'

  return (
    <div className={isHome ? "h-full" : "flex relative w-full h-full"}>
      {!isHome && (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[var(--background-secondary)]/80 backdrop-blur-lg border-b border-[var(--border)] animate-fade-in">
          <button 
            className="
              flex items-center gap-2 h-full px-6 
              text-[var(--foreground-secondary)]
              hover:text-[var(--foreground)]
              transition-all duration-200
              hover:bg-[var(--background-tertiary)]
              group
            " 
            onClick={back}
          >
            <ChevronLeft 
              size={20} 
              className="transition-transform duration-200 group-hover:-translate-x-1" 
            />
            <span className="font-medium">Atrás</span>
          </button>
        </header>
      )}
      <main className={isHome ? "h-full" : "pt-16 h-full w-full"}>
        {children}
      </main>
    </div>
  )
}

export default NavBar