import { renderHook, act } from '@testing-library/react-hooks';
import { getSchemasFn, useBreadcrumbSchema } from '../Pickers/breadcrumbs';
import { type BreadcrumbSchema } from 'designSystem/component/page';
import { type InfoPicker } from '../Pickers/types';

describe('getSchemasFn', () => {
  const title = 'Test Title';
  const legalEntities: InfoPicker = {
    list: [{ key: 'entity1', label: 'Entity 1' }],
    onSelect: jest.fn(),
    selected: 'entity1',
  };
  const tabs: InfoPicker = {
    list: [{ key: 'tab1', label: 'Tab 1' }],
    onSelect: jest.fn(),
    selected: 'tab1',
  };

  it('should return correct schema based on breadcrumb depth', () => {
    const schemasFn = getSchemasFn(title, legalEntities, tabs);

    const schemaDepth0 = schemasFn(0);
    expect(schemaDepth0).toEqual([
      expect.objectContaining({ id: 'title', isVisible: false }),
      expect.objectContaining({ id: 'legalEntities', isVisible: false }),
      expect.objectContaining({ id: 'tabs', isVisible: false }),
    ]);

    const schemaDepth1 = schemasFn(1);
    expect(schemaDepth1).toEqual([
      expect.objectContaining({ id: 'title', isVisible: true }),
      expect.objectContaining({ id: 'legalEntities', isVisible: false }),
      expect.objectContaining({ id: 'tabs', isVisible: false }),
    ]);

    const schemaDepth2 = schemasFn(2);
    expect(schemaDepth2).toEqual([
      expect.objectContaining({ id: 'title', isVisible: true }),
      expect.objectContaining({ id: 'legalEntities', isVisible: true }),
      expect.objectContaining({ id: 'tabs', isVisible: true }),
    ]);
  });
});

describe('useBreadcrumbSchema', () => {
  it('should update breadcrumb depth based on scroll position', () => {
    const scrollRef = { current: document.createElement('div') };
    const schemasFn = jest.fn(
      (depth: number): BreadcrumbSchema => [
        { label: 'Test', id: 'test', isVisible: depth > 0 },
      ],
    );

    const { result } = renderHook(() =>
      useBreadcrumbSchema(scrollRef, schemasFn),
    );

    act(() => {
      scrollRef.current.scrollTop = 60;
      scrollRef.current.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.breadcrumbDepth).toBe(1);
    expect(schemasFn).toHaveBeenCalledWith(1);

    act(() => {
      scrollRef.current.scrollTop = 160;
      scrollRef.current.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.breadcrumbDepth).toBe(2);
    expect(schemasFn).toHaveBeenCalledWith(2);

    act(() => {
      scrollRef.current.scrollTop = 30;
      scrollRef.current.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.breadcrumbDepth).toBe(0);
    expect(schemasFn).toHaveBeenCalledWith(0);
  });
});
