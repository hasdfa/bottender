import { payload } from '../constants';

it('export GET_STARTED payload with prefix', () => {
  expect(payload.GET_STARTED).toBe('__ALOHA.AI_GET_STARTED__');
});
