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
