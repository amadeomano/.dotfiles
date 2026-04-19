import {
  serializeSort,
  deserializeSort,
  serializeFilter,
  deserializeFilter,
  deserializeArrayFilter,
} from './serialization';

describe('serializeSort', () => {
  it('should serialize sort options with descending order', () => {
    const result = serializeSort({ id: 'testId', desc: true });
    expect(result).toEqual('testId;desc');
  });

  it('should serialize sort options with ascending order', () => {
    const result = serializeSort({ id: 'testId', desc: false });
    expect(result).toEqual('testId;asc');
  });
});

describe('deserializeSort', () => {
  it('should return undefined if the serialized string is "none"', () => {
    const result = deserializeSort('none');
    expect(result).toBeUndefined();
  });

  it('should deserialize a sort string to descending options', () => {
    const result = deserializeSort('testId;desc');
    expect(result).toEqual({ id: 'testId', desc: true });
  });

  it('should deserialize a sort string to ascending options', () => {
    const result = deserializeSort('testId;asc');
    expect(result).toEqual({ id: 'testId', desc: false });
  });

  it('should return ascending as default for invalid desc value', () => {
    const result = deserializeSort('testId;unknown');
    expect(result).toEqual({ id: 'testId', desc: false });
  });
});

describe('serializeFilter', () => {
  it('should serialize single value filter correctly', () => {
    const filter = {
      id: 'age',
      value: { value: 30, condition: 'equals' },
    };
    const result = serializeFilter(filter);
    expect(result).toEqual('age;equals;30');
  });

  it('should serialize array value filter correctly', () => {
    const filter = {
      id: 'hobbies',
      value: { value: ['reading', 'swimming'], condition: 'contains' },
    };
    const result = serializeFilter(filter);
    expect(result).toEqual('hobbies;contains;reading|swimming');
  });

  it('should serialize empty array value correctly', () => {
    const filter = {
      id: 'tags',
      value: { value: [], condition: 'contains' },
    };
    const result = serializeFilter(filter);
    expect(result).toEqual('tags;contains;');
  });
});

describe('deserializeFilter', () => {
  it('should deserialize filter string with single value correctly', () => {
    const filterString = 'age;equals;30';
    const result = deserializeFilter(filterString);
    expect(result).toEqual({
      id: 'age',
      value: { value: '30', condition: 'equals' },
    });
  });

  it('should deserialize filter string with array value without expanding', () => {
    const filterString = 'hobbies;contains;reading|swimming';
    const result = deserializeFilter(filterString);
    expect(result).toEqual({
      id: 'hobbies',
      value: { value: 'reading|swimming', condition: 'contains' },
    });
  });

  it('should deserialize filter string with empty array value correctly', () => {
    const filterString = 'tags;contains;';
    const result = deserializeFilter(filterString);
    expect(result).toEqual({
      id: 'tags',
      value: { value: '', condition: 'contains' },
    });
  });
});

describe('deserializeArrayFilter', () => {
  it('should deserialize filter string with single value into array correctly', () => {
    const filterString = 'age;equals;30';
    const result = deserializeArrayFilter(filterString);
    expect(result).toEqual({
      id: 'age',
      value: { value: ['30'], condition: 'equals' },
    });
  });

  it('should deserialize filter string with multiple values correctly', () => {
    const filterString = 'hobbies;contains;reading|swimming';
    const result = deserializeArrayFilter(filterString);
    expect(result).toEqual({
      id: 'hobbies',
      value: { value: ['reading', 'swimming'], condition: 'contains' },
    });
  });

  it('should deserialize filter string with no values into an empty array', () => {
    const filterString = 'tags;contains;';
    const result = deserializeArrayFilter(filterString);
    expect(result).toEqual({
      id: 'tags',
      value: { value: [''], condition: 'contains' },
    });
  });
});
