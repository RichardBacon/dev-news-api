process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../../src/app');
const connection = require('../../db/connection');

beforeEach(() => connection.seed.run());
afterAll(() => connection.destroy());

describe('/api/posts', () => {
  test('invalid methods | status:405 - msg: "method not allowed"', () => {
    const invalidMethods = ['patch', 'put', 'delete'];
    const requests = invalidMethods.map((method) => {
      return request(app)
        [method]('/api/posts')
        .expect(405)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('method not allowed');
        });
    });
    return Promise.all(requests);
  });

  describe('GET posts', () => {
    test('valid request | status:200 - array of post objects', () => {
      return request(app)
        .get('/api/posts')
        .expect(200)
        .then(({ body: { posts } }) => {
          posts.forEach((post) => {
            expect(post).toContainAllKeys([
              'post_id',
              'title',
              'votes',
              'comment_count',
              'created_at',
              'created_by',
              'topic',
            ]);
          });
        });
    });

    test('comment_count property - total number of comments per post', () => {
      return request(app)
        .get('/api/posts')
        .expect(200)
        .then(({ body: { posts } }) => {
          expect(posts[0].comment_count).toBe('0');
          expect(posts[1].comment_count).toBe('0');
          expect(posts[2].comment_count).toBe('0');
          expect(posts[3].comment_count).toBe('0');
          expect(posts[4].comment_count).toBe('0');
          expect(posts[5].comment_count).toBe('1');
          expect(posts[6].comment_count).toBe('1');
          expect(posts[7].comment_count).toBe('2');
          expect(posts[8].comment_count).toBe('1');
          expect(posts[9].comment_count).toBe('5');
        });
    });

    test('total_count property - total number of posts', () => {
      return request(app)
        .get('/api/posts')
        .expect(200)
        .then(({ body: { total_count } }) => {
          expect(total_count).toBe('20');
        });
    });

    describe('GET posts - queries', () => {
      describe('sort_by query', () => {
        test('valid sort_by query | status:200 - sorted by [sort_by]', () => {
          const validSortByQueries = [
            'post_id',
            'title',
            'votes',
            'created_at',
            'created_by',
            'topic',
          ];

          const requests = validSortByQueries.map((query) => {
            return request(app)
              .get(`/api/posts?sort_by=${query}`)
              .expect(200)
              .then(({ body: { posts } }) => {
                expect(posts).toBeSortedBy(query, { descending: true });
              });
          });

          return Promise.all(requests);
        });

        test('invalid sort_by query | status:400 - msg: "bad request"', () => {
          return request(app)
            .get('/api/posts?sort_by=invalid')
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
              .get(`/api/posts?order=${query}`)
              .expect(200)
              .then(({ body: { posts } }) => {
                expect(posts).toBeSortedBy('created_at', {
                  descending: query === 'desc',
                });
              });
          });

          return Promise.all(requests);
        });

        test('invalid order query | status:400 - msg: "bad request"', () => {
          return request(app)
            .get('/api/posts?order=invalidQuery')
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('bad request');
            });
        });
      });

      describe('created_by query', () => {
        test('valid created_by query | status:200 - filtered by created_by', () => {
          return request(app)
            .get('/api/posts?created_by=username1')
            .expect(200)
            .then(({ body: { posts } }) => {
              const predicate = (post) => post.created_by === 'username1';

              expect(posts).toSatisfyAll(predicate);
            });
        });

        test('valid created_by query - valid user with no posts | status:200 - empty array', () => {
          return request(app)
            .get('/api/posts?created_by=username5')
            .expect(200)
            .then(({ body: { posts } }) => {
              expect(posts).toEqual([]);
            });
        });

        test('invalid created_by query - non-existent username | status:404 - msg: "user not found"', () => {
          return request(app)
            .get('/api/posts?created_by=non-existent')
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('user not found');
            });
        });
      });

      describe('topic query', () => {
        test('valid topic query | status:200 - filtered by topic', () => {
          return request(app)
            .get('/api/posts?topic=topic1')
            .expect(200)
            .then(({ body: { posts } }) => {
              const predicate = (post) => post.topic === 'topic1';

              expect(posts).toSatisfyAll(predicate);
            });
        });

        test('valid topic query - valid topic with no posts | status:200 - empty array', () => {
          return request(app)
            .get('/api/posts?topic=topic5')
            .expect(200)
            .then(({ body: { posts } }) => {
              expect(posts).toEqual([]);
            });
        });

        test('invalid topic query - non-existent topic | status:404 - msg: "topic not found"', () => {
          return request(app)
            .get('/api/posts?topic=non-existent')
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('topic not found');
            });
        });
      });

      describe('limit query', () => {
        test('valid limit query | status:200 - no. of posts limited to [limit]', () => {
          const validLimitQueries = [1, 10, 20, 21];

          const requests = validLimitQueries.map((query) => {
            return request(app)
              .get(`/api/posts?limit=${query}`)
              .expect(200)
              .then(({ body: { posts } }) => {
                expect(posts.length).toBe(query <= 20 ? query : 20);
              });
          });

          return Promise.all(requests);
        });

        test('invalid limit query - not a number | status:400 - msg: "bad request"', () => {
          return request(app)
            .get('/api/posts?limit=notanumber')
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('bad request');
            });
        });

        test('invalid limit query - 0 | status:400 - msg: "bad request"', () => {
          return request(app)
            .get('/api/posts?limit=0')
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('bad request');
            });
        });
      });

      describe('page query', () => {
        test('valid page query | status:200 - start page set correctly', () => {
          return request(app)
            .get('/api/posts?page=2')
            .expect(200)
            .then(({ body: { posts } }) => {
              expect(posts[0].post_id).toBe(10);
            });
        });

        test('valid page query and valid limit query | status:200 - start page set correctly', () => {
          return request(app)
            .get('/api/posts?limit=5&page=3')
            .expect(200)
            .then(({ body: { posts } }) => {
              expect(posts[0].post_id).toBe(10);
            });
        });

        test('invalid page query - not a number | status:400 - msg: "bad request"', () => {
          return request(app)
            .get('/api/posts?page=notanumber')
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('bad request');
            });
        });

        test('invalid page query - 0 | status:400 - msg: "bad request"', () => {
          return request(app)
            .get('/api/posts?page=0')
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('bad request');
            });
        });
      });
    });
  });

  describe('POST post', () => {
    describe('valid POST post request body', () => {
      test('status:201 - post object', () => {
        return request(app)
          .post('/api/posts')
          .send({
            title: 'testtitle',
            body: 'testbody',
            username: 'username1',
            topic: 'topic1',
          })
          .expect(201)
          .then(({ body: { post } }) => {
            expect(post).toContainEntries([
              ['title', 'testtitle'],
              ['body', 'testbody'],
              ['created_by', 'username1'],
              ['votes', 0],
              ['topic', 'topic1'],
            ]);
            expect(new Date(post.created_at)).toBeValidDate();
          });
      });
    });

    describe('invalid POST post request body', () => {
      test('missing key | status:400 - msg: "bad request"', () => {
        const invalidReqBodies = [
          {
            body: 'testbody',
            username: 'username1',
            topic: 'topic1',
          },
          {
            title: 'testtitle',
            username: 'username1',
            topic: 'topic1',
          },
          {
            title: 'testtitle',
            body: 'testbody',
            topic: 'topic1',
          },
          {
            title: 'testtitle',
            body: 'testbody',
            username: 'username1',
          },
        ];

        const requests = invalidReqBodies.map((invalidReqBody) => {
          return request(app)
            .post('/api/posts')
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
          .post('/api/posts')
          .send({
            title: 'testtitle',
            body: 'testbody',
            username: 'non-existent-username',
            topic: 'topic1',
          })
          .expect(422)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('user not found');
          });
      });

      test('invalid request - non-existent topic | status:422 - msg: "topic not found"', () => {
        return request(app)
          .post('/api/posts')
          .send({
            title: 'testtitle',
            body: 'testbody',
            username: 'username1',
            topic: 'non-existent-topic',
          })
          .expect(422)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('topic not found');
          });
      });
    });
  });
});

