import type { NextFunction, Request, Response } from "express";
import prisma from "../../prisma/client.ts";

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

    const announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        price,
        category,
        userId,
      },
      include: announcementInclude,
    });

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

    const updated = await prisma.announcement.update({
      where: { id },
      data: req.body,
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
