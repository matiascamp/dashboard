type originalProps = {
    id?: number;
    name?: string;
    description?: string;
    amount?: number;
    type?: "incoming" | "outcoming";
    date?: string | Date;
    year?: string | number | undefined;
    month?: string | number | undefined;
    pdfUrl?: string;
    // Allow other properties for flexibility, but type constraints should be applied where possible.
    [key: string]: unknown; 
}

type InfoRow = {
    original: originalProps
}

export interface Info {
    row: InfoRow;
    getValue: () => string | number | null | undefined
}

export interface DataProps {
    id?: number;
    amount?: number;
    description?: string;
    date?: string | Date;
    name?: string;
    type?: "incoming" | "outcoming";
    actions?: unknown; // Keeping this loose if component usage requires it
    year?: string | number;
    month?: string | number;
    pdfUrl?: string;
    debit?: number;
    havings?: number;
    [key: string]: unknown;
}

export interface ColumnsProps {
    accessorKey: string;
    header: string;
    cell?: (info: Info) => any; // Using 'any' here only if explicit typeing fails across the whole project, but it's better to use a more specific functional type.
}