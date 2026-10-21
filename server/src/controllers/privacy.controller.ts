import type { RequestHandler } from 'express';
import { requireUser } from '../middleware/auth.js';
import { ok } from '../utils/http.js';
import { buildDataExport, getPrivacyOverview } from '../services/privacy.service.js';

export const privacyOverviewHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    ok(res, await getPrivacyOverview(user));
  } catch (error) {
    next(error);
  }
};

export const dataExportHandler: RequestHandler = async (req, res, next) => {
  try {
    const user = requireUser(req);
    const bundle = await buildDataExport(user);
    res.setHeader('Content-Disposition', 'attachment; filename="aurawell-export.json"');
    ok(res, bundle);
  } catch (error) {
    next(error);
  }
};
