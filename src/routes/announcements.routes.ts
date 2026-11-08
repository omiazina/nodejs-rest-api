import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { authenticate } from "../middleware/authenticate.ts";
import { upload } from "../middleware/upload.ts";
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
  updateAnnouncementFieldsSchema,
} from "../validators/announcements.validator.ts";

const announcementsRouter = Router();

function formatIssues(issues: { path: PropertyKey[]; message: string }[]) {
  return Object.fromEntries(
    issues.map((issue) => [
      issue.path.length > 0 ? issue.path.map(String).join(".") : "_errors",
      [issue.message],
    ]),
  );
}

function validateUpdateAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const schema = req.file
    ? updateAnnouncementFieldsSchema
    : updateAnnouncementBodySchema;
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: formatIssues(parsed.error.issues),
    });
  }

  req.body = parsed.data;
  return next();
}

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
  upload.single("image"),
  validateBody(createAnnouncementBodySchema),
  createAnnouncement,
);

announcementsRouter.patch(
  "/:id",
  authenticate,
  validateParams(announcementIdParamsSchema),
  upload.single("image"),
  validateUpdateAnnouncement,
  updateAnnouncement,
);

announcementsRouter.delete(
  "/:id",
  authenticate,
  validateParams(announcementIdParamsSchema),
  deleteAnnouncement,
);

export default announcementsRouter;
