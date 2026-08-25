import { Request, Response } from 'express';
import { PurchaseOrdersService } from './purchase-orders.service.js';
import { createPurchaseOrderSchema, updatePurchaseOrderStatusSchema, listPurchaseOrdersSchema } from './purchase-orders.validator.js';

export class PurchaseOrdersController {
  static async list(req: Request, res: Response) {
    const filters = listPurchaseOrdersSchema.parse(req.query);
    const { purchaseOrders, total } = await PurchaseOrdersService.list(filters, req.ctx!);

    res.status(200).json({
      data: purchaseOrders,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
      },
    });
  }

  static async get(req: Request, res: Response) {
    const po = await PurchaseOrdersService.get(req.params.id as string, req.ctx!);
    res.status(200).json(po);
  }

  static async create(req: Request, res: Response) {
    const data = createPurchaseOrderSchema.parse(req.body);
    const po = await PurchaseOrdersService.create(data, req.ctx!);
    res.status(201).json(po);
  }

  static async updateStatus(req: Request, res: Response) {
    const { status } = updatePurchaseOrderStatusSchema.parse(req.body);
    const po = await PurchaseOrdersService.updateStatus(req.params.id as string, status, req.ctx!);
    res.status(200).json(po);
  }

  static async downloadPDF(req: Request, res: Response) {
    const pdfBuffer = await PurchaseOrdersService.generatePDF(req.params.id as string, req.ctx!);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=PO-${req.params.id}.pdf`);
    res.send(pdfBuffer);
  }
}
