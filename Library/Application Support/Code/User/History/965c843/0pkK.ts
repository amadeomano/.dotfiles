import {
  type PayGroup,
  frequencyOptions,
  getPayGroupById,
  getPayGroupScheduleName,
} from './usePayGroups';
type Frequency = PayGroup['frequency'];

describe('frequencyOptions', () => {
  describe('getOption', () => {
    it('should return the correct option for a valid frequency', () => {
      expect(frequencyOptions.getOption('MONTHLY')).toEqual({
        id: 'MONTHLY',
        value: 'Monthly',
      });
      expect(frequencyOptions.getOption('WEEKLY')).toEqual({
        id: 'WEEKLY',
        value: 'Weekly',
      });
    });

    it('should return an empty option for an invalid frequency', () => {
      expect(frequencyOptions.getOption('DAILY' as Frequency)).toEqual({
        id: '',
        value: '',
      });
    });

    it('should return an empty option if no frequency is provided', () => {
      expect(frequencyOptions.getOption()).toEqual({ id: '', value: '' });
    });
  });

  describe('getOptions', () => {
    it('should return all frequency options', () => {
      const expectedOptions = [
        { id: 'MONTHLY', value: 'Monthly' },
        { id: 'WEEKLY', value: 'Weekly' },
      ];
      expect(frequencyOptions.getOptions()).toEqual(expectedOptions);
    });
  });
});

const payGroupMock: PayGroup[] = [
  { id: '1', frequency: 'MONTHLY' } as PayGroup,
  { id: '2', frequency: 'WEEKLY' } as PayGroup,
];

describe('getPayGroupById', () => {
  it('should return the correct pay group by ID', () => {
    expect(getPayGroupById(payGroupMock, '1')).toEqual({
      id: '1',
      frequency: 'MONTHLY',
    });
    expect(getPayGroupById(payGroupMock, '2')).toEqual({
      id: '2',
      frequency: 'WEEKLY',
    });
  });

  it('should return undefined for a non-existing ID', () => {
    expect(getPayGroupById(payGroupMock, '3')).toBeUndefined();
  });
});

describe('getPayGroupScheduleName', () => {
  it('should return the correct schedule name for a valid pay group', () => {
    const group1 = payGroupMock[0];
    const group2 = payGroupMock[1];
    expect(getPayGroupScheduleName(group1)).toBe('Monthly');
    expect(getPayGroupScheduleName(group2)).toBe('Weekly');
  });

  it('should return an empty string for an undefined pay group', () => {
    expect(getPayGroupScheduleName(undefined)).toBe('');
  });

  it('should return an empty string for a pay group with an unknown frequency', () => {
    const unknownGroup = { id: '3', frequency: 'YEARLY' } as PayGroup;
    expect(getPayGroupScheduleName(unknownGroup)).toBe('');
  });
});
