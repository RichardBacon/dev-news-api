const { formatDates } = require('./utils');

describe('formatDates', () => {
  describe('formats the given key into a valid Date object', () => {
    test('data array length 1', () => {
      const data = [
        {
          title: 'title1',
          topic: 'topic1',
          author: 'author1',
          body: 'body1',
          created_at: 1603475177570,
          votes: 0,
        },
      ];
      const formattedData = formatDates(data, 'created_at');

      formattedData.forEach((formattedDataItem) => {
        expect(formattedDataItem.created_at).toBeInstanceOf(Date);
      });
    });

    test('data array length > 1', () => {
      const data = [
        {
          title: 'title1',
          topic: 'topic1',
          author: 'author1',
          body: 'body1',
          created_at: 1603475177570,
          votes: 0,
        },
        {
          title: 'title2',
          topic: 'topic2',
          author: 'author2',
          body: 'body2',
          created_at: 1603475177570,
          votes: 0,
        },
        {
          title: 'title3',
          topic: 'topic3',
          author: 'author3',
          body: 'body3',
          created_at: 1603475177570,
          votes: 0,
        },
      ];
      const formattedData = formatDates(data, 'created_at');

      formattedData.forEach((formattedDataItem) => {
        expect(formattedDataItem.created_at).toBeInstanceOf(Date);
      });
    });

    test('given key does not exist', () => {
      const data = [
        {
          title: 'title1',
          topic: 'topic1',
          author: 'author1',
          body: 'body1',
          votes: 0,
        },
        {
          title: 'title2',
          topic: 'topic2',
          author: 'author2',
          body: 'body2',
          votes: 0,
        },
        {
          title: 'title3',
          topic: 'topic3',
          author: 'author3',
          body: 'body3',
          votes: 0,
        },
      ];
      const formattedData = formatDates(data, 'created_at');

      expect(formattedData).toEqual([
        {
          title: 'title1',
          topic: 'topic1',
          author: 'author1',
          body: 'body1',
          votes: 0,
        },
        {
          title: 'title2',
          topic: 'topic2',
          author: 'author2',
          body: 'body2',
          votes: 0,
        },
        {
          title: 'title3',
          topic: 'topic3',
          author: 'author3',
          body: 'body3',
          votes: 0,
        },
      ]);
    });
  });

  describe('functional purity', () => {
    test('input data is not mutated', () => {
      const data = [
        {
          title: 'title1',
          topic: 'topic1',
          author: 'author1',
          body: 'body1',
          created_at: 1603475177570,
          votes: 0,
        },
        {
          title: 'title2',
          topic: 'topic2',
          author: 'author2',
          body: 'body2',
          created_at: 1603475177570,
          votes: 0,
        },
        {
          title: 'title3',
          topic: 'topic3',
          author: 'author3',
          body: 'body3',
          created_at: 1603475177570,
          votes: 0,
        },
      ];

      formatDates(data, 'created_at');

      expect(data).toEqual([
        {
          title: 'title1',
          topic: 'topic1',
          author: 'author1',
          body: 'body1',
          created_at: 1603475177570,
          votes: 0,
        },
        {
          title: 'title2',
          topic: 'topic2',
          author: 'author2',
          body: 'body2',
          created_at: 1603475177570,
          votes: 0,
        },
        {
          title: 'title3',
          topic: 'topic3',
          author: 'author3',
          body: 'body3',
          created_at: 1603475177570,
          votes: 0,
        },
      ]);
    });

    test('returns new data', () => {
      const data = [
        {
          title: 'title1',
          topic: 'topic1',
          author: 'author1',
          body: 'body1',
          created_at: 1603475177570,
          votes: 0,
        },
        {
          title: 'title2',
          topic: 'topic2',
          author: 'author2',
          body: 'body2',
          created_at: 1603475177570,
          votes: 0,
        },
        {
          title: 'title3',
          topic: 'topic3',
          author: 'author3',
          body: 'body3',
          created_at: 1603475177570,
          votes: 0,
        },
      ];

      const formattedData = formatDates(data, 'created_at');

      expect(formattedData).not.toBe(data);
      expect(formattedData[0]).not.toBe(data[0]);
    });
  });
});
