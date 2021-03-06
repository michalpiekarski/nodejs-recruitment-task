module.exports = {
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
};
