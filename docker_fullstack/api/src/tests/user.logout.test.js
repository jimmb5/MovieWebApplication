import request from "supertest";
import app from "../index.js";
import pool from "../database.js";
import userModel from "../models/user_model.js";

beforeAll(async () => {
  await pool.query("DELETE FROM users");

  await userModel.addOne("testuser", "test@test.com", "Test1234");
});

afterAll(async () => {
  await pool.end();
});

describe("POST /user/logout", () => {
  // Positiivinen testi
  test("onnistunut uloskirjautuminen → 200 + viesti + cookie poistettu", async () => {
    // kirjaudutaan sisään että saadaan cookie/token
    const loginRes = await request(app).post("/user/login").send({
      username: "testuser",
      password: "Test1234",
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.headers["set-cookie"]).toBeDefined();

    // tallenna cookie seuraavaa pyyntöä varten
    const cookies = loginRes.headers["set-cookie"];

    // uloskirjautuminen
    const res = await request(app)
      .post("/user/logout")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Logout successful");
    
    // lopuksi tarkistetaan että cookie poistetaan
    const clearCookieHeader = res.headers["set-cookie"];
    expect(clearCookieHeader).toBeDefined();
    expect(clearCookieHeader[0]).toContain("refreshToken=");
    expect(clearCookieHeader[0]).toContain("Expires=");
  });

  // Negatiiviset testit
  test("uloskirjautuminen ilman refreshToken cookieta → 200", async () => {
    const res = await request(app).post("/user/logout");

    // uloskirjautuminen toimii myös ilman cookieta
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Logout successful");
  });

  test("uloskirjautuminen väärällä refreshToken cookiella → 200", async () => {
    const res = await request(app)
      .post("/user/logout")
      .set("Cookie", "refreshToken=invalid_token_12345");

    // logout toimii myös väärällä/vanhentuneella tokenilla, koska se yrittää vain poistaa tokenin jos käyttäjä löytyy
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Logout successful");
  });

  test("uloskirjautuminen kun refreshToken on jo poistettu → 200", async () => {
    // kirjaudutaan ensin sisään
    const loginRes = await request(app).post("/user/login").send({
      username: "testuser",
      password: "Test1234",
    });

    const cookies = loginRes.headers["set-cookie"];

    // kirjaudutaan ulos ensimmäisen kerran
    const firstLogout = await request(app)
      .post("/user/logout")
      .set("Cookie", cookies);

    expect(firstLogout.status).toBe(200);

    // kirjaudutaan ulos heti uudelleen samalla cookiella
    const secondLogout = await request(app)
      .post("/user/logout")
      .set("Cookie", cookies);

    // onnistuu, vaikka token on jo poistettu
    expect(secondLogout.status).toBe(200);
    expect(secondLogout.body).toHaveProperty("message", "Logout successful");
  });
});
