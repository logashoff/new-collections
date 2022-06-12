import { OrderkeysPipe } from './orderkeys.pipe';

describe('OrderkeysPipe', () => {
  let orderkeys: OrderkeysPipe;

  beforeEach(() => {
    orderkeys = new OrderkeysPipe();
  });

  it('should return objects in correct order', () => {
    const object = {
      c: 1,
      o: 2,
      l: 3,
      1: 10,
      e: 4,
      t: 5,
    };

    expect(orderkeys.transform(object)).toEqual([
      {
        key: '1',
        value: 10,
      },
      {
        key: 'c',
        value: 1,
      },
      {
        key: 'o',
        value: 2,
      },
      {
        key: 'l',
        value: 3,
      },
      {
        key: 'e',
        value: 4,
      },
      {
        key: 't',
        value: 5,
      },
    ]);
  });

  it('should handle null value', () => {
    expect(orderkeys.transform(null)).toEqual([]);
  });
});
