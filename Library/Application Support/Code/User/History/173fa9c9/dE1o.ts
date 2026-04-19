import {
  getTabbarLocation,
  setTabbarLocation,
} from '../components/tabBarLocation';

describe('tabbarLocation', () => {
  it('should get the default tabbar location', () => {
    const location = getTabbarLocation(150);
    expect(location).toBe(150);
  });

  it('should set and get the tabbar location', () => {
    setTabbarLocation('top');
    const location = getTabbarLocation();
    expect(location).toBe('top');
  });

  it('should reset to default location', () => {
    setTabbarLocation('top');
    setTabbarLocation('bottom'); // Resetting to default
    const location = getTabbarLocation();
    expect(location).toBe('bottom');
  });

  it('should throw an error for invalid location', () => {
    expect(() => setTabbarLocation('left')).toThrow('Invalid tabbar location');
  });
});
