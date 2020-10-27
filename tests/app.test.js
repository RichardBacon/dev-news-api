process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const connection = require('../db/connection');

beforeEach(() => connection.seed.run());
afterAll(() => connection.destroy());

describe('routes', () => {
  test('invalid route | status:404 | msg: "resource not found"', () => {
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
    test('invalid methods | status:405 | msg: "method not allowed"', () => {
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
    describe('GET', () => {
      test('valid request | status:200 | array of user objects', () => {
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

    describe('POST', () => {
      describe('valid request body', () => {
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

      describe('invalid request body', () => {
        test('missing key | status:400 | msg: "bad request"', () => {
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

        test('existing username | status:400 | msg: "bad request"', () => {
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
    test('invalid methods | status:405 | msg: "method not allowed"', () => {
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

    describe('GET', () => {
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

      test('non-existent username | status:404 | msg: "user not found"', () => {
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
    describe('GET', () => {
      test('valid request | status:200 | array of topic objects', () => {
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

    describe('POST', () => {
      describe('valid request body', () => {
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

      describe('invalid request body', () => {
        test('missing key | status:400 | msg: "bad request"', () => {
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

        test('non-existent username | status:422 | msg: "user not found"', () => {
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
});
