'use client'
import { PDFViewer } from "@react-pdf/renderer"
import PdfDocument from "./pdf"

const images = {
    logo: '/logo.jpg', 
    igIcon: '/instagram_icon.png', 
    phoneIcon: '/phone_icon.png',
    facebookIcon: '/facebook_icon.png'
  };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Viewer = ({formData}:any) => {
  return (
    <PDFViewer>
    <PdfDocument formData={formData} images={images}/>
    </PDFViewer>
  )
}

export default Viewer
