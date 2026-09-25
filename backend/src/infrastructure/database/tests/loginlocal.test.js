import { jest } from "@jest/globals";

jest.unstable_mockModule("../dbScript/db.js", () => ({
  default: {
    from: jest.fn(),
  },
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    compare: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../config/jwt.js", () => ({
  generateToken: jest.fn(),
}));

jest.unstable_mockModule("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

const { loginLocal } = await import("../../../interfaces/controllers/userController.js");
const bcrypt = (await import("bcrypt")).default;
const db = (await import("../dbScript/db.js")).default;
const { generateToken } = await import("../../../config/jwt.js");
import jwt from "jsonwebtoken";

describe("HU-02 Backend - loginLocal", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("CP-HU02-B-01: Usuario no encontrado", async () => {
    req.body = {
      correo: "noexiste@fake.com",
      password: "123456",
    };

    db.from.mockReturnValue({
      select: () => ({
        ilike: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: true }),
          }),
        }),
      }),
    });

    await loginLocal(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Usuario no encontrado",
    });
  });

  test("CP-HU02-B-02: Contraseña incorrecta", async () => {
    req.body = {
      correo: "user@pasto.com",
      password: "wrongpass",
    };

    db.from.mockReturnValue({
      select: () => ({
        ilike: () => ({
          eq: () => ({
            single: async () => ({
              data: {
                id: "1",
                username: "test",
                correo: "user@pasto.com",
                rol: "usuario",
                password_hash: "hash",
              },
              error: null,
            }),
          }),
        }),
      }),
    });

    bcrypt.compare.mockResolvedValue(false);

    await loginLocal(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Contraseña incorrecta",
    });
  });

  test("CP-HU02-B-03: Login exitoso", async () => {
    req.body = {
      correo: "user@pasto.com",
      password: "pass123",
    };

    db.from.mockReturnValue({
      select: () => ({
        ilike: () => ({
          eq: () => ({
            single: async () => ({
              data: {
                id: "1",
                username: "luna",
                correo: "user@pasto.com",
                rol: "usuario",
                password_hash: "hash",
              },
              error: null,
            }),
          }),
        }),
      }),
    });

    bcrypt.compare.mockResolvedValue(true);
    generateToken.mockReturnValue("fake-jwt");

    await loginLocal(req, res);

    expect(res.json).toHaveBeenCalledWith({
      user: {
        id: "1",
        username: "luna",
        correo: "user@pasto.com",
        rol: "usuario",
      },
      token: "fake-jwt",
    });
  });

  test("CP-HU02-B-04: Generación y verificación de JWT", () => {
    const SECRET = "test_secret";

    const payload = {
      id: "123",
      rol: "usuario",
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: "8h" });
    const decoded = jwt.verify(token, SECRET);

    expect(decoded.id).toBe(payload.id);
    expect(decoded.rol).toBe(payload.rol);
  });

  test("CP-HU02-B-05: Verificación real de hash con bcrypt", async () => {
    const realBcrypt = jest.requireActual("bcrypt");
    const password = "pass123";

    const hash = await realBcrypt.hash(password, 12);

    const isValid = await realBcrypt.compare(password, hash);
    expect(isValid).toBe(true);

    const isInvalid = await realBcrypt.compare("wrongpass", hash);
    expect(isInvalid).toBe(false);
  });
});