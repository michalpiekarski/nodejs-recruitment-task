const CreateServer = require('fastify');
const redis = require('redis');

const TEST_ENV = process.env.NODE_ENV === 'test';
const log = require('./lib/log');
const movies = require('./lib/movies');
const comments = require('./lib/comments');
const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT || '1337');
const API_URI = `http://www.omdbapi.com/?apikey=${process.env.API_KEY}&`;
const REDIS = Object.freeze({
  HOST: process.env.REDIS_HOST || 'redis',
  PORT: parseInt(process.env.REDIS_PORT || '6379'),
  PASS: process.env.REDIS_PASSWORD || '',
  DB: parseInt(process.env.REDIS_DB || '0'),
  PREFIX: process.env.REDIS_PREFIX || '',
  RETRY: Object.freeze({
    TIMEOUT: parseInt(process.env.REDIS_RECONNECT_TIMEOUT || '60000'), // Default 1 minute
    ATTEMPT: parseInt(process.env.REDIS_RECONNECT_ATTEMPT || '10'),
    WAIT: parseInt(process.env.REDIS_RECONNECT_WAIT || '5000'), // Default 5 seconds
  }),
  GetInfo: () => ({ host: REDIS.HOST, port: REDIS.PORT, db: REDIS.DB, prefix: REDIS.PREFIX }),
});

const server = CreateServer({
  ignoreTrailingSlash: true,
  logger: log,
});

if (TEST_ENV) {
  module.exports = server;
}

const db = redis.createClient({
  host: REDIS.HOST,
  port: REDIS.PORT,
  detect_buffers: true,
  password: REDIS.PASS,
  db: REDIS.DB,
  prefix: REDIS.PREFIX,
  retry_strategy: options => {
    if (options.error && options.error.code !== 'ECONNREFUSED') {
      return options.error;
    }

    if (options.total_retry_time > REDIS.RETRY.TIMEOUT) {
      return new Error('Redis connection retry time exhausted');
    }

    if (options.attempt > REDIS.RETRY.ATTEMPT) {
      return undefined; // eslint-disable-line consistent-return
    }

    return Math.min(options.attempt * 100, REDIS.RETRY.WAIT);
  },
});

db.on('error', error => log.error({ error: error, redis: REDIS.GetInfo() }, 'Redis error'));
db.on('warning', warning => log.warn({ warning: warning, redis: REDIS.GetInfo() }, 'Redis warning'));
db.on('connect', () => log.debug({ redis: REDIS.GetInfo() }, 'Connected to redis'));
db.on('end', () => log.warn({ redis: REDIS.GetInfo() }, 'Disconnected from redis'));
db.on('reconnecting', state => log.debug({ state: state, redis: REDIS.GetInfo() }, 'Reconnecting to redis'));

server.addSchema({
  $id: 'movie',
  type: 'object',
  properties: {
    ID: { type: 'string' },
    Title: { type: 'string' },
    Year: { type: 'string' },
    Rated: { type: 'string' },
    Released: { type: 'string' },
    Runtime: { type: 'string' },
    Genre: { type: 'string' },
    Director: { type: 'string' },
    Writer: { type: 'string' },
    Actors: { type: 'string' },
    Plot: { type: 'string' },
    Langugae: { type: 'string' },
    Country: { type: 'string' },
    Awards: { type: 'string' },
    Poster: { type: 'string' },
    Ratings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          Source: { type: 'string' },
          Value: { type: 'string' },
        },
      },
    },
    Metascore: { type: 'string' },
    imdbRating: { type: 'string' },
    imdbVotes: { type: 'string' },
    imdbID: { type: 'string' },
    Type: { type: 'string' },
    DVD: { type: 'string' },
    BoxOffice: { type: 'string' },
    Production: { type: 'string' },
    Website: { type: 'string' },
  },
  required: ['ID', 'Title', 'Year', 'Director', 'Type'],
});

server.addSchema({
  $id: 'comment',
  type: 'object',
  properties: {
    id: { type: 'string' },
    comment: { type: 'string' },
  },
  required: ['id', 'comment'],
});

server.post(
  '/movies',
  {
    schema: {
      body: {
        type: 'object',
        properties: { title: { type: 'string' } },
        required: ['title'],
      },
      response: { 200: 'movie#' },
    },
  },
  req => movies.SaveMovie(db, req.body.title, API_URI)
);

server.get(
  '/movies',
  {
    schema: {
      response: {
        200: {
          type: 'array',
          items: 'movie#',
        },
      },
    },
  },
  () => movies.GetMovies(db)
);

server.post(
  '/comments',
  {
    schema: {
      body: 'comment#',
      response: { 200: 'comment#' },
    },
  },
  req => comments.SaveComment(db, req.body)
);

server.get(
  '/comments',
  {
    schema: {
      response: {
        200: {
          type: 'array',
          items: {
            type: 'array',
            items: 'comment#',
          },
        },
      },
    },
  },
  () => comments.GetAllComments(db)
);

server.get(
  '/comments/:movieID',
  {
    schema: {
      params: { movieID: { type: 'string' } },
      response: {
        200: {
          type: 'array',
          items: 'comment#',
        },
      },
    },
  },
  req => comments.GetMovieComments(db, req.params.movieID)
);

db.once('ready', () => {
  log.debug({ redis: REDIS.GetInfo() }, 'Redis database ready');

  server.ready()
    .then(() => {
      log.debug('Server loaded');

      if (TEST_ENV) {
        return;
      }

      server.listen(PORT, HOST).then(address => {
        log.info(`Server listening on ${address}`);

        if (log.isLevelEnabled('debug')) {
          log.debug(`Server routes:\n${server.printRoutes()}`);
        }
      });
    })
    .catch(error => {
      log.error(error, 'Staring server failed');
      process.exit(error.code || 1); // eslint-disable-line no-process-exit
    });
});
