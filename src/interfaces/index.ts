

type originalProps = {
    year?: string |number | undefined;
    month?: string | number | undefined;
    pdfUrl?: string ;
}

type InfoRow = {
    original: originalProps
}

export interface Info {
    row: InfoRow;
    getValue: () => string | number | Date
}

export interface DataProps {
    amount?: number;
    description?: string;
    date?: string;
    name?: string;
    year?: string | number;
    month?: string | number;
    pdfUrl?: string;
    debit?: number
    havings?: number
}

export interface ColumnsProps  {
    accessorKey: string;
    header: string;
}