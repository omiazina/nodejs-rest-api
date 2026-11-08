import { Router } from "express";
import { authenticate } from "../middleware/authenticate.ts";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.ts";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  getAnnouncements,
  updateAnnouncement,
} from "../controllers/announcements.controller.ts";
import {
  announcementIdParamsSchema,
  announcementsQuerySchema,
  createAnnouncementBodySchema,
  updateAnnouncementBodySchema,
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

announcementsRouter.post(
  "/",
  authenticate,
  validateBody(createAnnouncementBodySchema),
  createAnnouncement,
);

announcementsRouter.patch(
  "/:id",
  authenticate,
  validateParams(announcementIdParamsSchema),
  validateBody(updateAnnouncementBodySchema),
  updateAnnouncement,
);

announcementsRouter.delete(
  "/:id",
  authenticate,
  validateParams(announcementIdParamsSchema),
  deleteAnnouncement,
);

export default announcementsRouter;
