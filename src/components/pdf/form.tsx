

interface FormData {
  budgetId: number | null;
  client: string;
  text: string;
  materialPrice: number;
  inputs: number;
  labor: number
}

interface Props {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onDownload: () => void;
  isGenerating: boolean;
}

export default function PdfForm({ formData, setFormData, onDownload, isGenerating }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Datos</h2>

      <div className="space-y-4">
        <label htmlFor="client">Cliente:</label>
        <input
          type="text"
          name="client"
          value={formData.client}
          onChange={handleChange}
          placeholder="Nombre del cliente"
          className="w-full p-3 border rounded"
        />
        <label htmlFor="text">Descripción:</label>
        <textarea
          name="text"
          value={formData.text}
          onChange={handleChange}
          placeholder="Texto"
          rows={4}
          className="w-full p-3 border rounded"
        />
        <label htmlFor="materialPrice">Materiales:</label>
        <input
          type="text"
          name="materialPrice"
          value={formData.materialPrice}
          onChange={handleChange}
          placeholder="Precio materiales"
          className="w-full p-3 border rounded"
        />
        <label htmlFor="inputs">Insumos:</label>
        <input
          type="text"
          name="inputs"
          value={formData.inputs}
          onChange={handleChange}
          placeholder="Insumos"
          className="w-full p-3 border rounded"
        />
        <label htmlFor="labor">Mano de obra:</label>
        <input
          type="text"
          name="labor"
          value={formData.labor}
          onChange={handleChange}
          placeholder="Manor de obra"
          className="w-full p-3 border rounded"
        />
        <button
          onClick={onDownload}
          disabled={isGenerating}
          className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 mt-10"
        >
          {isGenerating ? 'Generando...' : 'Descargar PDF'}
        </button>
      </div>
    </div>
  );
}