process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const connection = require('../db/connection');

beforeEach(() => connection.seed.run());
afterAll(() => connection.destroy());

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
