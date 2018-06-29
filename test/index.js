const app = require('../src/index.js');

describe('Movies', () => {
  describe('POST /movies', () => {
    it('should return 200 and Movie object as application/json if OK', done => {
      app.inject({
        method: 'POST',
        url: '/movies',
        payload: { title: 'red' },
      }, error => {
        if (error) {
          throw error;
        }

        done();
      });
    });
    it('should return 404 and Error object as application/json if movie not found', done => {
      app.inject({
        method: 'POST',
        url: '/movies',
        payload: { title: 'fake_title' },
      }, error => {
        if (error) {
          throw error;
        }

        done();
      });
    });
    it('should return 4xx if request body does NOT match specified JSON Schema', done => {
      app.inject({
        method: 'POST',
        url: '/movies',
        payload: { },
      }, error => {
        if (error) {
          throw error;
        }

        done();
      });
    });
    it('should return 5xx if error occurred');
  });

  describe('GET /movies', () => {
    it('should return 200 and array of Movie objects as application/json if OK', done => {
      app.inject({
        method: 'GET',
        url: '/movies',
      }, error => {
        if (error) {
          throw error;
        }

        done();
      });
    });
    it('should return 200 and empty array if no movies found', done => {
      app.inject({
        method: 'GET',
        url: '/movies',
      }, error => {
        if (error) {
          throw error;
        }

        done();
      });
    });
    it('should return 5xx if error occurred');
  });
});

describe('Comments', () => {
  describe('POST /comments', () => {
    it('should return 200 and Comment object as application/json if OK', done => {
      app.inject({
        method: 'POST',
        url: '/comments',
        payload: { id: 'correct_movie_id', comment: 'comment' },
      }, error => {
        if (error) {
          throw error;
        }

        done();
      });
    });
    it('should return 400 and Error object as application/json if movie not found', done => {
      app.inject({
        method: 'POST',
        url: '/comments',
        payload: { id: 'incorrect_movie_id', comment: 'comment' },
      }, error => {
        if (error) {
          throw error;
        }

        done();
      });
    });
    it('should return 4xx if request body does NOT match specified JSON Schema', done => {
      app.inject({
        method: 'POST',
        url: '/comments',
        payload: { },
      }, error => {
        if (error) {
          throw error;
        }

        done();
      });
    });
    it('should return 5xx if error occurred');
  });

  describe('GET /comments', () => {
    it('should return 200 and array of arrays of Comment objects as application/json if OK', done => {
      app.inject({
        method: 'GET',
        url: '/comments',
      }, error => {
        if (error) {
          throw error;
        }

        done();
      });
    });
    it('should return 200 and empty array as application/json if no comments found', done => {
      app.inject({
        method: 'GET',
        url: '/comments',
      }, error => {
        if (error) {
          throw error;
        }

        done();
      });
    });
    it('should return 5xx if error occurred');
  });

  describe('GET /comments/:movieID', () => {
    it('should return 200 and array of Comment objects as application/json if OK', done => {
      app.inject({
        method: 'GET',
        url: '/comments/:movieID',
      }, error => {
        if (error) {
          throw error;
        }

        done();
      });
    });
    it('should return 200 and empty array as application/json if no comments found', done => {
      app.inject({
        method: 'GET',
        url: '/comments/:movieID',
      }, error => {
        if (error) {
          throw error;
        }

        done();
      });
    });
    it('should return 5xx if error occurred');
  });
});
