import PDFDocument from 'pdfkit';

/**
 * PDF GENERATION SCAFFOLD.
 *
 * Quotations (B2), purchase orders (C4) and reports all render through here, so
 * every document a client receives looks like it came from the same company.
 *
 *   const buffer = await renderPdf({
 *     title: 'Quotation',
 *     reference: quote.quoteNumber,
 *     meta: [['Client', lead.companyName], ['Valid until', formatDate(quote.validUntil)]],
 *     build: (doc) => {
 *       lineItemsTable(doc, { columns, rows, totals: [['Total', quote.total]] });
 *     },
 *   });
 *
 * Then hand the buffer to `fileService.saveBuffer()`, or stream it to the client.
 */

export interface PdfBrand {
  companyName: string;
  addressLines: string[];
  email?: string;
  phone?: string;
  gstin?: string;
}

/** Replace with the client's real details once branding is signed off. */
export const DEFAULT_BRAND: PdfBrand = {
  companyName: 'Media Octus',
  addressLines: ['Mumbai, Maharashtra', 'India'],
  email: 'hello@mediaoctus.com',
};

const PAGE_MARGIN = 48;
const INK = '#0f172a';
const MUTED = '#64748b';
const RULE = '#e2e8f0';

/**
 * Formats integer paise for a document. Money is stored in paise everywhere;
 * this is one of the few places it becomes rupees, and it happens at render
 * time — never inside a calculation.
 */
export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return `INR ${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export interface RenderPdfOptions {
  title: string;
  /** Document number, e.g. MO-Q-2026-0001. */
  reference?: string;
  /** Key/value pairs rendered under the title. */
  meta?: Array<[string, string]>;
  brand?: PdfBrand;
  /** Draws the body. The header is already rendered when this runs. */
  build: (doc: PDFKit.PDFDocument) => void;
}

/** Renders a document and resolves with the finished PDF as a Buffer. */
export function renderPdf(options: RenderPdfOptions): Promise<Buffer> {
  const brand = options.brand ?? DEFAULT_BRAND;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: PAGE_MARGIN,
      // Required so the footer can revisit earlier pages and number them.
      bufferPages: true,
      info: { Title: options.title, Author: brand.companyName },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    try {
      drawHeader(doc, brand, options);
      options.build(doc);
      drawFooterOnEveryPage(doc, brand);
      doc.end();
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

function drawHeader(doc: PDFKit.PDFDocument, brand: PdfBrand, options: RenderPdfOptions) {
  doc.fillColor(INK).fontSize(16).font('Helvetica-Bold').text(brand.companyName);

  doc.fontSize(8).font('Helvetica').fillColor(MUTED);
  for (const line of brand.addressLines) doc.text(line);
  if (brand.email) doc.text(brand.email);
  if (brand.phone) doc.text(brand.phone);
  if (brand.gstin) doc.text(`GSTIN: ${brand.gstin}`);

  doc.moveDown(1.2);
  doc.fillColor(INK).fontSize(20).font('Helvetica-Bold').text(options.title.toUpperCase());

  if (options.reference) {
    doc.fontSize(10).font('Helvetica').fillColor(MUTED).text(options.reference);
  }

  if (options.meta?.length) {
    doc.moveDown(0.8);
    doc.fontSize(9);
    for (const [label, value] of options.meta) {
      doc.fillColor(MUTED).text(`${label}: `, { continued: true }).fillColor(INK).text(value);
    }
  }

  doc.moveDown(0.8);
  horizontalRule(doc);
  doc.moveDown(0.8);
}

/** A full-width divider at the current vertical position. */
export function horizontalRule(doc: PDFKit.PDFDocument) {
  const y = doc.y;
  doc
    .strokeColor(RULE)
    .lineWidth(1)
    .moveTo(PAGE_MARGIN, y)
    .lineTo(doc.page.width - PAGE_MARGIN, y)
    .stroke();
}

export interface TableColumn {
  header: string;
  /** Share of the available width. Widths should sum to roughly 1. */
  width: number;
  align?: 'left' | 'right';
}

/**
 * A line-items table with an optional totals block — the shape quotations and
 * purchase orders both need.
 */
export function lineItemsTable(
  doc: PDFKit.PDFDocument,
  params: {
    columns: TableColumn[];
    rows: string[][];
    /** Label plus an amount in **paise**. */
    totals?: Array<[string, number]>;
  },
) {
  const usableWidth = doc.page.width - PAGE_MARGIN * 2;
  const positions: number[] = [];
  let cursor = PAGE_MARGIN;

  for (const column of params.columns) {
    positions.push(cursor);
    cursor += column.width * usableWidth;
  }

  // Header row
  doc.fontSize(8).font('Helvetica-Bold').fillColor(MUTED);
  const headerY = doc.y;
  params.columns.forEach((column, index) => {
    doc.text(column.header.toUpperCase(), positions[index], headerY, {
      width: column.width * usableWidth - 8,
      align: column.align ?? 'left',
    });
  });

  doc.y = headerY + 14;
  horizontalRule(doc);
  doc.moveDown(0.5);

  // Body rows
  doc.font('Helvetica').fontSize(9).fillColor(INK);
  for (const row of params.rows) {
    // Break the page before a row runs off the bottom.
    if (doc.y > doc.page.height - 120) doc.addPage();

    const rowY = doc.y;
    let tallest = 0;

    params.columns.forEach((column, index) => {
      const width = column.width * usableWidth - 8;
      const text = row[index] ?? '';
      doc.text(text, positions[index], rowY, { width, align: column.align ?? 'left' });
      tallest = Math.max(tallest, doc.heightOfString(text, { width }));
    });

    doc.y = rowY + tallest + 6;
  }

  if (params.totals?.length) {
    doc.moveDown(0.5);
    horizontalRule(doc);
    doc.moveDown(0.5);

    for (const [label, amountPaise] of params.totals) {
      const y = doc.y;
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(MUTED)
        .text(label, PAGE_MARGIN, y, { width: usableWidth - 130, align: 'right' });
      doc
        .font('Helvetica-Bold')
        .fillColor(INK)
        .text(formatPaise(amountPaise), PAGE_MARGIN + usableWidth - 130, y, {
          width: 130,
          align: 'right',
        });
      doc.y = y + 14;
    }
  }
}

/** A simple two-column key/value block, for document metadata sections. */
export function keyValueBlock(doc: PDFKit.PDFDocument, rows: Array<[string, string]>) {
  const usableWidth = doc.page.width - PAGE_MARGIN * 2;

  for (const [label, value] of rows) {
    const y = doc.y;
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(MUTED)
      .text(label, PAGE_MARGIN, y, { width: usableWidth * 0.3 });
    doc
      .fillColor(INK)
      .text(value, PAGE_MARGIN + usableWidth * 0.3, y, { width: usableWidth * 0.7 });
    doc.y = y + 14;
  }
}

function drawFooterOnEveryPage(doc: PDFKit.PDFDocument, brand: PdfBrand) {
  const range = doc.bufferedPageRange();

  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);

    const y = doc.page.height - 34;
    const width = doc.page.width - PAGE_MARGIN * 2;

    doc
      .font('Helvetica')
      .fontSize(7)
      .fillColor(MUTED)
      .text(
        `${brand.companyName} · generated ${new Date().toLocaleDateString('en-IN')}`,
        PAGE_MARGIN,
        y,
        { width, align: 'left' },
      )
      .text(`Page ${i - range.start + 1} of ${range.count}`, PAGE_MARGIN, y, {
        width,
        align: 'right',
      });
  }
}
