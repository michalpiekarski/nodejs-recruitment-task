const httpcodes = require('http-status-codes');
const log = require('./log');

module.exports = {
  SaveComment: SaveComment,
  GetAllComments: GetAllComments,
  GetMovieComments: GetMovieComments,
};

function SaveComment(db, comment) {
  return new Promise(resolve => {
    db.exists(`movie:${comment.id}`, (error, exists) => {
      if (error) {
        log.error({ error: error, comment: comment }, 'Failed to add comment');
        throw error;
      }

      if (exists === 0) {
        const result = new Error(`Cannot add comment to movie ${comment.id} - not found`);
        log.debug({ comment: comment }, result.message);
        result.code = httpcodes.BAD_REQUEST;
        resolve(result);
      }

      db.rpush(`comments:${comment.id}`, comment.comment, save_error => {
        if (save_error) {
          log.error({ error: save_error, comment: comment }, `Failed to add comment to movie ${comment.id}`);
          throw save_error;
        }

        log.info({ comment: comment }, `New comment added to movie ${comment.id}`);
        resolve(comment);
      });
    });
  });
}

function GetAllComments(db) {
  return new Promise(resolve => {
    db.keys('comments:*', (error, keys) => { // eslint-disable-line consistent-return
      if (error) {
        log.error({ error: error }, 'Failed to acquire comments');
        throw error;
      }

      if (keys.length === 0) {
        log.debug('No comments found');
        return resolve([]);
      }

      const multi = db.multi();

      for (const key of keys) {
        multi.lrange(key, 0, -1);
      }

      multi.exec((multi_error, comments) => {
        if (multi_error) {
          log.error({ error: multi_error }, 'Failed to acquire comments');
          throw multi_error;
        }

        const result = [];

        for (let i = 0, len = keys.length; i < len; i++) {
          const movieID = keys[i].split(':')[1];
          result.push(comments[i].map(comment => ({ id: movieID, comment: comment })));
        }

        resolve(result);
      });
    });
  });
}

function GetMovieComments(db, movieID) {
  return new Promise(resolve => {
    db.exists(`comments:${movieID}`, (error, exists) => { // eslint-disable-line consistent-return
      if (error) {
        log.error({ error: error }, `Failed to acquire comments for movie ${movieID}`);
        throw error;
      }

      if (exists === 0) {
        log.debug(`No comments for movie ${movieID}`);
        return resolve([]);
      }

      db.lrange(`comments:${movieID}`, 0, -1, (get_error, comments) => {
        if (get_error) {
          log.error({ error: get_error }, `Failed to acquire comments for movie ${movieID}`);
          throw get_error;
        }

        resolve(comments.map(comment => ({ id: movieID, comment: comment })));
      });
    });
  });
}
