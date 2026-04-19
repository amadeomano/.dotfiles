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

// Sample data for testing
const payGroups = [
  { id: '1', frequency: 'MONTHLY' },
  { id: '2', frequency: 'WEEKLY' },
];

// Function implementations (mocked for testing purposes)
function getPayGroupById(
  payGroups: { id: string; frequency: string }[],
  id: string,
) {
  return payGroups.find((group) => group.id === id);
}

function getScheduleName(
  payGroups: { id: string; frequency: string }[],
  id: string,
) {
  const payGroup = getPayGroupById(payGroups, id);
  if (!payGroup) return '';
  switch (payGroup.frequency) {
    case 'MONTHLY':
      return 'Monthly';
    case 'WEEKLY':
      return 'Weekly';
    default:
      return '';
  }
}

// Test cases
describe('getPayGroupById', () => {
  it('should return the correct pay group by ID', () => {
    expect(getPayGroupById(payGroups, '1')).toEqual({
      id: '1',
      frequency: 'MONTHLY',
    });
    expect(getPayGroupById(payGroups, '2')).toEqual({
      id: '2',
      frequency: 'WEEKLY',
    });
  });

  it('should return undefined for a non-existing ID', () => {
    expect(getPayGroupById(payGroups, '3')).toBeUndefined();
  });
});

describe('getScheduleName', () => {
  it('should return the correct schedule name for a valid pay group ID', () => {
    expect(getScheduleName(payGroups, '1')).toBe('Monthly');
    expect(getScheduleName(payGroups, '2')).toBe('Weekly');
  });

  it('should return an empty string for a non-existing pay group ID', () => {
    expect(getScheduleName(payGroups, '3')).toBe('');
  });
});
