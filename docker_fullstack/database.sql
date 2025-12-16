-- enable uuid generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- users
CREATE TABLE users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username    text UNIQUE NOT NULL,
  email       text UNIQUE NOT NULL,
  password    text NOT NULL,
  refresh_token text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- groups
CREATE TABLE groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  created_by  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- group members
CREATE TABLE group_members (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id    uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
  joined_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, group_id)
);

-- group join requests
CREATE TABLE group_join_requests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

-- group posts
CREATE TABLE group_posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  author_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_tmdb_id   int,
  description     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX group_posts_group_idx ON group_posts(group_id);

-- group post comments
CREATE TABLE group_post_comments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_post_id   uuid NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
  author_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment            text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX group_post_comments_post_idx ON group_post_comments(group_post_id);


-- user movie ratings (only one rating per user per movie)
-- assumes rating is optional
CREATE TABLE user_movie_ratings (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_tmdb_id int NOT NULL,
  review_id   uuid UNIQUE DEFAULT gen_random_uuid(),
  rating      int,
  comment     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, movie_tmdb_id)
);

-- user favorited movies
CREATE TABLE favourites (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_tmdb_id int NOT NULL,
  added_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, movie_tmdb_id)
);

