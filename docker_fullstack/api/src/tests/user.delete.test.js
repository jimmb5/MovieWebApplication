import request from "supertest";
import app from "../index.js";
import pool from "../database.js";

beforeAll(async () => {
  await pool.query("DELETE FROM users");
});

afterAll(async () => {
  await pool.end();
});

describe("DELETE /user/:userId", () => {
  // Positiivinen testi
  test("onnistunut käyttäjän poistaminen → 200 + viesti", async () => {
    // luodaan käyttäjä
    const registerRes = await request(app).post("/user/register").send({
      username: "testuser",
      email: "test@test.com",
      password: "Test1234",
    });

    expect(registerRes.status).toBe(201);
    const userId = registerRes.body.id;

    // kirjaudutaan sisään että saadaan accessToken
    const loginRes = await request(app).post("/user/login").send({
      username: "testuser",
      password: "Test1234",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("accessToken");
    const accessToken = loginRes.body.accessToken;

    // poistetaan käyttäjä
    const res = await request(app)
      .delete(`/user/${userId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toContain("testuser");
    expect(res.body.message).toContain(userId.toString());
    expect(res.body.message).toContain("deleted successfully");
  });

  // Negatiiviset testit
  test("käyttäjän poistaminen ilman accessTokenia → 401", async () => {
    // luodaan käyttäjä
    const registerRes = await request(app).post("/user/register").send({
      username: "testuser2",
      email: "test2@test.com",
      password: "Test1234",
    });

    const userId = registerRes.body.id;

    // yritetään poistaa käyttäjä ilman tokenia
    const res = await request(app).delete(`/user/${userId}`);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Access token required");
  });

  test("käyttäjän poistaminen väärällä accessTokenilla → 403", async () => {
    // luodaan käyttäjä
    const registerRes = await request(app).post("/user/register").send({
      username: "testuser3",
      email: "test3@test.com",
      password: "Test1234",
    });

    const userId = registerRes.body.id;

    // yritetään poistaa käyttäjä väärällä tokenilla
    const res = await request(app)
      .delete(`/user/${userId}`)
      .set("Authorization", "Bearer invalid_token_12345");

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error", "Invalid or expired access token");
  });

  test("käyttäjän poistaminen tuntemattomalla userId:llä → 404", async () => {
    // luodaan käyttäjä
    await request(app).post("/user/register").send({
      username: "testuser4",
      email: "test4@test.com",
      password: "Test1234",
    });

    // kirjaudutaan sisään
    const loginRes = await request(app).post("/user/login").send({
      username: "testuser4",
      password: "Test1234",
    });

    const accessToken = loginRes.body.accessToken;

    // yritetään poistaa tuntematon käyttäjä keksityllä UUID:lla
    const nonExistentUserId = "00000000-0000-0000-0000-000000000000";
    const res = await request(app)
      .delete(`/user/${nonExistentUserId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "User not found");
  });

  test("käyttäjän poistaminen kun käyttäjä on jo poistettu → 404", async () => {
    // luodaan käyttäjä
    const registerRes = await request(app).post("/user/register").send({
      username: "testuser5",
      email: "test5@test.com",
      password: "Test1234",
    });

    const userId = registerRes.body.id;

    // kirjaudutaan sisään
    const loginRes = await request(app).post("/user/login").send({
      username: "testuser5",
      password: "Test1234",
    });

    const accessToken = loginRes.body.accessToken;

    // poistetaan käyttäjä ensimmäisen kerran
    const firstDelete = await request(app)
      .delete(`/user/${userId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(firstDelete.status).toBe(200);

    // yritetään poistaa sama käyttäjä uudelleen
    const secondDelete = await request(app)
      .delete(`/user/${userId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(secondDelete.status).toBe(404);
    expect(secondDelete.body).toHaveProperty("error", "User not found");
  });
});

