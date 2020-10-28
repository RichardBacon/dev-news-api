process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../src/app');
const connection = require('../../db/connection');

beforeEach(() => connection.seed.run());
afterAll(() => connection.destroy());

describe('/api/comments/:comment_id', () => {
  test('invalid methods | status:405 - msg: "method not allowed"', () => {
    const invalidMethods = ['get', 'post', 'put'];
    const requests = invalidMethods.map((method) => {
      return request(app)
        [method]('/api/comments/1')
        .expect(405)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('method not allowed');
        });
    });

    return Promise.all(requests);
  });

  describe('PATCH', () => {
    describe('valid PATCH comment request', () => {
      test('status:200 - comment object', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({
            inc_votes: 1,
          })
          .expect(200)
          .then(({ body: { comment } }) => {
            expect(comment).toContainEntries([
              ['comment_id', 1],
              ['created_by', 'username1'],
              [
                'body',
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a ante et libero vehicula iaculis non a leo.',
              ],
              ['post_id', 1],
              ['votes', 1],
            ]);
          });
      });

      test('only inc_votes key can be updated', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({
            inc_votes: 1,
            created_by: 'new-author',
            post_id: 999,
            comment_id: 999,
            body: 'new-body',
            created_at: new Date(Date.now()).toISOString(),
            votes: 999,
          })
          .expect(200)
          .then(({ body: { comment } }) => {
            expect(comment).toContainEntries([
              ['comment_id', 1],
              ['created_by', 'username1'],
              [
                'body',
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a ante et libero vehicula iaculis non a leo.',
              ],
              ['post_id', 1],
              ['votes', 1],
            ]);
          });
      });

      test('missing inc_votes key | status:200 - unchanged comment object', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({
            inc_vote: 1,
          })
          .expect(200)
          .then(({ body: { comment } }) => {
            expect(comment).toContainEntries([
              ['comment_id', 1],
              ['created_by', 'username1'],
              [
                'body',
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a ante et libero vehicula iaculis non a leo.',
              ],
              ['post_id', 1],
              ['votes', 0],
            ]);
          });
      });
    });

    describe('invalid PATCH comment request', () => {
      test('non-existent comment_id | status:404 - msg: "comment not found"', () => {
        return request(app)
          .patch('/api/comments/99999')
          .send({
            inc_votes: 1,
          })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('comment not found');
          });
      });

      test('invalid comment_id | status:400 - msg: "bad request"', () => {
        return request(app)
          .patch('/api/comments/notANumber')
          .send({
            inc_votes: 1,
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('bad request');
          });
      });

      test('invalid inc_votes property  | status:400 - msg: "bad request"', () => {
        return request(app)
          .patch('/api/comments/1')
          .send({
            inc_votes: '123alphanumeric123',
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('bad request');
          });
      });
    });
  });

  describe('DELETE', () => {
    test('valid delete request | status:204', () => {
      return request(app)
        .delete('/api/comments/1')
        .expect(204)
        .then(({ body }) => {
          expect(body).toEqual({});
        });
    });

    describe('invalid DELETE comment request', () => {
      test('non-existent comment_id | status:404 - msg: "comment not found"', () => {
        return request(app)
          .delete('/api/comments/99999')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('comment not found');
          });
      });

      test('invalid comment_id | status:400 - msg: "bad request"', () => {
        return request(app)
          .delete('/api/comments/notANumber')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('bad request');
          });
      });
    });
  });
});

