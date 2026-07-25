import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateCertificatePdf(opts: {
  studentName: string;
  courseTitle: string;
  issuedAt: Date;
  serial: string;
}): Promise<Uint8Array> {
  const { studentName, courseTitle, issuedAt, serial } = opts;

  const doc = await PDFDocument.create();
  const page = doc.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();

  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);

  const brand = rgb(0.427, 0.357, 0.816); // #6D5BD0
  const dark = rgb(0.12, 0.12, 0.16);
  const gray = rgb(0.45, 0.45, 0.5);

  // Border
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: brand,
    borderWidth: 3,
  });

  const centerText = (text: string, y: number, font = regular, size = 14, color = dark) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y, size, font, color });
  };

  centerText("TRAINIZE", height - 90, bold, 22, brand);
  centerText("Certificate of Completion", height - 130, bold, 30, dark);
  centerText("This certifies that", height - 190, regular, 14, gray);
  centerText(studentName, height - 235, bold, 28, dark);
  centerText("has successfully completed the course", height - 275, regular, 14, gray);
  centerText(courseTitle, height - 315, bold, 20, brand);

  const dateStr = issuedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  centerText(`Issued on ${dateStr}`, height - 360, regular, 12, gray);
  centerText(`Certificate ID: ${serial}`, 60, regular, 10, gray);

  return doc.save();
}
