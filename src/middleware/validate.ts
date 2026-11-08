import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type RequestTarget = "body" | "params" | "query";

function formatIssues(issues: { path: PropertyKey[]; message: string }[]) {
  const details: Record<string, string[]> = {};

  for (const issue of issues) {
    const key = issue.path.length > 0 ? issue.path.map(String).join(".") : "_errors";
    if (!details[key]) {
      details[key] = [];
    }
    details[key].push(issue.message);
  }

  return details;
}

function validate(target: RequestTarget, schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatIssues(result.error.issues),
      });
    }

    (req as Request & Record<RequestTarget, unknown>)[target] = result.data;
    return next();
  };
}

export function validateBody(schema: ZodType) {
  return validate("body", schema);
}

export function validateParams(schema: ZodType) {
  return validate("params", schema);
}

export function validateQuery(schema: ZodType) {
  return validate("query", schema);
}