describe('/api/posts/:post_id/comments', () => {
  test('invalid methods | status:405 - msg: "method not allowed"', () => {
    const invalidMethods = ['patch', 'put', 'delete'];
    const requests = invalidMethods.map((method) => {
      return request(app)
        [method]('/api/posts/1/comments')
        .expect(405)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('method not allowed');
        });
    });
    return Promise.all(requests);
  });

  describe('GET comments', () => {
    test('valid request | status:200 - array of comment objects', () => {
      return request(app)
        .get('/api/posts/1/comments')
        .expect(200)
        .then(({ body: { comments } }) => {
          comments.forEach((comment) => {
            expect(comment).toContainAllKeys([
              'comment_id',
              'post_id',
              'votes',
              'created_at',
              'created_by',
              'body',
            ]);
          });
        });
    });

    test('total_count property - total number of comments', () => {
      return request(app)
        .get('/api/posts/1/comments')
        .expect(200)
        .then(({ body: { total_count } }) => {
          expect(total_count).toBe('20');
        });
    });

    test('post has no comments | status:200 - empty array', () => {
      return request(app)
        .get('/api/posts/6/comments')
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toEqual([]);
        });
    });

    describe('GET comments - queries', () => {
      describe('sort_by query', () => {
        test('valid sort_by query | status:200 - sorted by [sort_by]', () => {
          const validSortByQueries = [
            'comment_id',
            'post_id',
            'votes',
            'created_at',
            'created_by',
            'body',
          ];

          const requests = validSortByQueries.map((query) => {
            return request(app)
              .get(`/api/posts/1/comments?sort_by=${query}`)
              .expect(200)
              .then(({ body: { comments } }) => {
                expect(comments).toBeSortedBy(query, { descending: true });
              });
          });

          return Promise.all(requests);
        });

        test('invalid sort_by query | status:400 - msg: "bad request"', () => {
          return request(app)
            .get('/api/posts/1/comments?sort_by=invalid')
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('bad request');
            });
        });
      });

      describe('order query', () => {
        test('valid order query | status:200 - sorted in [order]', () => {
          const validOrderQueries = ['asc', 'desc'];

          const requests = validOrderQueries.map((query) => {
            return request(app)
              .get(`/api/posts/1/comments?order=${query}`)
              .expect(200)
              .then(({ body: { comments } }) => {
                expect(comments).toBeSortedBy('created_at', {
                  descending: query === 'desc',
                });
              });
          });

          return Promise.all(requests);
        });

        test('invalid order query | status:400 - msg: "bad request"', () => {
          return request(app)
            .get('/api/posts/1/comments?order=invalidQuery')
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('bad request');
            });
        });
      });

      describe('limit query', () => {
        test('valid limit query | status:200 - no. of comments limited to [limit]', () => {
          const validLimitQueries = [1, 10, 20, 21];

          const requests = validLimitQueries.map((query) => {
            return request(app)
              .get(`/api/posts/1/comments?limit=${query}`)
              .expect(200)
              .then(({ body: { comments } }) => {
                expect(comments.length).toBe(query <= 20 ? query : 20);
              });
          });

          return Promise.all(requests);
        });

        test('invalid limit query - not a number | status:400 - msg: "bad request"', () => {
          return request(app)
            .get('/api/posts/1/comments?limit=notanumber')
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('bad request');
            });
        });

        test('invalid limit query - 0 | status:400 - msg: "bad request"', () => {
          return request(app)
            .get('/api/posts/1/comments?limit=0')
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('bad request');
            });
        });
      });

      describe('page query', () => {
        test('valid page query | status:200 - start page set correctly', () => {
          return request(app)
            .get('/api/posts/1/comments?page=2')
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(comments[0].comment_id).toBe(10);
            });
        });

        test('valid page query and valid limit query | status:200 - start page set correctly', () => {
          return request(app)
            .get('/api/posts/1/comments?limit=5&page=3')
            .expect(200)
            .then(({ body: { comments } }) => {
              expect(comments[0].comment_id).toBe(10);
            });
        });

        test('invalid page query - not a number | status:400 - msg: "bad request"', () => {
          return request(app)
            .get('/api/posts/1/comments?page=notanumber')
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('bad request');
            });
        });

        test('invalid page query - 0 | status:400 - msg: "bad request"', () => {
          return request(app)
            .get('/api/posts/1/comments?page=0')
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('bad request');
            });
        });
      });
    });
  });

  describe('POST comment', () => {
    describe('valid POST comment request body', () => {
      test('status:201 - comment object', () => {
        return request(app)
          .post('/api/posts/1/comments')
          .send({
            body: 'testbody',
            username: 'username1',
          })
          .expect(201)
          .then(({ body: { comment } }) => {
            expect(comment).toContainEntries([
              ['comment_id', 36],
              ['body', 'testbody'],
              ['created_by', 'username1'],
              ['votes', 0],
            ]);
            expect(new Date(comment.created_at)).toBeValidDate();
          });
      });
    });

    describe('invalid POST comment request body', () => {
      test('missing key | status:400 - msg: "bad request"', () => {
        const invalidReqBodies = [
          {
            body: 'testbody',
          },
          {
            username: 'username1',
          },
        ];

        const requests = invalidReqBodies.map((invalidReqBody) => {
          return request(app)
            .post('/api/posts/1/comments')
            .send(invalidReqBody)
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('bad request');
            });
        });

        return Promise.all(requests);
      });

      test('invalid request - non-existent username | status:422 - msg: "user not found"', () => {
        return request(app)
          .post('/api/posts/1/comments')
          .send({
            body: 'testbody',
            username: 'non-existent-username',
          })
          .expect(422)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('user not found');
          });
      });

      test('invalid request - non-existent post | status:422 - msg: "post not found"', () => {
        return request(app)
          .post('/api/posts/9999/comments')
          .send({
            body: 'testbody',
            username: 'username1',
          })
          .expect(422)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('post not found');
          });
      });
    });
  });
});
