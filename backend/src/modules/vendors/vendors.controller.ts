import { Request, Response } from 'express';
import { VendorsService } from './vendors.service.js';
import { createVendorSchema, updateVendorSchema, listVendorsSchema } from './vendors.validator.js';

export class VendorsController {
  static async list(req: Request, res: Response) {
    const filters = listVendorsSchema.parse(req.query);
    const { vendors, total } = await VendorsService.listVendors(filters, req.ctx!);

    res.status(200).json({
      data: vendors,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
      },
    });
  }

  static async get(req: Request, res: Response) {
    const vendor = await VendorsService.getVendor(req.params.id as string, req.ctx!);
    res.status(200).json(vendor);
  }

  static async create(req: Request, res: Response) {
    const data = createVendorSchema.parse(req.body);
    const vendor = await VendorsService.createVendor(data, req.ctx!);
    res.status(201).json(vendor);
  }

  static async update(req: Request, res: Response) {
    const data = updateVendorSchema.parse(req.body);
    const vendor = await VendorsService.updateVendor(req.params.id as string, data, req.ctx!);
    res.status(200).json(vendor);
  }
}
