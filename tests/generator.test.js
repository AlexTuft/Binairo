var { message } = require('../generator')

test('test', () => {
  expect(message()).toBe('hello world')
})
