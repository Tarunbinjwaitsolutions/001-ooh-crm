import { Request, Response } from 'express';
import { LeadsService } from './leads.service.js';
import { createLeadSchema, updateLeadSchema, listLeadsSchema, leadQualificationSchema } from './leads.validator.js';

export class LeadsController {
  static async list(req: Request, res: Response) {
    const filters = listLeadsSchema.parse(req.query);
    const { leads, total } = await LeadsService.listLeads(filters, req.ctx!);

    res.status(200).json({
      data: leads,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
      },
    });
  }

  static async get(req: Request, res: Response) {
    const lead = await LeadsService.getLead(req.params.id as string, req.ctx!);
    res.status(200).json(lead);
  }

  static async create(req: Request, res: Response) {
    const data = createLeadSchema.parse(req.body);
    const lead = await LeadsService.createLead(data, req.ctx!);
    res.status(201).json(lead);
  }

  static async update(req: Request, res: Response) {
    const data = updateLeadSchema.parse(req.body);
    const lead = await LeadsService.updateLead(req.params.id as string, data, req.ctx!);
    res.status(200).json(lead);
  }

  static async claim(req: Request, res: Response) {
    const lead = await LeadsService.claimLead(req.params.id as string, req.ctx!);
    res.status(200).json(lead);
  }

  static async qualify(req: Request, res: Response) {
    const data = leadQualificationSchema.parse(req.body);
    const lead = await LeadsService.qualifyLead(req.params.id as string, data, req.ctx!);
    res.status(200).json(lead);
  }
}
