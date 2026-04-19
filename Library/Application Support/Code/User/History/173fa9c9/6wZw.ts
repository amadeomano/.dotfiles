import {
  TABBAR_PROPERTY,
  getTabbarLocation,
  setTabbarLocation,
} from '../components/tabBarLocation';

describe('Tabbar Location Functions', () => {
  let tabBarElement: HTMLDivElement;

  beforeEach(() => {
    tabBarElement = document.createElement('div');
    document.body.appendChild(tabBarElement);
  });

  afterEach(() => {
    document.body.removeChild(tabBarElement);
    document.documentElement.style.removeProperty(TABBAR_PROPERTY);
  });

  test('sets the tabbar location correctly', () => {
    tabBarElement.getBoundingClientRect = jest.fn(
      () => ({ top: 100 } as DOMRect),
    );

    setTabbarLocation(tabBarElement);
    const computedStyle = getComputedStyle(document.documentElement);
    const distance = computedStyle.getPropertyValue(TABBAR_PROPERTY).trim();
    expect(distance).toBe('50px'); // 100 - 50 (breadcrumbHeight)
  });

  test('removes the property if tabBarElement is null', () => {
    setTabbarLocation(null);
    const computedStyle = getComputedStyle(document.documentElement);
    const distance = computedStyle.getPropertyValue(TABBAR_PROPERTY);
    expect(distance).toBe('');
  });

  test('gets the tabbar location with a valid property', () => {
    tabBarElement.getBoundingClientRect = jest.fn(
      () => ({ top: 100 } as DOMRect),
    );

    setTabbarLocation(tabBarElement);
    const location = getTabbarLocation(0);
    expect(location).toBe(50); // 100 - 50 (breadcrumbHeight)
  });

  test('returns default location if property is not set', () => {
    const defaultLocation = 75;
    const location = getTabbarLocation(defaultLocation);
    expect(location).toBe(defaultLocation);
  });

  test('returns default location if property is NaN', () => {
    document.documentElement.style.setProperty(TABBAR_PROPERTY, 'not-a-number');
    const defaultLocation = 75;
    const location = getTabbarLocation(defaultLocation);
    expect(location).toBe(defaultLocation);
  });
});
