import { User, FileText, Package, Wrench, Save, Loader2, ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formDataSchema, FormData } from "@/schemas/formDataSchema";
import { calcBudgetTotal, calcIva } from "@/lib/budgetTotals";
import { compressBudgetImage } from "@/lib/compressBudgetImage";
import { toast } from 'sonner';

interface Props {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onGenerateAndSave: () => void;
  isGenerating: boolean;
  images: File[];
  setImages: (images: File[]) => void;
  isCompressingImages: boolean;
  setIsCompressingImages: (isCompressing: boolean) => void;
}

const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function PdfForm({
  formData,
  setFormData,
  onGenerateAndSave,
  isGenerating,
  images,
  setImages,
  isCompressingImages,
  setIsCompressingImages,
}: Props) {

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasInteracted, setHasInteracted] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = images.map((image) => URL.createObjectURL(image));
    setImagePreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  useEffect(() => {
    // Solo validar después de que el usuario haya interactuado con el formulario
    if (!hasInteracted) return;
    
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
  }, [formData, hasInteracted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Marcar que el usuario ha interactuado con el formulario
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    const includeIva =
      type === "checkbox" && name === "includeIva"
        ? (e.target as HTMLInputElement).checked
        : formData.includeIva;
    
    const updated: FormData = {
      ...formData,
      includeIva,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : name === "materialPrice" || name === "labor"
        ? parseFloat(value) 
        : value
    };
    updated.iva = calcIva(Number(updated.labor) || 0, updated.includeIva);
    setFormData(updated);
  };

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!selectedFiles.length) return;

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      toast.error(`Podés agregar hasta ${MAX_IMAGES} imágenes.`);
      return;
    }

    const invalidType = selectedFiles.find((file) => file.type !== 'image/jpeg' && file.type !== 'image/png');
    if (invalidType) {
      toast.error('Elegí imágenes en formato JPG o PNG.');
      return;
    }

    const oversized = selectedFiles.find((file) => file.size > MAX_IMAGE_SIZE);
    if (oversized) {
      toast.error('Cada imagen original puede pesar hasta 5 MB.');
      return;
    }

    setIsCompressingImages(true);
    try {
      const compressedFiles = await Promise.all(selectedFiles.map(compressBudgetImage));
      const tooLarge = compressedFiles.find((file) => file.size > MAX_IMAGE_SIZE);
      if (tooLarge) {
        toast.error('Una imagen sigue superando los 5 MB después de comprimirla.');
        return;
      }
      setImages([...images, ...compressedFiles]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudieron comprimir las imágenes.');
    } finally {
      setIsCompressingImages(false);
    }
  };

  const inputFields = [
    {
      name: 'materialPrice',
      label: 'Materiales',
      type: 'number',
      icon: Package,
      value: formData.materialPrice,
      prefix: '$',
      readOnly: false
    },
    {
      name: 'labor',
      label: 'Mano de obra',
      type: 'number',
      icon: Wrench,
      value: formData.labor,
      prefix: '$',
      readOnly: false
    },
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

        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="budget-images">
                Imágenes de referencia
              </label>
              <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                Hasta 6 imágenes JPG o PNG. Se comprimen antes de agregarse al PDF.
              </p>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-[var(--foreground-muted)]">
              {images.length}/{MAX_IMAGES}
            </span>
          </div>
          <label
            htmlFor="budget-images"
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--input-bg)] px-4 py-4 text-sm font-medium text-[var(--foreground-secondary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] ${images.length >= MAX_IMAGES || isCompressingImages || isGenerating ? 'pointer-events-none opacity-50' : ''}`}
          >
            {isCompressingImages ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            <span>{isCompressingImages ? 'Comprimiendo imágenes…' : 'Seleccionar imágenes'}</span>
          </label>
          <input
            id="budget-images"
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleImageSelection}
            disabled={images.length >= MAX_IMAGES || isCompressingImages || isGenerating}
            className="sr-only"
          />
          {images.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image, index) => (
                <li key={`${image.name}-${index}`} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--input-bg)]">
                  <div className="relative aspect-[4/3] bg-white">
                    {imagePreviews[index] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreviews[index]} alt={`Vista previa de ${image.name}`} className="h-full w-full object-contain" />
                    )}
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, imageIndex) => imageIndex !== index))}
                      disabled={isGenerating || isCompressingImages}
                      aria-label={`Quitar ${image.name}`}
                      className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white transition-colors hover:bg-black disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 px-2.5 py-2 text-xs text-[var(--foreground-secondary)]">
                    <span className="truncate" title={image.name}>{image.name}</span>
                    <span className="shrink-0 tabular-nums">{(image.size / 1024).toFixed(0)} KB</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
                  readOnly={field.readOnly}
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

        <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3">
          <label htmlFor="includeIva" className="text-sm font-medium text-[var(--foreground)]">
            Incluir I.V.A. (21% sobre mano de obra)
          </label>
          <input
            type="checkbox"
            name="includeIva"
            id="includeIva"
            checked={formData.includeIva}
            onChange={handleChange}
            className="h-5 w-5 accent-[var(--primary)] cursor-pointer"
          />
        </div>

        {formData.includeIva && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]" htmlFor="iva">
              I.V.A. (21%)
            </label>
            <div className="relative">
              <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--foreground-muted)]" />
              <span className="absolute left-10 top-1/2 transform -translate-y-1/2 text-[var(--foreground-muted)]">
                $
              </span>
              <input
                type="number"
                name="iva"
                id="iva"
                value={calcIva(formData.labor, true)}
                readOnly
                step="0.01"
                min="0"
                className="
                  w-full pl-16 pr-4 py-3 
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
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-[var(--border)]">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-[var(--foreground)]">Total:</span>
            <span className="text-2xl font-bold text-[var(--primary)]">
              ${calcBudgetTotal(formData.materialPrice, formData.labor, formData.includeIva).toLocaleString()}
            </span>
          </div>
        </div>
        <button
          onClick={onGenerateAndSave}
          disabled={isGenerating || isCompressingImages || !formData.client.trim() || Object.keys(errors).length > 0}
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
          {isCompressingImages ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Comprimiendo imágenes...</span>
            </>
          ) : isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Generando PDF...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Generar y guardar PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
