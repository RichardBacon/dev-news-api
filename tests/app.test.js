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
  });
});
