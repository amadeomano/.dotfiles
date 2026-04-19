import mockRouter from 'next-router-mock';

import {
  act,
  renderHook,
  waitFor,
  render,
  screen,
} from '@testing-library/react';
import {
  LOCAL_STORAGE_DEFAULT_VALUE_WARNING_MSG,
  useQueryParamState,
} from '../useQueryParamState';
import { compressToEncodedURIComponent } from 'lz-string';
import { parseAsArrayOf, parseAsJson, parseAsString } from 'nuqs-next-router';
import {
  type PersonAttribute,
  type OrgChartFilter,
  type GenerateOrgChartLinkOptions,
  PersonSystemAttribute,
  generateOrgChartLink,
} from '@personio-web/eo-commons-org-chart-link';

jest.mock('next/router', () => require('next-router-mock'));

const assertSearchParams = (
  expectedKey: string,
  expectedValue: string | null,
) => {
  const params = new URLSearchParams(window.location.search);
  expect(params.get(expectedKey)).toEqual(
    expectedValue ? compressToEncodedURIComponent(expectedValue) : null,
  );
};

const assertLocalStorage = (
  expectedKey: string,
  expectedValue: string | null,
) => {
  expect(window.localStorage.getItem(expectedKey)).toBe(
    expectedValue ? compressToEncodedURIComponent(expectedValue) : null,
  );
};

const SampleQueryStateConsumer = () => {
  const [attributeIds] = useQueryParamState<PersonAttribute[]>({
    key: 'attributes',
    // since defaultValue has a JSON array defined, we do not need to use `forceParseAsJson`
    defaultValue: ['outdated-attribute'],
  });

  const [cardPreferences] = useQueryParamState<
    GenerateOrgChartLinkOptions['cardCustomizationPreferences']
  >({
    key: 'cardCustomizationPreferences',
    defaultValue: {
      personalInfo: true,
      avatars: true,
      cardClustering: true,
      openPositions: false,
    },
  });

  const [filters] = useQueryParamState<GenerateOrgChartLinkOptions['filters']>({
    key: 'filters',
    defaultValue: [],
    // set to true since the defaultValue of empty array will not
    // allow us to "detect" the type of the array children
    forceParseAsJson: true,
  });

  const [highlighted] = useQueryParamState<PersonAttribute>({
    key: 'highlighted',
    defaultValue: '',
  });

  const [spotlight] = useQueryParamState<PersonAttribute>({
    key: 'spotlight',
    defaultValue: '',
  });

  return (
    <div>
      <span data-test-id="parsed-value-attributes">
        {attributeIds.join(',')}
      </span>
      <span data-test-id="parsed-value-cardCustomizationPreferences">
        {`Cluster Cards: ${cardPreferences.cardClustering} / Personal Info: ${cardPreferences.personalInfo} / Avatars: ${cardPreferences.avatars}`}
      </span>
      <span data-test-id="parsed-value-filters">
        {filters
          .map((f: GenerateOrgChartLinkOptions['filters'][0]) => f.id)
          .join(',')}
      </span>
      <span data-test-id="parsed-value-highlighted">
        {`Attribute: ${highlighted}`}
      </span>
      <span data-test-id="parsed-value-spotlight">
        {`Spotlight: ${spotlight}`}
      </span>
    </div>
  );
};

