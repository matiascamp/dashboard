import { User, FileText, Package, Wrench, Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formDataSchema, FormData } from "@/schemas/formDataSchema";

interface FormDataProps {
  budgetId: number | null;
  client: string;
  text: string;
  materialPrice: number;
  inputs: number;
  labor: number;
}

interface Props {
  formData: FormDataProps;
  setFormData: (data: FormData) => void;
  onDownload: () => void;
  isGenerating: boolean;
}

export default function PdfForm({ formData, setFormData, onDownload, isGenerating }: Props) {

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const result = formDataSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as string;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
    } else {
      setErrors({});
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "materialPrice" || name === "inputs" || name === "labor"
        ? parseFloat(value) || 0
        : value
    });
  };

  const inputFields = [
    {
      name: 'materialPrice',
      label: 'Materiales',
      type: 'number',
      icon: Package,
      value: formData.materialPrice,
      prefix: '$'
    },
    {
      name: 'inputs',
      label: 'Insumos',
      type: 'number',
      icon: Package,
      value: formData.inputs,
      prefix: '$'
    },
    {
      name: 'labor',
      label: 'Mano de obra',
      type: 'number',
      icon: Wrench,
      value: formData.labor,
      prefix: '$'
    }
  ];

  return (
    <div className="w-full bg-[var(--card-bg)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border)] animate-scale-in">
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
            <FileText className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Datos del Presupuesto</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="client">
            Cliente
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/3 transform -translate-y-1/2 h-5 w-5 text-[var(--foreground-muted)]" />
            <input
              type="text"
              name="client"
              id="client"
              value={formData.client}
              onChange={handleChange}
              placeholder="Nombre completo del cliente"
              className="
                w-full pl-10 pr-4 py-3 
                bg-[var(--input-bg)] 
                border border-[var(--border)]
                rounded-xl
                text-[var(--foreground)]
                placeholder:text-[var(--foreground-muted)]
                focus:border-[var(--primary)]
                focus:ring-0
                transition-all duration-200
              "
            />
                 {errors.client && <p className="absolute text-red-500 text-sm mt-1">{errors.client}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="text">
            Descripción del trabajo
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-5 w-5 text-[var(--foreground-muted)]" />
            <textarea
              name="text"
              id="text"
              value={formData.text}
              onChange={handleChange}
              placeholder="Detalle completo del trabajo a realizar..."
              rows={4}
              className="
                w-full pl-10 pr-4 py-3 
                bg-[var(--input-bg)] 
                border border-[var(--border)]
                rounded-xl
                text-[var(--foreground)]
                placeholder:text-[var(--foreground-muted)]
                focus:border-[var(--primary)]
                focus:ring-0
                transition-all duration-200
                resize-none
              "
            />
            {errors.text && <p className="absolute text-red-500 text-sm mt-1">{errors.text}</p>}
          </div>
        </div>

        {inputFields.map((field) => {
          const IconComponent = field.icon;
          return (
            <div key={field.name} className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]" htmlFor={field.name}>
                {field.label}
              </label>
              <div className="relative">
                <IconComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--foreground-muted)]" />
                {field.prefix && (
                  <span className="absolute left-10 top-1/2 transform -translate-y-1/2 text-[var(--foreground-muted)]">
                    {field.prefix}
                  </span>
                )}
                <input
                  type={field.type}
                  name={field.name}
                  id={field.name}
                  value={field.value}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`
                    w-full ${field.prefix ? 'pl-16' : 'pl-10'} pr-4 py-3 
                    bg-[var(--input-bg)] 
                    border border-[var(--border)]
                    rounded-xl
                    text-[var(--foreground)]
                    placeholder:text-[var(--foreground-muted)]
                    focus:border-[var(--primary)]
                    focus:ring-0
                    transition-all duration-200
                  `}
                />
                   {errors[field.name] && (
                  <p className="absolute text-red-500 text-sm mt-1">{errors[field.name]}</p>
                )}
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t border-[var(--border)]">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-[var(--foreground)]">Total:</span>
            <span className="text-2xl font-bold text-[var(--primary)]">
              ${(formData.materialPrice + formData.inputs + formData.labor).toLocaleString()}
            </span>
          </div>
        </div>
        <button
          onClick={onDownload}
          disabled={isGenerating || !formData.client.trim() ||  Object.keys(errors).length > 0}
          className="
            w-full flex items-center justify-center space-x-2 py-3 px-4
            bg-[var(--primary)] hover:bg-[var(--primary-hover)]
            text-[var(--primary-foreground)] font-semibold
            rounded-xl
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            transform hover:scale-[1.02] active:scale-[0.98]
          "
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Generando PDF...</span>
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              <span>Descargar PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}