/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

export interface PDFFormData {
  budgetId: number | null;
  client: string;
  text: string;
  materialPrice: number;
  labor: number;
  total?: number;
  /** ISO; fecha de emisión al generar el PDF */
  issueDate?: string;
}

interface PdfDocumentProps {
  formData: PDFFormData;
  images: {
    logo: string;
    igIcon: string;
    phoneIcon: string;
    facebookIcon: string;
  };
}

const styles = StyleSheet.create({
  /** Flujo vertical sin forzar altura completa (evita solapamiento con costos/pie) */
  container: {
    flexDirection: 'column',
    gap: 14,
    paddingBottom: 40,
  },
  innerCard: {
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 15
  },
  titleSection: { flexDirection: 'column', gap: 4, fontSize: 14 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'left' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4,fontSize: 14 },
  section: { marginVertical:15, gap: 8},
  sectionTitle: { fontSize: 16, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 4 },
  textBlock: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
  },
  descriptionText: {
    fontSize: 11,
    lineHeight: 1.45,
    textAlign: 'justify',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    hyphenationCallback: (word: string) => {
      if (word.length > 20) {
        return Array.from({ length: Math.ceil(word.length / 10) }, (_, i) =>
          word.slice(i * 10, (i + 1) * 10)
        );
      }
      return [word];
    },
  },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111827', padding: 12, borderRadius: 8 },
  totalLabel: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  totalValue: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  footer: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12, gap: 4 },
  socialRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pageNumber: {
    position: 'absolute',
    fontSize: 12,
    bottom: 0,
    right: 30,
    color: '#6b7280'
  }
});

/**
 * Cupos de caracteres por tipo de hoja (A4, @react-pdf/renderer).
 * Con ellos se reparte TODO el texto en tantas hojas como haga falta (sin límite de páginas).
 */
const PDF_PAGE_TEXT_BUDGETS = {
  /** Todo cabe en una sola hoja: encabezado + texto + costos + pie */
  singlePage: 1280,
  /** Primera hoja (con encabezado): más texto antes del salto a la hoja 2 */
  firstPage: 1180,
  /** Hojas intermedias: solo descripción (más espacio vertical) */
  middlePage: 1550,
  /** Última hoja: cola de descripción + costos + pie (reservar espacio al bloque fijo) */
  lastPage: 620,
} as const;

/** Tope de seguridad por si el texto fuera enorme (evita bucles teóricos) */
const MAX_DESCRIPTION_PAGES = 10_000;

/** Corta respetando párrafos (doble salto de línea), saltos simples y espacios */
const takeTextChunk = (text: string, maxLen: number): string => {
  if (text.length <= maxLen) return text;
  const slice = text.slice(0, maxLen);
  const minIdx = Math.floor(maxLen * 0.32);

  let cut = slice.lastIndexOf('\n\n');
  if (cut >= minIdx) return text.slice(0, cut + 2);

  cut = slice.lastIndexOf('\n');
  if (cut >= minIdx) return text.slice(0, cut + 1);

  cut = slice.lastIndexOf(' ');
  if (cut >= minIdx) return text.slice(0, cut + 1);

  return text.slice(0, maxLen);
};

/**
 * Reparte el texto del textarea en N segmentos (uno por hoja de descripción).
 * - Hoja 1: cabecera del presupuesto + inicio del texto.
 * - Hojas 2…N-1: solo texto (tantas como haga falta).
 * - Hoja N: cierre del texto + desglose de costos + pie (en el JSX).
 *
 * No hay tope de páginas: el bucle consume `rest` hasta que lo que queda
 * cabe en la última hoja junto a costos/pie (`lastPage`).
 */
