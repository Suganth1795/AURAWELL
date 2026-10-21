import { Router } from 'express';
import {
  dataExportHandler,
  privacyOverviewHandler,
} from '../controllers/privacy.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const privacyRouter = Router();

privacyRouter.use(requireAuth);
privacyRouter.get('/overview', privacyOverviewHandler);
privacyRouter.get('/export', dataExportHandler);
