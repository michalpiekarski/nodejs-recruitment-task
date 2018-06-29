const request = require('request');
const httpcodes = require('http-status-codes');
const shortid = require('shortid');
const log = require('./log');

module.exports = {
  SaveMovie: SaveMovie,
  GetMovies: GetMovies,
};

function SaveMovie(db, title, API_URI = `http://www.omdbapi.com/?apikey=${process.env.API_KEY}&`) {
  return new Promise(resolve => {
    request.get(
      {
        url: `${API_URI}t=${title}`,
        json: true,
      },
      (error, response, body) => {
        if (error) {
          log.error({ error: error }, `Failed to request movie ${title} from remote API`);
          throw error;
        }

        if (body.Response === 'True') {
          body.ID = shortid.generate();

          db.hmset(
            `movie:${body.ID}`,
            'ID', body.ID,
            'Title', body.Title,
            'Year', body.Year,
            'Rated', body.Rated,
            'Released', body.Released,
            'Runtime', body.Runtime,
            'Genre', body.Genre,
            'Director', body.Director,
            'Writer', body.Writer,
            'Actors', body.Actors,
            'Plot', body.Plot,
            'Langugae', body.Langugae,
            'Country', body.Country,
            'Awards', body.Awards,
            'Poster', body.Poster,
            'Ratings', JSON.stringify(body.Ratings),
            'Metascore', body.Metascore,
            'imdbRating', body.imdbRating,
            'imdbVotes', body.imdbVotes,
            'imdbID', body.imdbID,
            'Type', body.Type,
            'DVD', body.DVD,
            'BoxOffice', body.BoxOffice,
            'Production', body.Production,
            'Website', body.Website,
            (redis_error, reply) => {
              if (redis_error) {
                log.error({ error: redis_error }, `Failed to save movie ${body.ID}`);
                throw error;
              }

              log.info({ movie: body }, `New movie ${body.ID} saved`);
              resolve(body);
            }
          );

          return;
        }

        const result = new Error(`Movie ${title} not found in the remote api: ${body.Error}`);
        log.debug(result.message);
        result.statusCode = httpcodes.NOT_FOUND;
        resolve(result);
      }
    );
  });
}

function GetMovies(db) {
  return new Promise(resolve => {
    db.keys('movie:*', (error, keys) => { // eslint-disable-line consistent-return
      if (error) {
        log.error({ error: error }, 'Failed to acquire movies from database');
        throw error;
      }

      if (keys.length === 0) {
        return resolve([]);
      }

      const multi = db.multi();

      for (const key of keys) {
        multi.hgetall(key);
      }

      multi.exec((multi_error, movies) => {
        if (multi_error) {
          log.error({ error: error }, 'Failed to acquire movies from database');
          throw error;
        }

        resolve(movies.map(movie => {
          const parsed = movie;

          try {
            parsed.Ratings = JSON.parse(parsed.Ratings);
          } catch (ex) {
            log.warn(ex);
            return null;
          }

          return parsed;
        }).filter(movie => movie !== null));
      });
    });
  });
}
