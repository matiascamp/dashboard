import Image from "next/image";
import { useEffect } from "react";

interface FormData {
  budgetId: number | null;
  client: string;
  text: string;
  materialPrice: number;
  inputs: number;
  labor: number;
  total?: number
}

interface Props {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export default function PdfPreview({ formData, setFormData }: Props) {

  const total = +formData.materialPrice + +formData.inputs + +formData.labor

  useEffect(() => {
    setFormData({
      ...formData,
      total
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.materialPrice, formData.inputs, formData.labor]);

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow w-auto">
      <h2 className="text-2xl font-bold mb-6">Vista Previa</h2>

      <div className="bg-white p-8 shadow h-[842px] w-[595px] flex flex-col justify-between">
        <div className="flex items-center justify-start">
          <Image src={"/logo.jpg"} alt="logo" width={150} height={150} />
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-center ">Presupuesto</h1>
            <div className="flex items-center gap-1">
              <p className="font-semibold text-sm">Nº:</p>
              <p className="text-sm">{formData.budgetId}</p>
            </div>
            <span className="flex items-center gap-1">
              <p className="font-semibold text-sm">Fecha:</p><p className="text-sm">{new Date().toLocaleDateString("es-ES")}</p>
            </span>
            <div>
              <span className="font-semibold text-sm underlien">Cliente:</span>
              <span className="pl-1">{formData.client}</span>
            </div>
          </div>
        </div>
        <div className="mb-15 break-words whitespace-normal">
          <span className="text-sm font-semibold">{formData.text}</span>
        </div>
        <footer className="flex flex-col justify-items-end ">
          <div>
            <span className="font-bold text-sm underline">Precio de materiales:</span>
            <span className="pl-2 text-shadow-amber-50">${formData.materialPrice}</span>
          </div>
          <div>
            <span className="font-bold text-sm underline">Insumos:</span>
            <span className="pl-2 text-sm">${formData.inputs}</span>
          </div>
          <div>
            <span className="font-bold text-sm underline">Mano de obra:</span>
            <span className="pl-2 text-sm">${formData.labor}</span>
          </div>
          <div className="my-10 flex justify-end">
            <p className="text-right font-bold underline">TOTAL:</p><p className="font-bold">${total}</p>
          </div>
          <div className="font-bold text-sm text-gray-400 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Image src={"/ig_icon.svg"} alt="instagram icon" width={20} height={20} /><p>herreriadelplata</p>
            </div>
            <div>
              <Image src={"/phone_icon.svg"} alt="phone icon" width={20} height={20} />
            </div>
            <div className="flex items-center gap-2">
              <Image src={"/facebook_icon.svg"} alt="facebook icon" width={20} height={20} /><p>Herreria_del_plata</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}