const splitDescriptionForPdfPages = (raw: string): string[] => {
  const text = (raw ?? '').replace(/\r\n/g, '\n');
  if (!text.trim()) return [''];

  const { singlePage, firstPage, middlePage, lastPage } = PDF_PAGE_TEXT_BUDGETS;

  if (text.length <= singlePage) {
    return [text];
  }

  const segments: string[] = [];
  let rest = text;

  const first = takeTextChunk(rest, firstPage);
  segments.push(first);
  rest = rest.slice(first.length).replace(/^[ \t]+/, '');

  let guard = 0;
  while (rest.length > lastPage) {
    if (++guard > MAX_DESCRIPTION_PAGES) {
      console.warn('[pdf] MAX_DESCRIPTION_PAGES alcanzado; se fuerza el resto en una hoja.');
      segments.push(rest);
      return segments;
    }
    const upperBudget =
      rest.length <= middlePage && rest.length > lastPage
        ? rest.length - lastPage
        : middlePage;
    const chunk = takeTextChunk(rest, Math.max(upperBudget, 1));
    if (chunk.length === 0) {
      segments.push(rest.slice(0, 1));
      rest = rest.slice(1);
      continue;
    }
    segments.push(chunk);
    rest = rest.slice(chunk.length).replace(/^[ \t]+/, '');
  }

  if (rest.length > 0) {
    segments.push(rest);
  }

  return segments;
};

const PdfDocument = ({ formData, images }: PdfDocumentProps) => {
  const descriptionSegments = splitDescriptionForPdfPages(formData.text);
  const totalPages = descriptionSegments.length;
  const material = Number(formData.materialPrice) || 0;
  const labor = Number(formData.labor) || 0;
  const total = formData.total ?? material + labor;

  return (
    <Document>
    {descriptionSegments.map((pageText, index) => (
      <Page size="A4" key={index}>
        <View style={styles.container}>
          <View style={styles.innerCard}>
            {/* Header (solo en la primera página) */}
            {index === 0 && (
              <View style={styles.header}>
                <Image src={images.logo} style={{ width: 100, height: 100 }} />
                <View style={styles.titleSection}>
                  <Text style={styles.title}>PRESUPUESTO</Text>
                  <View style={styles.infoRow}>
                    <Text>Nº:</Text>
                    <Text>{formData.budgetId ?? '---'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text>Fecha:</Text>
                    <Text>
                      {(formData.issueDate
                        ? new Date(formData.issueDate)
                        : new Date()
                      ).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text>Cliente:</Text>
                    <Text>{formData.client || 'Sin especificar'}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Descripción del Trabajo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {index === 0
                  && 'Descripción del Trabajo'}
              </Text>
              <View style={styles.textBlock}>
                <Text style={styles.descriptionText}>{pageText}</Text>
              </View>
            </View>

            {/* Desglose de Costos (solo en la última página) */}
            {index === totalPages - 1 && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Desglose de Costos</Text>
                  <View style={styles.costRow}>
                    <Text>Precio de materiales:</Text>
                    <Text>${material.toLocaleString()}</Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text>Mano de obra:</Text>
                    <Text>${labor.toLocaleString()}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL:</Text>
                    <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
                  </View>
                </View>

                {/* Footer (solo en la última página) */}
                <View style={styles.footer}>
                  <View style={styles.socialRow}>
                    <Image src={images.igIcon} style={{ width: 16, height: 16 }} />
                    <Text>@herreriadelplata</Text>
                  </View>
                  <View style={styles.socialRow}>
                    <Image src={images.phoneIcon} style={{ width: 16, height: 16 }} />
                    <Text>Contacto telefónico disponible</Text>
                  </View>
                  <View style={styles.socialRow}>
                    <Image src={images.facebookIcon} style={{ width: 16, height: 16 }} />
                    <Text>Herreria_del_plata</Text>
                  </View>
                </View>
              </>
            )}

            {/* Número de página */}
            <Text style={styles.pageNumber}>Página {index + 1} de {totalPages}</Text>
          </View>
        </View>
      </Page>
    ))}
  </Document>
)};

export default PdfDocument;
