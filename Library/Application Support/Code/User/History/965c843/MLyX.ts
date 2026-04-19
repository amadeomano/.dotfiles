import { frequencyOptions } from './usePayGroups';
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
      expect(frequencyOptions.getOption('DAILY')).toEqual({
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
