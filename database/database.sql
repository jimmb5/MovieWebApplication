-- enable uuid generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username    text UNIQUE NOT NULL,
  email       text UNIQUE NOT NULL,
  password    text NOT NULL,
  refresh_token text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- GROUPS
CREATE TABLE groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- MEMBERS
CREATE TABLE group_members (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id    uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  joined_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, group_id)
);

-- MOVIES
CREATE TABLE movies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id     int UNIQUE,
  name        text NOT NULL,
  release_year int,
  poster_url  text,
  last_time_fetched timestamptz
);

-- RATINGS  (A: only one rating per user per movie)
CREATE TABLE user_movie_ratings (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id    uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  rating      int NOT NULL CHECK (rating >= 1 AND rating <= 10),
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, movie_id)
);

-- FAVOURITES
CREATE TABLE favourites (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id    uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  added       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, movie_id)
);
