import request from "supertest";
import app from "../index.js";
import pool from "../database.js";
import userModel from "../models/user_model.js";
import { addOne as addReview } from "../models/review_model.js";

let testUserId;
let testReviewId;

beforeAll(async () => {
  // Tyhjennetään taulut
  await pool.query("DELETE FROM user_movie_ratings");
  await pool.query("DELETE FROM users");

  // Luodaan testikäyttäjä
  const user = await userModel.addOne("reviewtestuser", "reviewtest@test.com", "Test1234");
  testUserId = user.id;

  // Luodaan testiarvostelu
  const review = await addReview(testUserId, 550, 5, "Loistava elokuva!");
  testReviewId = review.review_id;

  // Luodaan toinen arvostelu samalle käyttäjälle eri elokuvasta
  await addReview(testUserId, 551, 4, "Hyvä elokuva!");
});

afterAll(async () => {
  await pool.end();
});

describe("GET /review/movie/:movieId", () => {
  // Positiivinen testi
  test("onnistunut arvostelujen haku elokuvan ID:n perusteella -> 200 + arvostelut", async () => {
    const res = await request(app).get("/review/movie/550");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("review_id");
    expect(res.body[0]).toHaveProperty("rating", 5);
    expect(res.body[0]).toHaveProperty("comment", "Loistava elokuva!");
    expect(res.body[0]).toHaveProperty("author_username", "reviewtestuser");
    expect(res.body[0]).toHaveProperty("movie_tmdb_id", 550);
  });

  // Negatiivinen testi
  test("ei arvosteluja elokuvalle -> 200 + tyhjä taulukko", async () => {
    const res = await request(app).get("/review/movie/999999");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});

describe("GET /review/user/:username", () => {
  // Positiivinen testi
  test("onnistunut arvostelujen haku käyttäjänimen perusteella -> 200 + arvostelut", async () => {
    const res = await request(app).get("/review/user/reviewtestuser");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2); // Kaksi arvostelua
    expect(res.body[0]).toHaveProperty("review_id");
    expect(res.body[0]).toHaveProperty("rating");
    expect(res.body[0]).toHaveProperty("comment");
    expect(res.body[0]).toHaveProperty("author_username", "reviewtestuser");
    expect(res.body[0]).toHaveProperty("movie_tmdb_id");
  });

  // Negatiivinen testi
  test("ei arvosteluja käyttäjälle -> 200 + tyhjä taulukko", async () => {
    const res = await request(app).get("/review/user/unknownuser");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

});
