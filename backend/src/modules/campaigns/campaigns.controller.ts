import { Request, Response } from 'express';
import { CampaignsService } from './campaigns.service.js';
import { z } from 'zod';

export class CampaignsController {
  static async list(req: Request, res: Response) {
    const campaigns = await CampaignsService.listCampaigns(req.ctx!);
    res.status(200).json(campaigns);
  }

  static async create(req: Request, res: Response) {
    const data = z.object({ name: z.string().trim().min(1) }).parse(req.body);
    const campaign = await CampaignsService.createCampaign(data, req.ctx!);
    res.status(201).json(campaign);
  }
}
