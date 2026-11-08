import type { NextFunction, Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import logger from "../logger.ts";
import { uploadImageToCloudinary } from "../utils/cloudinary.ts";

const PER_PAGE = 10;

const userSelect = {
  id: true,
  username: true,
  email: true,
  name: true,
} as const;

const announcementInclude = {
  user: {
    select: userSelect,
  },
} as const;

async function resolveImageUrl(req: Request) {
  if (!req.file) {
    return undefined;
  }

  const imageUrl = await uploadImageToCloudinary(req.file.path);
  logger.info(
    { filename: req.file.filename, imageUrl },
    "Announcement photo uploaded",
  );
  return imageUrl;
}

export async function getAnnouncements(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, search, sort } = req.query as unknown as {
      page: number;
      search?: string;
      sort: "newest" | "oldest";
    };

    const where =
      search && search.trim() !== ""
        ? {
            title: {
              contains: search.trim(),
              mode: "insensitive" as const,
            },
          }
        : {};

    const orderBy = {
      createdAt: sort === "oldest" ? ("asc" as const) : ("desc" as const),
    };

    const skip = (page - 1) * PER_PAGE;

    const [total, data] = await Promise.all([
      prisma.announcement.count({ where }),
      prisma.announcement.findMany({
        where,
        orderBy,
        skip,
        take: PER_PAGE,
        include: announcementInclude,
      }),
    ]);

    const totalPages = Math.ceil(total / PER_PAGE);

    return res.status(200).json({
      data,
      pagination: {
        total,
        page,
        totalPages,
        perPage: PER_PAGE,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAnnouncementById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as unknown as { id: number };

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: announcementInclude,
    });

    if (!announcement) {
      return res.status(404).json({ error: "Resource not found" });
    }

    return res.status(200).json(announcement);
  } catch (error) {
    return next(error);
  }
}

export async function createAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.sub;
    const { title, description, price, category } = req.body;
    const imageUrl = await resolveImageUrl(req);

    const announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        price,
        category,
        imageUrl,
        userId,
      },
      include: announcementInclude,
    });

    logger.info(
      { announcementId: announcement.id, userId },
      "Announcement created",
    );

    return res.status(201).json(announcement);
  } catch (error) {
    return next(error);
  }
}

export async function updateAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.sub;
    const { id } = req.params as unknown as { id: number };

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return res.status(404).json({ error: "Resource not found" });
    }

    if (announcement.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const imageUrl = await resolveImageUrl(req);
    const { title, description, price, category } = req.body;

    const data: {
      title?: string;
      description?: string;
      price?: number;
      category?: string;
      imageUrl?: string;
    } = {};

    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = price;
    if (category !== undefined) data.category = category;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: {
          _errors: ["At least one field must be provided"],
        },
      });
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data,
      include: announcementInclude,
    });

    return res.status(200).json(updated);
  } catch (error) {
    return next(error);
  }
}

export async function deleteAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.sub;
    const { id } = req.params as unknown as { id: number };

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return res.status(404).json({ error: "Resource not found" });
    }

    if (announcement.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.announcement.delete({
      where: { id },
    });

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
