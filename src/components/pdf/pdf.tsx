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
  titleSection: { flexDirection: 'column', gap: 4 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'left' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  section: { marginVertical:15, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 4 },
  textBlock: { backgroundColor: '#f3f4f6', padding: 8, borderRadius: 8, minHeight: 150 },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingVertical: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111827', padding: 12, borderRadius: 8 },
  totalLabel: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  totalValue: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  footer: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12, gap: 4 },
  socialRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});

const PdfDocument = ({ formData, images }: PdfDocumentProps) => (
  <Document pageLayout='singlePage'>
    <Page size="A4">
      <View style={styles.container}>
        <View style={styles.innerCard}>
          {/* Header */}
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
                <Text>{new Date().toLocaleDateString('es-ES')}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text>Cliente:</Text>
                <Text>{formData.client || 'Sin especificar'}</Text>
              </View>
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción del Trabajo</Text>
            <View style={styles.textBlock}>
              <Text>{formData.text || 'No hay descripción disponible...'}</Text>
            </View>
          </View>

          {/* Desglose de Costos */}
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

          {/* Footer */}
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

        </View>
      </View>
    </Page>
  </Document>
);

export default PdfDocument;
