import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

let cachedGenres = null;

async function findGenreId(searchTerm) {
  if (!cachedGenres) {
    console.log("Http request made");
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
    console.log("Cache used");
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
        region: "FI",
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
        region: "FI",
        page: 1,
        with_genres: genreId,
      },
    }
  );
  return response.data.results;
}

export async function smartSearch(req, res, next) {
  const searchTerm = req.query.query;

  try {
    const genreId = await findGenreId(searchTerm);
    if (genreId) {
      const results = await searchByGenreId(genreId);
      return res.json(results);
    }

    const movieResults = await searchMoviesByName(searchTerm);

    return res.json(movieResults);
  } catch (error) {
    res.status(500).json({ message: "Virhe haussa" });
  }
}

// export async function findGenre(req, res, next) {
//   if (cachedGenres) {
//     console.log("Cache used");
//     res.json(cachedGenres);
//   } else {
//     try {
//       console.log("Http request made");
//       const fiGenres = await axios.get(
//         "https://api.themoviedb.org/3/genre/movie/list",
//         {
//           params: {
//             api_key: process.env.TMDB_API_KEY,
//             language: "fi-FI",
//           },
//         }
//       );

//       const enGenres = await axios.get(
//         "https://api.themoviedb.org/3/genre/movie/list",
//         {
//           params: {
//             api_key: process.env.TMDB_API_KEY,
//             language: "en-US",
//           },
//         }
//       );

//       const mergedGenres = fiGenres.data.genres.map((fiGenre) => {
//         const enMatch = enGenres.data.genres.find((en) => en.id === fiGenre.id);

//         return {
//           id: fiGenre.id,
//           fi: fiGenre.name,
//           en: enMatch?.name ?? null,
//         };
//       });

//       cachedGenres = mergedGenres;
//       res.json(cachedGenres);
//     } catch (error) {
//       res.status(500).json({ message: "Virhe haettaessa genrejä" });
//     }
//   }
// }
