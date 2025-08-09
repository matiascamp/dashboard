import Image from "next/image";

interface FormData {
  client: string;
  text: string;
  materialPrice: number;
  inputs: number;
  labor: number;
}

export default function PdfPreview({ formData }: { formData: FormData }) {

  const total = +formData.materialPrice + +formData.inputs + +formData.labor
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow w-auto">
      <h2 className="text-2xl font-bold mb-6">Vista Previa</h2>

      <div className="bg-white p-8 shadow h-[842px] w-[595px] flex flex-col justify-between">
        <div className="flex items-center justify-start">
          <Image src={"/logo.jpg"} alt="logo" width={150} height={150} />
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-center">Presupuesto</h1>
            {/* crear base de datos con contador */}
            <h3>Nº:</h3>
            {/* crear base de datos con contador */}
            <p>Fecha:{new Date().toLocaleDateString("es-ES")}</p>
            <div>
              <span>Cliente:</span>
              <span className="pl-1">{formData.client}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <span>{formData.text}</span>
          </div>
        </div>
        <footer className="mb-8">
          <div>
            <span>Precio de materiales:</span>
            <span className="pl-2">${formData.materialPrice}</span>
          </div>
          <div>
            <span>Insumos:</span>
            <span className="pl-2">${formData.inputs}</span>
          </div>
          <div>
            <span>Mano de obra:</span>
            <span className="pl-2">${formData.labor}</span>
          </div>
          <div className="mt-10">
            <p className="text-right">Total:${total}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}