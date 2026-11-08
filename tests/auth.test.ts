import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import app from "../app.ts";
import {
  createAccessToken,
  createRefreshToken,
  verifyToken,
} from "../src/utils/tokens.ts";

describe("token utilities", () => {
  beforeAll(() => {
    process.env.JWT_SECRET ??= "test-secret-key";
  });

  it("creates a verifiable access token with user id in sub", () => {
    const token = createAccessToken(42);
    const payload = verifyToken(token);

    expect(Number(payload.sub)).toBe(42);
  });

  it("creates unique refresh tokens for the same user", () => {
    const first = createRefreshToken(7);
    const second = createRefreshToken(7);

    expect(first).not.toBe(second);
    expect(Number(verifyToken(first).sub)).toBe(7);
    expect(Number(verifyToken(second).sub)).toBe(7);
  });
});

describe("password hashing", () => {
  it("hashes a password and validates it with bcrypt.compare", async () => {
    const password = "secret12";
    const hash = await bcrypt.hash(password, 10);

    expect(hash).not.toBe(password);
    await expect(bcrypt.compare(password, hash)).resolves.toBe(true);
    await expect(bcrypt.compare("wrong-password", hash)).resolves.toBe(false);
  });
});

describe("POST /auth/register and /auth/login", () => {
  const suffix = Date.now();
  const user = {
    username: `test_user_${suffix}`,
    email: `test_user_${suffix}@example.com`,
    password: "secret12",
    name: "Test User",
  };

  it("returns 201 with tokens for valid registration data", async () => {
    const response = await request(app).post("/auth/register").send(user);

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      username: user.username,
      email: user.email,
      name: user.name,
    });
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
  });

  it("returns 401 for login with invalid password", async () => {
    const response = await request(app).post("/auth/login").send({
      username: user.username,
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid credentials" });
  });
});
