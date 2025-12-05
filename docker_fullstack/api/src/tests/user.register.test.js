import request from "supertest";
import app from "../index.js";
import pool from "../database.js";

beforeAll(async () => {
  await pool.query("DELETE FROM users");
});

afterAll(async () => {
  await pool.end();
});

describe("POST /user/register", () => {
  // Positiivinen testi
  test("onnistunut rekisteröityminen → 201 + käyttäjän tiedot", async () => {
    const res = await request(app).post("/user/register").send({
      username: "testuser",
      email: "test@test.com",
      password: "Test1234",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("username", "testuser");
    expect(res.body).toHaveProperty("email", "test@test.com");
    expect(res.body).toHaveProperty("created_at");
  });

  // Negatiiviset testit
  test("ei usernamea → 400", async () => {
    const res = await request(app).post("/user/register").send({
      email: "test@test.com",
      password: "Test1234",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Username, email and password are required"
    );
  });

  test("ei emailia → 400", async () => {
    const res = await request(app).post("/user/register").send({
      username: "user1",
      password: "Test1234",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Username, email and password are required"
    );
  });

  test("ei passwordia → 400", async () => {
    const res = await request(app).post("/user/register").send({
      username: "user2",
      email: "test2@test.com",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Username, email and password are required"
    );
  });

  test("virheellinen email → 400", async () => {
    const res = await request(app).post("/user/register").send({
      username: "user3",
      email: "invalid-email",
      password: "Test1234",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Email is not valid");
  });

  test("salasana ei läpäise validointia → 400", async () => {
    const res = await request(app).post("/user/register").send({
      username: "user4",
      email: "test4@test.com",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("duplikaattikäyttäjä → 409", async () => {
    await request(app).post("/user/register").send({
      username: "user5",
      email: "user5@test.com",
      password: "Test1234",
    });

    const res = await request(app).post("/user/register").send({
      username: "user5",
      email: "other@test.com",
      password: "Test1234",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error", "Username already exists");
  });
});
