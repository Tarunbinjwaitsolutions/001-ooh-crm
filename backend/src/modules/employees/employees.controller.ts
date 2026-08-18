import { Request, Response } from 'express';

import { UnauthorizedError } from '../../core/errors/index.js';
import { employeeService } from './employees.service.js';
import {
  createEmployeeSchema,
  employeeIdSchema,
  listEmployeesSchema,
  updateEmployeeSchema,
} from './employees.validator.js';

/**
 * REFERENCE MODULE — the controller layer.
 *
 * Parse the request, call the service, send the response. That is all.
 * No queries, no business rules, no try/catch — `asyncHandler` on the route
 * forwards rejections to the central error handler.
 */

function context(req: Request) {
  // requireAuth runs before every route here, so ctx is always present —
  // this narrows the type and fails loudly if a route is ever misconfigured.
  if (!req.ctx) throw new UnauthorizedError();
  return req.ctx;
}

export class EmployeesController {
  /** GET /api/employees */
  static async list(req: Request, res: Response) {
    const query = listEmployeesSchema.parse(req.query);
    const result = await employeeService.list(query, context(req));
    res.status(200).json(result);
  }

  /** GET /api/employees/me */
  static async me(req: Request, res: Response) {
    const employee = await employeeService.getMine(context(req));
    res.status(200).json({ employee });
  }

  /** GET /api/employees/manager-options */
  static async managerOptions(req: Request, res: Response) {
    const options = await employeeService.listManagerOptions(context(req));
    res.status(200).json({ options });
  }

  /** GET /api/employees/:id */
  static async getById(req: Request, res: Response) {
    const { id } = employeeIdSchema.parse(req.params);
    const employee = await employeeService.getById(id, context(req));
    res.status(200).json({ employee });
  }

  /** GET /api/employees/:id/reports */
  static async directReports(req: Request, res: Response) {
    const { id } = employeeIdSchema.parse(req.params);
    const employees = await employeeService.getDirectReports(id, context(req));
    res.status(200).json({ employees });
  }

  /** POST /api/employees */
  static async create(req: Request, res: Response) {
    const input = createEmployeeSchema.parse(req.body);
    const employee = await employeeService.create(input, context(req));
    res.status(201).json({ message: 'Employee created', employee });
  }

  /** PATCH /api/employees/:id */
  static async update(req: Request, res: Response) {
    const { id } = employeeIdSchema.parse(req.params);
    const input = updateEmployeeSchema.parse(req.body);
    const employee = await employeeService.update(id, input, context(req));
    res.status(200).json({ message: 'Employee updated', employee });
  }

  /** DELETE /api/employees/:id — soft delete. */
  static async deactivate(req: Request, res: Response) {
    const { id } = employeeIdSchema.parse(req.params);
    const result = await employeeService.deactivate(id, context(req));
    res.status(200).json({ message: 'Employee deactivated', ...result });
  }
}
