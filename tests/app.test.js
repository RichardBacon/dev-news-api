process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/app');
const connection = require('../db/connection');

beforeEach(() => connection.seed.run());
afterAll(() => connection.destroy());

describe('/', () => {
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

    describe('/users', () => {
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

          test('superfluous keys | status:201 | user object', () => {
            return request(app)
              .post('/api/users')
              .send({
                superfluous_key1: 'superfluous',
                username: 'testusername',
                superfluous_key2: 'superfluous',
                first_name: 'testfirst',
                superfluous_key3: 'superfluous',
                last_name: 'testlast',
                superfluous_key4: 'superfluous',
                email: 'test@email.com',
                superfluous_key5: 'superfluous',
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

          test('misspelt key | status:400 | msg: "bad request"', () => {
            const invalidReqBodies = [
              {
                usrname: 'testusername',
                first_name: 'testfirst',
                last_name: 'testlast',
                email: 'test@email.com',
              },
              {
                username: 'testusername',
                firstname: 'testfirst',
                last_name: 'testlast',
                email: 'test@email.com',
              },
              {
                username: 'testusername',
                first_name: 'testfirst',
                lastName: 'testlast',
                email: 'test@email.com',
              },
              {
                username: 'testusername',
                first_name: 'testfirst',
                last_name: 'testlast',
                emails: 'test@email.com',
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

    describe('/:username', () => {
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
  });
});
