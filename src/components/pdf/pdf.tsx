import { Document, Page, Text, StyleSheet } from '@react-pdf/renderer';

export interface PDFFormData {
  client: string;
  text: string;
  materialPrice:number;
  inputs:number;
  labor:number;
  total: number
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    width: 597,
    height:842
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  field: {
    marginBottom: 10
  }
});

const PdfDocument = ({ formData }: { formData: PDFFormData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Documento</Text>
      <Text style={styles.field}>Cliente: {formData.client}</Text>
      <Text style={styles.field}>{formData.text}</Text>
      <Text style={styles.field}>Precio materiales: {formData.materialPrice}</Text>
      <Text style={styles.field}>Insumos: {formData.inputs}</Text>
      <Text style={styles.field}>Mano de obra: {formData.labor}</Text>
      <Text style={styles.field}>Total: {formData.total}</Text>
    </Page>
  </Document>
);

export default PdfDocument