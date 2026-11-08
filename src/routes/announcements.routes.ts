import { Router } from "express";
import {
  validateParams,
  validateQuery,
} from "../middleware/validate.ts";
import {
  getAnnouncementById,
  getAnnouncements,
} from "../controllers/announcements.controller.ts";
import {
  announcementIdParamsSchema,
  announcementsQuerySchema,
} from "../validators/announcements.validator.ts";

const announcementsRouter = Router();

announcementsRouter.get(
  "/",
  validateQuery(announcementsQuerySchema),
  getAnnouncements,
);

announcementsRouter.get(
  "/:id",
  validateParams(announcementIdParamsSchema),
  getAnnouncementById,
);

export default announcementsRouter;
