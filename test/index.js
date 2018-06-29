const HTTP = require('http-status-codes');

const { expect } = require('chai').use(require('chai-json-schema-ajv').withOptions({
  // the fastify defaults
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
}));

const app = require('../src/index.js');
const schema = require('../src/schema');

describe('Movies', () => {
  describe('Movie JSON Schema', () => it('should be a valid JSON Schema', done => {
    expect(schema.movie).to.be.validJsonSchema;
    done();
  }));

  describe('Movie query JSON Schema', () => it('should be a valid JSON Schema', done => {
    expect(schema.movie_query).to.be.validJsonSchema;
    done();
  }));

  describe('POST /movies', () => {
    it('should return 200 and Movie object as application/json if OK', done => {
      app.inject({
        method: 'POST',
        url: '/movies',
        payload: { title: 'red' },
      })
        .then(response => {
          expect(response.statusCode).to.be.equal(HTTP.OK);
          expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
          let body;

          try {
            body = JSON.parse(response.payload);
          } catch (exception) {
            done(exception);
            return;
          }

          expect(body).to.be.jsonSchema(schema.movie);
          done();
        })
        .catch(done);
    });
    it('should return 404 and Error object as application/json if movie not found', done => {
      app.db.flushdb(() => {
        app.inject({
          method: 'POST',
          url: '/movies',
          payload: { title: 'fake_title' },
        }).then(response => {
          expect(response.statusCode).to.be.equal(HTTP.NOT_FOUND);
          expect(response.headers['content-type']).to.be.equal('application/json');
          let body;

          try {
            body = JSON.parse(response.payload);
          } catch (exception) {
            done(exception);
            return;
          }

          expect(body).to.have.all.keys('error', 'message', 'statusCode');
          done();
        }).catch(done);
      });
    });
    it('should return 4xx if request body does NOT match specified JSON Schema', done => {
      app.inject({
        method: 'POST',
        url: '/movies',
        payload: {},
      }).then(response => {
        expect(response.statusCode).to.be.at.least(HTTP.BAD_REQUEST).and.below(HTTP.INTERNAL_SERVER_ERROR);
        expect(response.headers['content-type']).to.be.equal('application/json');
        let body;

        try {
          body = JSON.parse(response.payload);
        } catch (exception) {
          done(exception);
          return;
        }

        expect(body).to.have.all.keys('error', 'message', 'statusCode');
        done();
      }).catch(done);
    });
    it('should return 5xx if error occurred');
  });

  describe('GET /movies', () => {
    it('should return 200 and array of Movie objects as application/json if OK', done => {
      app.inject({
        method: 'POST',
        url: '/movies',
        payload: { title: 'red' },
      }).then(() => {
        app.inject({
          method: 'GET',
          url: '/movies',
        }).then(response => {
          expect(response.statusCode).to.be.equal(HTTP.OK);
          expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
          let body;

          try {
            body = JSON.parse(response.payload);
          } catch (exception) {
            done(exception);
            return;
          }

          expect(body).to.be.jsonSchema({
            type: 'array',
            items: schema.movie,
          }).that.is.not.empty;

          done();
        }).catch(done);
      });
    });
    it('should return 200 and empty array if no movies found', done => {
      app.db.flushdb(() => {
        app.inject({
          method: 'GET',
          url: '/movies',
        }).then(response => {
          expect(response.statusCode).to.be.equal(HTTP.OK);
          expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
          let body;

          try {
            body = JSON.parse(response.payload);
          } catch (exception) {
            done(exception);
            return;
          }

          expect(body).to.be.an('array').that.is.empty;
          done();
        }).catch(done);
      });
    });
    it('should return 5xx if error occurred');
  });
});

