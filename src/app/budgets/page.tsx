import Link from "next/link";
import { Plus, FileText, ArrowRight } from "lucide-react";

const Budget = () => {
  const menuOptions = [
    {
      href: "budgets/budget",
      title: "Crear Presupuesto",
      description: "Generar un nuevo presupuesto para cliente",
      icon: Plus,
      color: "from-blue-500 to-cyan-500",
      hoverColor: "hover:shadow-blue-500/25"
    },
    {
      href: "budgets/list",
      title: "Ver Presupuestos",
      description: "Revisar presupuestos creados anteriormente",
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      hoverColor: "hover:shadow-purple-500/25"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[var(--background-secondary)] to-[var(--background-tertiary)] flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-bold text-[var(--foreground)] mb-4">
          Gestión de 
          <span className="text-gradient"> Presupuestos</span>
        </h1>
        <p className="text-xl text-[var(--foreground-secondary)] max-w-2xl mx-auto">
          Cree, gestione y organice todos sus presupuestos de manera eficiente
        </p>
      </div>

      {/* Menu Cards */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl animate-scale-in">
        {menuOptions.map((option, index) => {
          const IconComponent = option.icon;
          return (
            <Link
              key={option.href}
              href={option.href}
              className={`
                group relative overflow-hidden
                bg-[var(--card-bg)] border border-[var(--border)]
                rounded-3xl p-8
                shadow-[var(--shadow-lg)] ${option.hoverColor}
                hover:shadow-2xl hover:scale-[1.02]
                transition-all duration-300
                cursor-pointer
              `}
              style={{
                animationDelay: `${index * 150}ms`
              }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`
                inline-flex p-4 rounded-2xl mb-6
                bg-gradient-to-br ${option.color}
                shadow-lg
                group-hover:scale-110 group-hover:rotate-3
                transition-transform duration-300
              `}>
                <IconComponent className="h-8 w-8 text-white" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3 group-hover:text-[var(--primary)] transition-colors duration-200">
                  {option.title}
                </h3>
                <p className="text-[var(--foreground-secondary)] text-lg leading-relaxed mb-6">
                  {option.description}
                </p>
                
                {/* Arrow */}
                <div className="flex items-center text-[var(--primary)] font-semibold group-hover:translate-x-2 transition-transform duration-200">
                  <span>Continuar</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Link>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-16 flex items-center justify-center space-x-8 text-center animate-fade-in">
        <div className="space-y-2">
          <div className="text-3xl font-bold text-[var(--primary)]">∞</div>
          <div className="text-sm text-[var(--foreground-muted)]">Presupuestos ilimitados</div>
        </div>
        <div className="w-px h-12 bg-[var(--border)]" />
        <div className="space-y-2">
          <div className="text-3xl font-bold text-[var(--primary)]">PDF</div>
          <div className="text-sm text-[var(--foreground-muted)]">Generación automática</div>
        </div>
        <div className="w-px h-12 bg-[var(--border)]" />
        <div className="space-y-2">
          <div className="text-3xl font-bold text-[var(--primary)]">⚡</div>
          <div className="text-sm text-[var(--foreground-muted)]">Interfaz rápida</div>
        </div>
      </div>
    </div>
  );
};

export default Budget;