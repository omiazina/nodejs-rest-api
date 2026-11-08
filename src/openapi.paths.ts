import { z } from "zod";
import { registry } from "./openapi.ts";
import {
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from "./validators/auth.validator.ts";
import {
  announcementIdParamsSchema,
  announcementsQuerySchema,
  createAnnouncementBodySchema,
  updateAnnouncementFieldsSchema,
} from "./validators/announcements.validator.ts";

const userSchema = z
  .object({
    id: z.number().int(),
    username: z.string(),
    email: z.string(),
    name: z.string(),
  })
  .openapi("User");

const userMeSchema = userSchema
  .extend({
    createdAt: z.string().datetime(),
  })
  .openapi("UserMe");

const authTokensSchema = z
  .object({
    user: userSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .openapi("AuthTokens");

const refreshTokensSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .openapi("RefreshTokens");

const announcementSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    description: z.string(),
    price: z.number(),
    category: z.string(),
    imageUrl: z.string().nullable().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    user: userSchema,
  })
  .openapi("Announcement");

const createAnnouncementMultipartSchema = createAnnouncementBodySchema
  .extend({
    image: z
      .string()
      .optional()
      .openapi({
        type: "string",
        format: "binary",
        description: "Optional announcement photo",
      }),
  })
  .openapi("CreateAnnouncementMultipart");

const updateAnnouncementMultipartSchema = updateAnnouncementFieldsSchema
  .extend({
    image: z
      .string()
      .optional()
      .openapi({
        type: "string",
        format: "binary",
        description: "Optional announcement photo",
      }),
  })
  .openapi("UpdateAnnouncementMultipart");

const announcementsListSchema = z
  .object({
    data: z.array(announcementSchema),
    pagination: z.object({
      total: z.number().int(),
      page: z.number().int(),
      totalPages: z.number().int(),
      perPage: z.number().int(),
    }),
  })
  .openapi("AnnouncementsList");

const errorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("Error");

const validationErrorSchema = z
  .object({
    error: z.string(),
    details: z.record(z.string(), z.array(z.string())),
  })
  .openapi("ValidationError");

registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User registered",
      content: {
        "application/json": {
          schema: authTokensSchema,
        },
      },
    },
    400: {
      description: "Validation failed",
      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },
    409: {
      description: "Username or email already taken",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Logged in",
      content: {
        "application/json": {
          schema: authTokensSchema,
        },
      },
    },
    400: {
      description: "Validation failed",
      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },
    401: {
      description: "Invalid credentials",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  summary: "Refresh tokens",
  request: {
    body: {
      content: {
        "application/json": {
          schema: refreshBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Tokens refreshed",
      content: {
        "application/json": {
          schema: refreshTokensSchema,
        },
      },
    },
    401: {
      description: "Invalid refresh token",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Logout",
  security: [{ bearerAuth: [] }],
  responses: {
    204: {
      description: "Logged out",
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/me",
  tags: ["Auth"],
  summary: "Current user profile",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Current user",
      content: {
        "application/json": {
          schema: userMeSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/announcements",
  tags: ["Announcements"],
  summary: "List announcements",
  request: {
    query: announcementsQuerySchema,
  },
  responses: {
    200: {
      description: "Announcements list",
      content: {
        "application/json": {
          schema: announcementsListSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Get announcement by id",
  request: {
    params: announcementIdParamsSchema,
  },
  responses: {
    200: {
      description: "Announcement",
      content: {
        "application/json": {
          schema: announcementSchema,
        },
      },
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/announcements",
  tags: ["Announcements"],
  summary: "Create announcement",
  description:
    "Accepts multipart/form-data. Photo field `image` is optional.",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: createAnnouncementMultipartSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": {
          schema: announcementSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Update own announcement",
  description:
    "Accepts multipart/form-data. At least one field or photo is required.",
  security: [{ bearerAuth: [] }],
  request: {
    params: announcementIdParamsSchema,
    body: {
      content: {
        "multipart/form-data": {
          schema: updateAnnouncementMultipartSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Updated",
      content: {
        "application/json": {
          schema: announcementSchema,
        },
      },
    },
    403: {
      description: "Access denied",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/announcements/{id}",
  tags: ["Announcements"],
  summary: "Delete own announcement",
  security: [{ bearerAuth: [] }],
  request: {
    params: announcementIdParamsSchema,
  },
  responses: {
    204: {
      description: "Deleted",
    },
    403: {
      description: "Access denied",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});
