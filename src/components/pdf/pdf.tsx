/* eslint-disable jsx-a11y/alt-text */
// components/PdfDocument.tsx
import { Document, Page, Text, StyleSheet, View, Image  } from '@react-pdf/renderer';
import { sharedTheme } from './sharedStyles';



export interface PDFFormData {
  budgetId:number;
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
  page: {
    backgroundColor: sharedTheme.colors.gray100,
    padding: sharedTheme.spacing.p6,
  },
  container: {
    backgroundColor: sharedTheme.colors.white,
    paddingHorizontal: sharedTheme.spacing.p8,
    paddingVertical: sharedTheme.spacing.p6,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 8,
  },
  title: {
    fontSize: sharedTheme.fontSizes['3xl'],
    fontWeight: sharedTheme.fontWeights.bold,
    textAlign: 'center',
  },
  smallBold: {
    fontSize: sharedTheme.fontSizes.sm,
    fontWeight: sharedTheme.fontWeights.semibold,
  },
  small: {
    fontSize: sharedTheme.fontSizes.sm,
    fontWeight: sharedTheme.fontWeights.normal,
  },
  underline: {
    textDecoration: 'underline',
  },
  textBlock: {
    marginBottom: 15,
    wordBreak: 'break-word',
    flexWrap:'wrap'
  },
  footer: {
    flexDirection: 'column',
    paddingBottom: sharedTheme.spacing.p6
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems:'center',
    gap:"2",
    paddingBottom: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 10,
  },
  totalLabel: {
    fontWeight: sharedTheme.fontWeights.bold,
    fontSize: sharedTheme.fontSizes.base,
    textDecoration: 'underline',
    marginRight: 4,
  },
  socialContainer: {
    fontWeight: sharedTheme.fontWeights.bold,
    fontSize: sharedTheme.fontSizes.sm,
    color: sharedTheme.colors.gray400,
    flexDirection: 'column',
    gap: 4,
    marginTop: 20,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

const PdfDocument = ({ formData, images }: PdfDocumentProps) => (

  <Document pageLayout='singlePage'>
    <Page size="A4">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={images.logo} style={{ width: 150, height: 150 }} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Presupuesto</Text>
            <Text style={styles.smallBold}>Nº:{formData.budgetId}</Text>
            <Text style={styles.smallBold}>
              Fecha: {new Date().toLocaleDateString('es-ES')}
            </Text>
            <Text style={styles.smallBold}>
              Cliente: {formData.client}
            </Text>
          </View>
        </View>

        {/* Texto principal */}
        <View style={styles.textBlock}>
          <Text style={styles.smallBold}>{formData.text}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={[styles.smallBold, styles.underline]}>Precio de materiales:</Text>
            <Text style={[styles.smallBold]}>${formData.materialPrice}</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={[styles.smallBold, styles.underline]}>Insumos:</Text>
            <Text style={[styles.smallBold]}>${formData.inputs}</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={[styles.smallBold, styles.underline]}>Mano de obra:</Text>
            <Text style={[styles.smallBold]}>${formData.labor}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.smallBold}>${formData.total}</Text>
          </View>

          {/* Redes sociales */}
          <View style={styles.socialContainer}>
            <View style={styles.socialRow}>
              <Image src={images.igIcon} style={{ width: 15, height: 15 }} />
              <Text>herreriadelplata</Text>
            </View>
            <View style={styles.socialRow}>
              <Image src={images.phoneIcon} style={{ width: 15, height: 15 }} />
              <Text>Tel:</Text>
            </View>
            <View style={styles.socialRow}>
              <Image src={images.facebookIcon} style={{ width: 15, height: 15 }} />
              <Text>Herreria_del_plata</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>

);

export default PdfDocument;
