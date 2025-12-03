import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function getNowPlayingMovies(req, res, next) {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          include_adult: false,
          language: "en-US",
          region: "FI",
          page: 1,
        },
      }
    );

    const top10 = response.data.results.slice(0, 10);
    res.json(top10);
  } catch (error) {
    res.status(500).json({ message: "Virhe haettaessa elokuvia" });
  }
}

export async function getMovieById(req, res, next) {
  try {
    const { movieId } = req.params;
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          append_to_response: "credits,release_dates",
          language: "en-US",
        },
      }
    );
    const formatedData = formatMovieData(response.data);

    res.json(formatedData);
  } catch (error) {
    res.status(500).json({ message: "Virhe haettaessa elokuvaa" });
  }
}

function getMainCast(cast) {
  const mainCast = cast
    .sort((a, b) => a.order - b.order)
    .slice(0, 5)
    .map((actor) => actor.name);
  return mainCast;
}
function getDirector(crew) {
  const director = crew.find((person) => person.job === "Director");
  return director.name;
}

function getWriters(crew) {
  const writers = crew
    .filter((person) => person.department === "Writing")
    .map((writer) => writer.name);
  return writers;
}

function getGenres(genres) {
  const genreNames = genres.map((genre) => genre.name);
  return genreNames;
}

function getAgeRating(releaseDates) {
  const fiRelease = releaseDates.results.find((r) => r.iso_3166_1 === "FI");

  if (!fiRelease) return null;

  const certificationObj = fiRelease.release_dates.find(
    (rd) => rd.certification !== ""
  );

  return certificationObj?.certification || "N/A";
}

function formatRuntime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
}

function formatMovieData(raw) {
  return {
    id: raw.id,
    title: raw.title,
    overview: raw.overview,
    cast: getMainCast(raw.credits.cast),
    director: getDirector(raw.credits.crew),
    writers: getWriters(raw.credits.crew),
    genres: getGenres(raw.genres),
    poster: raw.poster_path,
    backdrop: raw.backdrop_path,
    year: raw.release_date?.slice(0, -6),
    ageRating: getAgeRating(raw.release_dates),
    runtime: formatRuntime(raw.runtime),
  };
}
