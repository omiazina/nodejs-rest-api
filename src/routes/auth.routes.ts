import { Router } from "express";
import { authenticate } from "../middleware/authenticate.ts";
import {
  validateBody,
} from "../middleware/validate.ts";
import {
  login,
  logout,
  me,
  refresh,
  register,
} from "../controllers/auth.controller.ts";
import {
  loginBodySchema,
  refreshBodySchema,
  registerBodySchema,
} from "../validators/auth.validator.ts";

const authRouter = Router();

authRouter.post("/register", validateBody(registerBodySchema), register);
authRouter.post("/login", validateBody(loginBodySchema), login);
authRouter.post("/refresh", validateBody(refreshBodySchema), refresh);
authRouter.post("/logout", authenticate, logout);
authRouter.get("/me", authenticate, me);

export default authRouter;
