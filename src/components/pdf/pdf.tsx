/* eslint-disable jsx-a11y/alt-text */
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

export interface PDFFormData {
  budgetId: number | null;
  client: string;
  text: string;
  materialPrice: number;
  inputs: number;
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
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 26,
    height: '100%',
    justifyContent: 'space-between'
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
    padding: 8, 
    borderRadius: 8,
    minHeight: 150,
    maxHeight: 400, // Límite visual para detectar overflow
    overflow: 'hidden'
  },
  descriptionText: {
    textAlign: 'justify',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    hyphenationCallback: (word: string,) => {
      // Forzar división de palabras largas
      if (word.length > 20) {
        return Array.from({ length: Math.ceil(word.length / 10) }, (_, i) => 
          word.slice(i * 10, (i + 1) * 10)
        );
      }
      return [word];
    }
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
    bottom: 30,
    right: 30,
    color: '#6b7280'
  }
});

// Función para dividir texto considerando límites visuales
const splitTextByContentAndLength = (text: string, maxChars: number = 1200): string[] => {
  if (!text) return [''];
  
  const pages: string[] = [];

  // Dividir por párrafos primero
  const paragraphs = text.split('\n\n');
  
  paragraphs.forEach(paragraph => {
    // Si un párrafo es muy largo, dividirlo
    if (paragraph.length > maxChars) {
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      let currentParagraphChunk = '';
      
      sentences.forEach(sentence => {
        if ((currentParagraphChunk + sentence).length <= maxChars) {
          currentParagraphChunk += (currentParagraphChunk ? ' ' : '') + sentence;
        } else {
          if (currentParagraphChunk) {
            addToPage(currentParagraphChunk, pages, maxChars);
          }
          currentParagraphChunk = sentence;
        }
      });
      
      if (currentParagraphChunk) {
        addToPage(currentParagraphChunk, pages, maxChars);
      }
    } else {
      addToPage(paragraph, pages, maxChars);
    }
  });

  return pages.length > 0 ? pages : [''];
};

const addToPage = (content: string, pages: string[], maxChars: number) => {
  if (pages.length === 0) {
    pages.push(content);
    return;
  }

  const lastPageIndex = pages.length - 1;
  const lastPageContent = pages[lastPageIndex];
  
  // Si la última página tiene espacio suficiente
  if ((lastPageContent + '\n\n' + content).length <= maxChars) {
    pages[lastPageIndex] = lastPageContent + '\n\n' + content;
  } else {
    // Crear nueva página
    pages.push(content);
  }
};

const PdfDocument = ({ formData, images }: PdfDocumentProps) => {
  const descriptionPages = splitTextByContentAndLength(formData.text, 400);

  return (
    <Document pageLayout='singlePage'>
    {descriptionPages.map((pageText, index) => (
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
                {index === 0 && 'Descripción del Trabajo'}
              </Text>
              <View style={styles.textBlock}>
                <Text>{pageText}</Text>
              </View>
            </View>

            {/* Desglose de Costos (solo en la última página) */}
            {index === descriptionPages.length - 1 && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Desglose de Costos</Text>
                  <View style={styles.costRow}>
                    <Text>Precio de materiales:</Text>
                    <Text>${formData.materialPrice.toLocaleString()}</Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text>Insumos:</Text>
                    <Text>${formData.inputs.toLocaleString()}</Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text>Mano de obra:</Text>
                    <Text>${formData.labor.toLocaleString()}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL:</Text>
                    <Text style={styles.totalValue}>${formData?.total?.toLocaleString()}</Text>
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
            <Text style={styles.pageNumber}>Página {index + 1} de {descriptionPages.length}</Text>
          </View>
        </View>
      </Page>
    ))}
  </Document>
)};

export default PdfDocument;
