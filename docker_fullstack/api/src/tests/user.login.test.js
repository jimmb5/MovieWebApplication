import request from "supertest";
import app from "../index.js";
import pool from "../database.js";
import { addOne } from "../models/user_model.js";

beforeAll(async () => {
  await pool.query("DELETE FROM users");

  await addOne("testuser", "test@test.com", "Test1234");
});

afterAll(async () => {
  await pool.end();
});

describe("POST /user/login", () => {
  // Positiivinen testi
  test("onnistunut kirjautuminen → 200 + accessToken", async () => {
    const res = await request(app).post("/user/login").send({
      username: "testuser",
      password: "Test1234",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("username", "testuser");
    expect(res.body).toHaveProperty("email", "test@test.com");
    expect(res.body).toHaveProperty("id");
  });

  // Negatiiviset testit
  test("väärä salasana → 401", async () => {
    const res = await request(app).post("/user/login").send({
      username: "testuser",
      password: "väärä",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid username or password");
  });

  test("tuntematon käyttäjä → 401", async () => {
    const res = await request(app).post("/user/login").send({
      username: "unknown",
      password: "Test1234",
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid username or password");
  });

  test("ei usernamea → 400", async () => {
    const res = await request(app).post("/user/login").send({
      password: "Test1234",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Username and password are required"
    );
  });

  test("ei passwordia → 400", async () => {
    const res = await request(app).post("/user/login").send({
      username: "testuser",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Username and password are required"
    );
  });
});