describe('/api/posts/:post_id', () => {
  test('invalid methods | status:405 - msg: "method not allowed"', () => {
    const invalidMethods = ['post', 'put'];
    const requests = invalidMethods.map((method) => {
      return request(app)
        [method]('/api/posts/1')
        .expect(405)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('method not allowed');
        });
    });

    return Promise.all(requests);
  });

  describe('GET', () => {
    test('valid request | status:200 | post object', () => {
      return request(app)
        .get('/api/posts/1')
        .expect(200)
        .then(({ body: { post } }) => {
          expect(post).toContainEntries([
            ['post_id', 1],
            ['title', 'post1'],
            ['created_by', 'username1'],
            [
              'body',
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a ante et libero vehicula iaculis non a leo. Praesent et massa metus. Morbi ultrices porta est, at gravida risus porttitor non. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc id blandit metus.',
            ],
            ['topic', 'topic1'],
            ['votes', 0],
          ]);
        });
    });

    test('comment_count property - total number of comments per post', () => {
      return request(app)
        .get('/api/posts/1')
        .expect(200)
        .then(({ body: { post } }) => {
          expect(post.comment_count).toBe('5');
        });
    });

    test('invalid request - non-existent post_id | status:404 - msg: "post not found"', () => {
      return request(app)
        .get('/api/posts/99999')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('post not found');
        });
    });

    test('invalid request - invalid post_id | status:400 - msg: "bad request"', () => {
      return request(app)
        .get('/api/posts/notANumber')
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('bad request');
        });
    });
  });

  describe('PATCH', () => {
    describe('valid PATCH post request', () => {
      test('status:200 - post object', () => {
        return request(app)
          .patch('/api/posts/1')
          .send({
            inc_votes: 1,
          })
          .expect(200)
          .then(({ body: { post } }) => {
            expect(post).toContainEntries([
              ['post_id', 1],
              ['title', 'post1'],
              ['created_by', 'username1'],
              [
                'body',
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a ante et libero vehicula iaculis non a leo. Praesent et massa metus. Morbi ultrices porta est, at gravida risus porttitor non. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc id blandit metus.',
              ],
              ['topic', 'topic1'],
              ['votes', 1],
            ]);
          });
      });

      test('only inc_votes key can be updated', () => {
        return request(app)
          .patch('/api/posts/1')
          .send({
            inc_votes: 1,
            created_by: 'new-author',
            title: 'new-title',
            post_id: 999,
            body: 'new-body',
            created_at: new Date(Date.now()).toISOString(),
            votes: 999,
          })
          .expect(200)
          .then(({ body: { post } }) => {
            expect(post).toContainEntries([
              ['post_id', 1],
              ['title', 'post1'],
              ['created_by', 'username1'],
              [
                'body',
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a ante et libero vehicula iaculis non a leo. Praesent et massa metus. Morbi ultrices porta est, at gravida risus porttitor non. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc id blandit metus.',
              ],
              ['topic', 'topic1'],
              ['votes', 1],
            ]);
          });
      });

      test('missing inc_votes key | status:200 - unchanged post object', () => {
        return request(app)
          .patch('/api/posts/1')
          .send({
            inc_vote: 1,
          })
          .expect(200)
          .then(({ body: { post } }) => {
            expect(post).toContainEntries([
              ['post_id', 1],
              ['title', 'post1'],
              ['created_by', 'username1'],
              [
                'body',
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a ante et libero vehicula iaculis non a leo. Praesent et massa metus. Morbi ultrices porta est, at gravida risus porttitor non. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc id blandit metus.',
              ],
              ['topic', 'topic1'],
              ['votes', 0],
            ]);
          });
      });
    });

    describe('invalid PATCH post request', () => {
      test('non-existent post_id | status:404 - msg: "post not found"', () => {
        return request(app)
          .patch('/api/posts/99999')
          .send({
            inc_votes: 1,
          })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('post not found');
          });
      });

      test('invalid post_id | status:400 - msg: "bad request"', () => {
        return request(app)
          .patch('/api/posts/notANumber')
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
          .patch('/api/posts/1')
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
        .delete('/api/posts/1')
        .expect(204)
        .then(({ body }) => {
          expect(body).toEqual({});
        });
    });

    describe('invalid DELETE post request', () => {
      test('non-existent post_id | status:404 - msg: "post not found"', () => {
        return request(app)
          .delete('/api/posts/99999')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('post not found');
          });
      });

      test('invalid post_id | status:400 - msg: "bad request"', () => {
        return request(app)
          .delete('/api/posts/notANumber')
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('bad request');
          });
      });
    });
  });
});
