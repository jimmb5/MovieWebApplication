import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

let cachedGenres = null;

async function findGenreId(searchTerm) {
  if (!cachedGenres) {
    const fiGenres = await axios.get(
      "https://api.themoviedb.org/3/genre/movie/list",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: "fi-FI",
        },
      }
    );

    const enGenres = await axios.get(
      "https://api.themoviedb.org/3/genre/movie/list",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: "en-US",
        },
      }
    );

    const mergedGenres = fiGenres.data.genres.map((fiGenre) => {
      const enMatch = enGenres.data.genres.find((en) => en.id === fiGenre.id);

      return {
        id: fiGenre.id,
        fi: fiGenre.name,
        en: enMatch?.name ?? null,
      };
    });

    cachedGenres = mergedGenres;
  } else {
  }

  const match = cachedGenres.find(
    (genre) =>
      genre.fi.toLowerCase() === searchTerm.toLowerCase() ||
      genre.en?.toLowerCase() === searchTerm.toLowerCase()
  );

  return match ? match.id : null;
}

async function searchMoviesByName(searchTerm) {
  const response = await axios.get(
    "https://api.themoviedb.org/3/search/movie",
    {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query: searchTerm,
        include_adult: false,
        language: "en-US",
        page: 1,
      },
    }
  );
  return response.data.results;
}

async function searchByGenreId(genreId) {
  const response = await axios.get(
    "https://api.themoviedb.org/3/discover/movie",
    {
      params: {
        api_key: process.env.TMDB_API_KEY,
        include_adult: false,
        language: "en-US",
        page: 1,
        with_genres: genreId,
      },
    }
  );
  return response.data.results;
}

async function searchByPersonName(searchTerm) {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/search/person",
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          query: searchTerm,
        },
      }
    );

    const persons = response.data.results;
    if (!persons || persons.length === 0) return [];

    let person = persons.find((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!person) person = persons[0];

    const personId = person.id;
    if (!personId) return [];

    const credits = await axios.get(
      `https://api.themoviedb.org/3/person/${personId}/movie_credits`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: "en-US",
        },
      }
    );

    return credits.data.cast ?? [];
  } catch (error) {
    console.error("Person search error:", error.message);
    return [];
  }
}

export async function smartSearch(req, res, next) {
  const searchTerm = req.query.query;

  try {
    const genreId = await findGenreId(searchTerm);

    if (genreId) {
      const results = await searchByGenreId(genreId);
      return res.json(results);
    }

    const [movieResults, personResults] = await Promise.all([
      searchMoviesByName(searchTerm),
      searchByPersonName(searchTerm),
    ]);

    let results = [];

    if (movieResults?.length > 0) {
      results = results.concat(movieResults);
    }

    if (personResults?.length > 0) {
      results = results.concat(personResults);
    }

    const unique = [];
    const ids = new Set();

    for (const movie of results) {
      if (movie && movie.id && !ids.has(movie.id)) {
        ids.add(movie.id);
        unique.push(movie);
      }
    }

    return res.json(unique);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Virhe haussa" });
  }
}
