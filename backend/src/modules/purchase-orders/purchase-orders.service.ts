import { Types } from 'mongoose';
import { RequestContext } from '../../core/context.js';
import { NotFoundError, ValidationError } from '../../core/errors/index.js';
import { PurchaseOrder, type IPurchaseOrder } from './purchase-orders.model.js';
import { toObjectId } from '../../core/db/basePlugin.js';
import PDFDocument from 'pdfkit';

export class PurchaseOrdersService {
  static async list(
    filters: any,
    ctx: RequestContext,
  ): Promise<{ purchaseOrders: IPurchaseOrder[]; total: number }> {
    const query: Record<string, any> = { deletedAt: null };

    if (filters.search) {
      query.poNumber = { $regex: filters.search, $options: 'i' };
    }

    if (filters.status) query.status = filters.status;

    const skip = (filters.page - 1) * filters.limit;

    const [purchaseOrders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(filters.limit)
        .populate('campaignId', 'name')
        .populate('vendorId', 'name')
        .exec(),
      PurchaseOrder.countDocuments(query).exec(),
    ]);

    return { purchaseOrders, total };
  }

  static async get(id: string, ctx: RequestContext): Promise<IPurchaseOrder> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundError('PO not found');

    const po = await PurchaseOrder.findOne({ _id: toObjectId(id), deletedAt: null })
      .populate('campaignId', 'name')
      .populate('vendorId', 'name city contactPerson email mobile address gstNumber paymentTerms')
      .populate('sites.siteId', 'code city address baseCostPerDay type')
      .exec();
    
    if (!po) throw new NotFoundError('PO not found');
    return po;
  }

  static async create(data: any, ctx: RequestContext): Promise<IPurchaseOrder> {
    const count = await PurchaseOrder.countDocuments();
    const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    let totalAmount = 0;
    for (const site of data.sites) {
      totalAmount += Number(site.negotiatedRate);
    }

    const po = await PurchaseOrder.create({
      ...data,
      poNumber,
      totalAmount,
      createdBy: toObjectId(ctx.user.id),
      campaignId: toObjectId(data.campaignId),
      vendorId: toObjectId(data.vendorId),
      sites: data.sites.map((s: any) => ({ ...s, siteId: toObjectId(s.siteId) })),
    });
    return po;
  }

  static async updateStatus(id: string, status: string, ctx: RequestContext): Promise<IPurchaseOrder> {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundError('PO not found');

    const po = await PurchaseOrder.findOne({ _id: toObjectId(id), deletedAt: null });
    if (!po) throw new NotFoundError('PO not found');

    if (po.status !== 'Draft' && status === 'Draft') {
      throw new ValidationError('Cannot revert PO to Draft status.');
    }

    const updateData: any = { status, updatedBy: toObjectId(ctx.user.id) };
    
    if (status === 'Issued' && po.status === 'Draft') {
      updateData.issuedDate = new Date();
    }

    const updated = await PurchaseOrder.findOneAndUpdate(
      { _id: toObjectId(id), deletedAt: null },
      { $set: updateData },
      { new: true },
    ).exec();

    return updated!;
  }

  static async generatePDF(id: string, ctx: RequestContext): Promise<Buffer> {
    const po = await this.get(id, ctx);
    if (po.status === 'Draft') {
      throw new ValidationError('Cannot generate PDF for a Draft PO.');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text(`PURCHASE ORDER: ${po.poNumber}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${po.issuedDate?.toDateString() || new Date().toDateString()}`);
      doc.text(`Status: ${po.status}`);
      doc.moveDown();

      const vendor: any = po.vendorId;
      doc.text(`Vendor: ${vendor.name}`);
      doc.text(`Contact: ${vendor.contactPerson} (${vendor.mobile})`);
      doc.text(`Address: ${vendor.address}, ${vendor.city}`);
      doc.moveDown();

      doc.text('Sites:', { underline: true });
      doc.moveDown();
      po.sites.forEach((site: any) => {
        doc.text(`- ${site.siteId.code} (${site.siteId.city}): ₹${site.negotiatedRate}`);
      });
      doc.moveDown();
      doc.fontSize(14).font('Helvetica-Bold').text(`Total Amount: ₹${po.totalAmount}`);

      doc.end();
    });
  }
}
