process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const connection = require('../db/connection');

beforeEach(() => connection.seed.run());
afterAll(() => connection.destroy());

describe('routes', () => {
  test('invalid route | status:404 - msg: "resource not found"', () => {
    const methods = ['get', 'post', 'patch', 'put', 'delete'];
    const requests = methods.map((method) => {
      return request(app)
        [method]('/invalid')
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe('resource not found');
        });
    });
    return Promise.all(requests);
  });

  describe('/api', () => {
    test('invalid methods | status:405 - msg: "method not allowed"', () => {
      const invalidMethods = ['get', 'post', 'patch', 'put', 'delete'];
      const requests = invalidMethods.map((method) => {
        return request(app)
          [method]('/api')
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('method not allowed');
          });
      });
      return Promise.all(requests);
    });
  });

  describe('/api/users', () => {
    test('invalid methods | status:405 - msg: "method not allowed"', () => {
      const invalidMethods = ['patch', 'put', 'delete'];
      const requests = invalidMethods.map((method) => {
        return request(app)
          [method]('/api/users')
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('method not allowed');
          });
      });
      return Promise.all(requests);
    });

    describe('GET users', () => {
      test('valid request | status:200 - array of user objects', () => {
        return request(app)
          .get('/api/users')
          .expect(200)
          .then(({ body: { users } }) => {
            users.forEach((user) => {
              expect(user).toContainAllKeys([
                'username',
                'first_name',
                'last_name',
                'email',
              ]);
            });
          });
      });
    });

    describe('POST user', () => {
      describe('valid POST user request body', () => {
        test('status:201 | user object', () => {
          return request(app)
            .post('/api/users')
            .send({
              username: 'testusername',
              first_name: 'testfirst',
              last_name: 'testlast',
              email: 'test@email.com',
            })
            .expect(201)
            .then(({ body: { user } }) => {
              expect(user).toEqual({
                username: 'testusername',
                first_name: 'testfirst',
                last_name: 'testlast',
                email: 'test@email.com',
              });
            });
        });
      });

      describe('invalid POST user request body', () => {
        test('missing key | status:400 - msg: "bad request"', () => {
          const invalidReqBodies = [
            {
              first_name: 'testfirst',
              last_name: 'testlast',
              email: 'test@email.com',
            },
            {
              username: 'testusername',
              last_name: 'testlast',
              email: 'test@email.com',
            },
            {
              username: 'testusername',
              first_name: 'testfirst',
              email: 'test@email.com',
            },
            {
              username: 'testusername',
              first_name: 'testfirst',
              last_name: 'testlast',
            },
          ];

          const requests = invalidReqBodies.map((invalidReqBody) => {
            return request(app)
              .post('/api/users')
              .send(invalidReqBody)
              .expect(400)
              .then(({ body: { msg } }) => {
                expect(msg).toBe('bad request');
              });
          });

          return Promise.all(requests);
        });

        test('existing username | status:400 - msg: "bad request"', () => {
          return request(app)
            .post('/api/users')
            .send({
              username: 'username1',
              first_name: 'first_name1',
              last_name: 'last_name1',
              email: 'first_name1.last_name1@email.com',
            })
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('bad request');
            });
        });
      });
    });
  });

  describe('/api/users/:username', () => {
    test('invalid methods | status:405 - msg: "method not allowed"', () => {
      const invalidMethods = ['post', 'patch', 'put', 'delete'];
      const requests = invalidMethods.map((method) => {
        return request(app)
          [method]('/api/users/username')
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('method not allowed');
          });
      });

      return Promise.all(requests);
    });

    describe('GET user by username', () => {
      test('valid request | status:200 | user object', () => {
        return request(app)
          .get('/api/users/username1')
          .expect(200)
          .then(({ body: { user } }) => {
            expect(user).toEqual({
              username: 'username1',
              first_name: 'first_name1',
              last_name: 'last_name1',
              email: 'first_name1.last_name1@email.com',
            });
          });
      });

      test('invalid request - non-existent username | status:404 - msg: "user not found"', () => {
        return request(app)
          .get('/api/users/non_existent')
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('user not found');
          });
      });
    });
  });

  describe('/api/topics', () => {
    test('invalid methods | status:405 - msg: "method not allowed"', () => {
      const invalidMethods = ['patch', 'put', 'delete'];
      const requests = invalidMethods.map((method) => {
        return request(app)
          [method]('/api/topics')
          .expect(405)
          .then(({ body: { msg } }) => {
            expect(msg).toBe('method not allowed');
          });
      });
      return Promise.all(requests);
    });

    describe('GET topics', () => {
      test('valid request | status:200 - array of topic objects', () => {
        return request(app)
          .get('/api/topics')
          .expect(200)
          .then(({ body: { topics } }) => {
            topics.forEach((topic) => {
              expect(topic).toContainAllKeys([
                'title',
                'description',
                'created_at',
                'created_by',
              ]);
            });
          });
      });
    });

    describe('POST topic', () => {
      describe('valid POST topic request body', () => {
        test('status:201 | topic object', () => {
          return request(app)
            .post('/api/topics')
            .send({
              title: 'testtitle',
              description: 'testdescription',
              username: 'username1',
            })
            .expect(201)
            .then(({ body: { topic } }) => {
              expect(topic).toContainEntries([
                ['title', 'testtitle'],
                ['description', 'testdescription'],
                ['created_by', 'username1'],
              ]);
              expect(new Date(topic.created_at)).toBeValidDate();
            });
        });
      });

      describe('invalid POST topic request body', () => {
        test('missing key | status:400 - msg: "bad request"', () => {
          const invalidReqBodies = [
            {
              description: 'testdescription',
              username: 'username1',
            },
            {
              title: 'testtitle',
              username: 'username1',
            },
            {
              title: 'testtitle',
              description: 'testdescription',
            },
          ];

          const requests = invalidReqBodies.map((invalidReqBody) => {
            return request(app)
              .post('/api/topics')
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
            .post('/api/topics')
            .send({
              title: 'testtitle',
              description: 'testdescription',
              username: 'non-existent-username',
            })
            .expect(422)
            .then(({ body: { msg } }) => {
              expect(msg).toBe('user not found');
            });
        });
      });
    });
  });

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
  });
});