describe('Comments', () => {
  describe('Comment JSON Schema', () => it('should be a valid JSON Schema', done => {
    expect(schema.comment).to.be.validJsonSchema;
    done();
  }));

  describe('POST /comments', () => {
    it('should return 200 and Comment object as application/json if OK', done => {
      app.inject({
        method: 'POST',
        url: '/movies',
        payload: { title: 'red' },
      }).then(post_response => {
        const movie = JSON.parse(post_response.payload);

        app.inject({
          method: 'POST',
          url: '/comments',
          payload: {
            id: movie.ID,
            comment: 'new comment',
          },
        }).then(response => {
          expect(response.statusCode).to.be.equal(HTTP.OK);
          expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
          let body;

          try {
            body = JSON.parse(response.payload);
          } catch (exception) {
            done(exception);
            return;
          }

          expect(body).to.be.jsonSchema(schema.comment);
          done();
        }).catch(done);
      });
    });
    it('should return 400 and Error object as application/json if movie not found', done => {
      app.db.flushdb(() => {
        app.inject({
          method: 'POST',
          url: '/comments',
        }).then(response => {
          expect(response.statusCode).to.be.equal(HTTP.BAD_REQUEST);
          expect(response.headers['content-type']).to.be.equal('application/json');
          let body;

          try {
            body = JSON.parse(response.payload);
          } catch (exception) {
            done(exception);
            return;
          }

          expect(body).to.have.all.keys('error', 'message', 'statusCode');
          done();
        }).catch(done);
      });
    });
    it('should return 4xx if request body does NOT match specified JSON Schema', done => {
      app.inject({
        method: 'POST',
        url: '/comments',
        payload: {},
      }).then(response => {
        expect(response.statusCode).to.be.at.least(HTTP.BAD_REQUEST).and.below(HTTP.INTERNAL_SERVER_ERROR);
        expect(response.headers['content-type']).to.be.equal('application/json');
        let body;

        try {
          body = JSON.parse(response.payload);
        } catch (exception) {
          done(exception);
          return;
        }

        expect(body).to.have.all.keys('error', 'message', 'statusCode');
        done();
      }).catch(done);
    });
    it('should return 5xx if error occurred');
  });

  describe('GET /comments', () => {
    it('should return 200 and array of arrays of Comment objects as application/json if OK', done => {
      app.inject({
        method: 'POST',
        url: '/movies',
        payload: { title: 'red' },
      }).then(post_response => {
        const movie = JSON.parse(post_response.payload);

        app.inject({
          method: 'POST',
          url: '/comments',
          payload: {
            id: movie.ID,
            comment: 'new comment',
          },
        }).then(() => {
          app.inject({
            method: 'GET',
            url: '/comments',
          }).then(response => {
            expect(response.statusCode).to.be.equal(HTTP.OK);
            expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
            let body;

            try {
              body = JSON.parse(response.payload);
            } catch (exception) {
              done(exception);
              return;
            }

            expect(body).to.be.jsonSchema({
              type: 'array',
              items: {
                type: 'array',
                items: schema.comment,
              },
            }).that.is.not.empty;

            for (const comments of body) {
              expect(comments).is.an('array').that.is.not.empty;
            }

            done();
          }).catch(done);
        });
      });
    });
    it('should return 5xx if error occurred');
  });

  describe('GET /comments/:movieID', () => {
    it('should return 200 and array of Comment objects as application/json if OK', done => {
      app.inject({
        method: 'GET',
        url: '/movies',
      }).then(movies_response => {
        const movieID = JSON.parse(movies_response.payload)[0].ID;

        app.inject({
          method: 'GET',
          url: `/comments/${movieID}`,
        }).then(response => {
          expect(response.statusCode).to.be.equal(HTTP.OK);
          expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
          let body;

          try {
            body = JSON.parse(response.payload);
          } catch (exception) {
            done(exception);
            return;
          }

          expect(body).to.be.jsonSchema({
            type: 'array',
            items: schema.comment,
          }).that.is.not.empty;

          done();
        }).catch(done);
      });
    });
    it('should return 200 and empty array as application/json if no comments found', done => {
      app.db.flushdb(() => {
        app.inject({
          method: 'GET',
          url: '/comments/:movieID',
        }).then(response => {
          expect(response.statusCode).to.be.equal(HTTP.OK);
          expect(response.headers['content-type']).to.be.equal('application/json; charset=utf-8');
          let body;

          try {
            body = JSON.parse(response.payload);
          } catch (exception) {
            done(exception);
            return;
          }

          expect(body).to.be.an('array').that.is.empty;
          done();
        }).catch(done);
      });
    });
    it('should return 5xx if error occurred');
  });
});
