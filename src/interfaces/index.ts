

type originalProps = {
    id?: number;
    name?: string;
    description?: string;
    amount?: number;
    type?: string;
    date?: string | Date;
    year?: string |number | undefined;
    month?: string | number | undefined;
    pdfUrl?: string ;
    [key: string]: unknown;
}

type InfoRow = {
    original: originalProps
}

export interface Info {
    row: InfoRow;
    getValue: () => unknown
}

export interface DataProps {
    id?: number;
    amount?: number;
    description?: string;
    date?: string | Date;
    name?: string;
    type?: string;
    actions?: unknown;
    year?: string | number;
    month?: string | number;
    pdfUrl?: string;
    debit?: number
    havings?: number
    [key: string]: unknown
}

export interface ColumnsProps  {
    accessorKey: string;
    header: string;
    cell?: (info: Info) => unknown;
}