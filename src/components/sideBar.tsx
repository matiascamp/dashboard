import Image from "next/image";
import Link from "next/link";
import { Calculator, FileText, TrendingUp, LogOut } from "lucide-react";

const SideBar = () => {
    const menuItems = [
        {
            href: "/movements",
            icon: Calculator,
            label: "Asiento contable",
            description: "Gestionar movimientos contables"
        },
        {
            href: "/budgets",
            icon: FileText,
            label: "Presupuestos",
            description: "Crear y gestionar presupuestos"
        },
        {
            href: "/incoming-outcoming",
            icon: TrendingUp,
            label: "Ingresos/Egresos",
            description: "Registrar movimientos financieros"
        }
    ];

    return (
        <aside className="h-screen w-80 bg-[var(--sidebar-bg)] text-[var(--sidebar-foreground)] flex flex-col animate-slide-in">
            {/* Header */}
            <header className="p-8 border-b border-white/10">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
                        <div className="relative bg-white rounded-2xl p-2">
                            <Image 
                                src="/logo.jpg" 
                                alt="Herrería del Plata" 
                                width={80} 
                                height={80}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            Herrería del Plata
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Sistema de gestión
                        </p>
                    </div>
                </div>
            </header>

            {/* User Info */}
            <div className="px-8 py-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        U
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">Usuario</p>
                        <p className="text-xs text-gray-400">Administrador</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-6 space-y-2">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Navegación
                </h2>
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="
                                group flex items-start space-x-3 px-4 py-3 rounded-xl
                                text-gray-300 hover:text-white
                                hover:bg-white/10
                                transition-all duration-200
                                hover:translate-x-1
                            "
                        >
                            <IconComponent 
                                size={20} 
                                className="mt-0.5 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" 
                            />
                            <div>
                                <div className="font-medium group-hover:text-white transition-colors">
                                    {item.label}
                                </div>
                                <div className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                                    {item.description}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <footer className="p-6 border-t border-white/10">
                <button className="
                    flex items-center space-x-3 w-full px-4 py-3 rounded-xl
                    text-gray-300 hover:text-white
                    hover:bg-red-500/20
                    transition-all duration-200
                    group
                ">
                    <LogOut 
                        size={18} 
                        className="text-gray-400 group-hover:text-red-400 transition-colors duration-200" 
                    />
                    <span className="font-medium">Cerrar sesión</span>
                </button>
            </footer>
        </aside>
    );
};

export default SideBar;