describe('useQueryParamState', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the default state', () => {
    const { result } = renderHook(() =>
      useQueryParamState<string>({ key: 'foo', defaultValue: 'bar' }),
    );

    expect(result.current[0]).toEqual('bar');

    // expect null / not-present since it's the default value
    // and we are passing clearOnDefault: true
    assertSearchParams('foo', null);
  });

  it('should return the null without a default state', () => {
    const { result } = renderHook(() =>
      useQueryParamState<string>({ key: 'foo' }),
    );

    expect(result.current[0]).toEqual(null);

    // expect null / not-present since it's actually _not_ present
    assertSearchParams('foo', null);
  });

  it('should update state when called', async () => {
    jest.spyOn(mockRouter, 'push');
    const { result } = renderHook(() =>
      useQueryParamState<string>({ key: 'foo', defaultValue: 'bar' }),
    );

    const [state, setState] = result.current;

    expect(state).toEqual('bar');
    await act(() => setState('baz'));

    await waitFor(() => expect(result.current[0]).toEqual('baz'));
    assertSearchParams('foo', 'baz');
  });

  it('should update history state when called', async () => {
    const { result } = renderHook(() =>
      useQueryParamState<string>({ key: 'foo', defaultValue: 'bar' }),
    );

    const [state, setState] = result.current;

    expect(state).toEqual('bar');

    await act(() => setState('baz'));

    await waitFor(() => expect(result.current[0]).toEqual('baz'));

    await act(() => setState('qux'));

    await waitFor(() => expect(result.current[0]).toEqual('qux'));

    // ensure params were replaced
    assertSearchParams('foo', 'qux');

    expect(window.history.length).toBe(1);
  });

  it('should incremment history state when called with push', async () => {
    const { result } = renderHook(() =>
      useQueryParamState<string>({
        key: 'foo',
        defaultValue: 'bar',
        push: true,
      }),
    );

    const [state, setState] = result.current;

    expect(state).toEqual('bar');

    await act(() => setState('baz'));

    await waitFor(() => expect(result.current[0]).toEqual('baz'));

    await act(() => setState('qux'));

    await waitFor(() => expect(result.current[0]).toEqual('qux'));

    // ensure params were replaced
    assertSearchParams('foo', 'qux');

    expect(window.history.length).toBe(3);
  });

  describe('data types and parsers', () => {
    it('should retrieve data from hook when set as string', async () => {
      const stateToSet = 'bar';
      const newVal = 'baz';

      const { result } = renderHook(() =>
        useQueryParamState<string>({ key: 'foo', defaultValue: stateToSet }),
      );

      const [state, setState] = result.current;

      expect(state).toEqual(stateToSet);

      await act(() => setState(newVal));

      await waitFor(() => assertSearchParams('foo', newVal));
      expect(result.current[0]).toEqual(newVal);
    });

    it('should retrieve data from hook when set as number', async () => {
      const stateToSet = 10;
      const newVal = 20;

      const { result } = renderHook(() =>
        useQueryParamState<number>({ key: 'foo', defaultValue: stateToSet }),
      );

      const [state, setState] = result.current;

      expect(state).toEqual(stateToSet);

      await act(() => setState(newVal));

      await waitFor(() => assertSearchParams('foo', newVal.toString()));
      expect(result.current[0]).toEqual(newVal);
    });

    it('should retrieve data from hook when set as float', async () => {
      const stateToSet = 10.505;
      const newVal = 10.101;

      const { result } = renderHook(() =>
        useQueryParamState<number>({ key: 'foo', defaultValue: stateToSet }),
      );

      const [state, setState] = result.current;

      expect(state).toEqual(stateToSet);

      await act(() => setState(newVal));

      await waitFor(() => assertSearchParams('foo', newVal.toString()));
      expect(result.current[0]).toEqual(newVal);
    });

    it('should retrieve data from hook when set as array', async () => {
      const stateToSet = ['one', 'two', 'three'];
      const newVal = ['three', 'five'];

      const { result } = renderHook(() =>
        useQueryParamState<string[]>({ key: 'foo', defaultValue: stateToSet }),
      );

      const [state, setState] = result.current;

      expect(state).toEqual(stateToSet);

      await act(() => setState(newVal));

      await waitFor(() =>
        assertSearchParams(
          'foo',
          parseAsArrayOf<string>(parseAsString).serialize(newVal),
        ),
      );
      expect(result.current[0]).toEqual(newVal);
    });

    it('should retrieve data from hook when set as object', async () => {
      const stateToSet = {
        five: 5,
        ten: 10,
      };
      const newVal = {
        five: 15,
        ten: 1,
      };

      const { result } = renderHook(() =>
        useQueryParamState<object>({ key: 'foo', defaultValue: stateToSet }),
      );

      const [state, setState] = result.current;

      expect(state).toEqual(stateToSet);

      await act(() => setState(newVal));

      await waitFor(() => assertSearchParams('foo', JSON.stringify(newVal)));
      expect(result.current[0]).toEqual(newVal);
    });

    it('should force parse to as json when instructed', async () => {
      const newVal = [
        {
          five: 15,
          ten: 1,
        },
      ];

      const { result } = renderHook(() =>
        useQueryParamState<unknown[]>({
          key: 'foo',
          defaultValue: [],
          forceParseAsJson: true,
        }),
      );

      const [, setState] = result.current;

      await act(() => setState(newVal));

      await waitFor(() =>
        assertSearchParams(
          'foo',
          parseAsArrayOf<unknown>(parseAsJson()).serialize(newVal),
        ),
      );
      expect(result.current[0]).toEqual(newVal);
    });

    it('should retrieve data from hook when set as boolean', async () => {
      const stateToSet = false;
      const newVal = true;

      const { result } = renderHook(() =>
        useQueryParamState<boolean>({ key: 'foo', defaultValue: stateToSet }),
      );

      const [state, setState] = result.current;

      expect(state).toEqual(stateToSet);

      await act(() => setState(newVal));

      await waitFor(() => assertSearchParams('foo', `${newVal}`));
      expect(result.current[0]).toEqual(newVal);
    });
  });

  describe('data types and parsers without default values', () => {
    it('should retrieve data from hook when set as string', async () => {
      const newVal = 'baz';

      const { result } = renderHook(() =>
        useQueryParamState<string>({ key: 'foo' }),
      );

      const [, setState] = result.current;

      await act(() => setState(newVal));

      await waitFor(() => assertSearchParams('foo', newVal));
      expect(result.current[0]).toEqual(newVal);
    });

    it('should retrieve data from hook when set as number', async () => {
      const newVal = 20;

      const { result } = renderHook(() =>
        useQueryParamState<number>({ key: 'foo' }),
      );

      const [, setState] = result.current;

      await act(() => setState(newVal));

      await waitFor(() => assertSearchParams('foo', newVal.toString()));
      expect(result.current[0]).toEqual(newVal);
    });

    it('should retrieve data from hook when set as float', async () => {
      const newVal = 10.101;

      const { result } = renderHook(() =>
        useQueryParamState<number>({ key: 'foo' }),
      );

      const [, setState] = result.current;

      await act(() => setState(newVal));

      await waitFor(() => assertSearchParams('foo', newVal.toString()));
      expect(result.current[0]).toEqual(newVal);
    });

    it('should retrieve data from hook when set as array', async () => {
      const newVal = ['three', 'five'];

      const { result } = renderHook(() =>
        useQueryParamState<string[]>({ key: 'foo' }),
      );

      const [, setState] = result.current;

      await act(() => setState(newVal));

      await waitFor(() => assertSearchParams('foo', newVal.join(',')));
      expect(result.current[0]).toEqual(newVal);
    });

    it('should retrieve data from hook when set as boolean', async () => {
      const newVal = true;

      const { result } = renderHook(() =>
        useQueryParamState<boolean>({ key: 'foo' }),
      );

      const [, setState] = result.current;

      await act(() => setState(newVal));

      await waitFor(() => assertSearchParams('foo', `${newVal}`));
      expect(result.current[0]).toEqual(newVal);
    });
  });

  describe('local storage persistence and restoration', () => {
    const key = 'foo';
    const key2 = 'bar';
    const numberKey = 'number';
    const localStorageKeyPrefix = 'employees-organizations.org-chart';
    const localStorageKey = `${localStorageKeyPrefix}.${key}`;
    const localStorageKey2 = `${localStorageKeyPrefix}.${key2}`;
    const localStorageNumberKey = `${localStorageKeyPrefix}.${numberKey}`;

    afterEach(() => {
      window.localStorage.clear();
    });

    it('should log a warning if not passed with default value', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {
        /* noop */
      });
      renderHook(() =>
        useQueryParamState<string>({
          key,
          localStorageKeyPrefix,
        }),
      );

      expect(console.warn).toHaveBeenCalledWith(
        LOCAL_STORAGE_DEFAULT_VALUE_WARNING_MSG,
      );
    });

    it('should save and restore from local storage', async () => {
      const { result } = renderHook(() =>
        useQueryParamState<string>({
          key,
          defaultValue: 'bar',
          localStorageKeyPrefix,
        }),
      );

      const [, setState] = result.current;

      assertLocalStorage(localStorageKey, null);

      await act(() => setState('baz'));

      await waitFor(() => assertLocalStorage(localStorageKey, 'baz'));

      const { result: render2 } = renderHook(() =>
        useQueryParamState<string>({
          key,
          defaultValue: 'bar',
          localStorageKeyPrefix,
        }),
      );

      assertSearchParams('foo', 'baz');
      await waitFor(() => expect(render2.current[0]).toBe('baz'));
    });

    it('should clear from local storage', async () => {
      const { result } = renderHook(() =>
        useQueryParamState<string>({
          key,
          defaultValue: '',
          localStorageKeyPrefix,
        }),
      );

      const [, setState] = result.current;

      await act(() => setState('baz'));

      await waitFor(() => assertLocalStorage(localStorageKey, 'baz'));

      await act(() => setState(''));

      await waitFor(() => assertLocalStorage(localStorageKey, null));
      expect(result.current[0]).toBeFalsy();
    });

    it('should save and restore from local with multiple keys', async () => {
      const { result } = renderHook(() =>
        useQueryParamState<string>({
          key,
          defaultValue: 'bar',
          localStorageKeyPrefix,
        }),
      );
      const { result: result2 } = renderHook(() =>
        useQueryParamState<string>({
          key: key2,
          defaultValue: 'bar',
          localStorageKeyPrefix,
        }),
      );

      const [, setState] = result.current;
      const [, setState2] = result2.current;

      await act(() => setState('baz'));
      await act(() => setState2('baz'));

      await waitFor(() => assertLocalStorage(localStorageKey, 'baz'));

      await waitFor(() => assertLocalStorage(localStorageKey2, 'baz'));

      const { result: resultRender2 } = renderHook(() =>
        useQueryParamState<string>({
          key,
          defaultValue: 'bar',
          localStorageKeyPrefix,
        }),
      );

      const { result: result2Render2 } = renderHook(() =>
        useQueryParamState<string>({
          key: key2,
          defaultValue: 'bar',
          localStorageKeyPrefix,
        }),
      );

      assertSearchParams('foo', 'baz');
      assertSearchParams('bar', 'baz');
      await waitFor(() => expect(resultRender2.current[0]).toBe('baz'));
      await waitFor(() => expect(result2Render2.current[0]).toBe('baz'));
    });

    it('should save and restore from local storage non-string data', async () => {
      const { result } = renderHook(() =>
        useQueryParamState<number>({
          key: numberKey,
          defaultValue: 100,
          localStorageKeyPrefix,
        }),
      );

      const [, setState] = result.current;

      assertLocalStorage(localStorageNumberKey, null);

      await act(() => setState(200));

      await waitFor(() => assertLocalStorage(localStorageNumberKey, '200'));

      const { result: render2 } = renderHook(() =>
        useQueryParamState<number>({
          key: numberKey,
          defaultValue: 100,
          localStorageKeyPrefix,
        }),
      );

      assertSearchParams(numberKey, '200');
      await waitFor(() => expect(render2.current[0]).toBe(200));
    });

    it('should not restore from local storage if the key is already in search params', async () => {
      window.localStorage.setItem(
        localStorageKey,
        compressToEncodedURIComponent('qux'),
      );
      mockRouter.push(`/?foo=${compressToEncodedURIComponent('baz')}`);

      const { result } = renderHook(() =>
        useQueryParamState<string>({
          key,
          defaultValue: 'bar',
          localStorageKeyPrefix,
        }),
      );

      const [state] = result.current;

      expect(state).toEqual('baz');
    });
  });

  describe('unparsed query parameters', () => {
    it('should not replace the query if not set to unparsed', async () => {
      mockRouter.setCurrentUrl('?foo=2232273');
      jest.spyOn(mockRouter, 'replace');

      const { result } = renderHook(() =>
        useQueryParamState<string>({ key: 'foo', hasRawValue: false }),
      );

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should parse & replace the parameter if its set to unparsed', async () => {
      mockRouter.setCurrentUrl('?foo=2232273');
      jest.spyOn(mockRouter, 'replace');

      const { result } = renderHook(() =>
        useQueryParamState<string>({ key: 'foo', hasRawValue: true }),
      );

      expect(mockRouter.replace).toHaveBeenCalledWith({
        query: { foo: 'EzDMIdlI' },
      });
    });
  });

  describe('when landing in a generated URL', () => {
    it('should parse all of the url parameters as expected', () => {
      const cardPreferencesInput = {
        cardClustering: false,
        personalInfo: true,
        avatars: true,
        openPositions: false,
      };
      const filtersInput: OrgChartFilter[] = [
        {
          id: PersonSystemAttribute.Department,
          value: {
            value: ['is-awesome'],
            condition: 'contains',
          },
        },
      ];
      const highlightedInput = PersonSystemAttribute.Department;
      const spotlightInput = 'my-employee';
      const attributesInput = ['my-attribute'];
      const route = generateOrgChartLink({
        attributes: attributesInput,
        cardCustomizationPreferences: cardPreferencesInput,
        filters: filtersInput,
        highlighted: highlightedInput,
        spotlight: spotlightInput,
      });

      mockRouter.push(route);

      render(<SampleQueryStateConsumer />);

      expect(screen.getByTestId('parsed-value-attributes').textContent).toEqual(
        attributesInput[0],
      );

      expect(
        screen.getByTestId(`parsed-value-cardCustomizationPreferences`)
          .textContent,
      ).toEqual(
        `Cluster Cards: ${cardPreferencesInput.cardClustering} / Personal Info: ${cardPreferencesInput.personalInfo} / Avatars: ${cardPreferencesInput.avatars}`,
      );

      expect(screen.getByTestId(`parsed-value-filters`).textContent).toEqual(
        filtersInput[0].id,
      );

      expect(
        screen.getByTestId(`parsed-value-highlighted`).textContent,
      ).toEqual(`Attribute: ${highlightedInput}`);

      expect(screen.getByTestId(`parsed-value-spotlight`).textContent).toEqual(
        `Spotlight: ${spotlightInput}`,
      );
    });
  });
});
