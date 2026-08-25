import { Request, Response } from 'express';
import { SitesService } from './sites.service.js';
import { AvailabilityService } from './availability.service.js';
import { createSiteSchema, updateSiteSchema, listSitesSchema, bulkImportSchema } from './sites.validator.js';

export class SitesController {
  static async list(req: Request, res: Response) {
    const filters = listSitesSchema.parse(req.query);
    const { sites, total } = await SitesService.listSites(filters, req.ctx!);

    res.status(200).json({
      data: sites,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
      },
    });
  }

  static async get(req: Request, res: Response) {
    const site = await SitesService.getSite(req.params.id as string, req.ctx!);
    res.status(200).json(site);
  }

  static async create(req: Request, res: Response) {
    const data = createSiteSchema.parse(req.body);
    const site = await SitesService.createSite(data, req.ctx!);
    res.status(201).json(site);
  }

  static async update(req: Request, res: Response) {
    const data = updateSiteSchema.parse(req.body);
    const site = await SitesService.updateSite(req.params.id as string, data, req.ctx!);
    res.status(200).json(site);
  }

  static async bulkImport(req: Request, res: Response) {
    const data = bulkImportSchema.parse(req.body);
    const result = await SitesService.bulkImportSites(data.sites, req.ctx!);
    res.status(200).json(result);
  }

  static async searchAvailability(req: Request, res: Response) {
    const fromDate = new Date(req.query.fromDate as string);
    const toDate = new Date(req.query.toDate as string);
    const city = req.query.city as string | undefined;

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      res.status(400).json({ error: 'Invalid dates' });
      return;
    }

    const sites = await AvailabilityService.searchAvailableSites({ fromDate, toDate, city }, req.ctx!);
    res.status(200).json(sites);
  }

  static async getCalendar(req: Request, res: Response) {
    const fromDate = new Date(req.query.fromDate as string);
    const toDate = new Date(req.query.toDate as string);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      res.status(400).json({ error: 'Invalid dates' });
      return;
    }

    const bookings = await AvailabilityService.getSiteCalendar(req.params.id as string, fromDate, toDate, req.ctx!);
    res.status(200).json(bookings);
  }
}
