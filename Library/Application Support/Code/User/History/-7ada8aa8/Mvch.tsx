import { getPersonioTranslation } from '@personio-web/config-jest/src/helpers';
import { listOrgUnitsDataHandler } from '@personio-web/employees-organizations-data-org-units/mocking';
import * as requests from '@personio-web/employees-organizations-data-org-units/src/requests';
import { server } from '@personio-web/mocks/server';
import { renderWithWrapper } from '@personio-web/orchestrator-common/test-utils';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelect } from 'designSystem/component/multi-select';

import { OrgUnitsSelect } from '../OrgUnitsSelect';

const selectPlaceHolder = 'Select parent';

const multiSelectRender = jest.spyOn(MultiSelect, 'render' as never);
// const multiSelectRender = jest.fn();
// jest.mock('designSystem/component/multi-select', () => {
//   // const originalModule = jest.requireActual(
//   //   'designSystem/component/multi-select',
//   // );
//   return {
//     // ...originalModule,
//     MultiSelect: jest.fn(),
//   };
// });

describe('OrgUnitsSelect', () => {
  const { t } = getPersonioTranslation('org-units');
  describe('onSuccess', () => {
    beforeEach(() => {
      server.use(listOrgUnitsDataHandler.defaultHandler);
    });

    it('should render successfully once the select is clicked', async () => {
      const onChangeMock = jest.fn();
      const listOrgUnitsSpy = jest.spyOn(requests, 'listOrgUnits');
      renderWithWrapper(
        <OrgUnitsSelect
          selectedOptionIds={[]}
          type="department"
          onChange={onChangeMock}
          placeholder={selectPlaceHolder}
        />,
      );

      await waitFor(() => {
        expect(listOrgUnitsSpy).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: selectPlaceHolder }),
        ).toBeEnabled();
      });

      userEvent.click(
        screen.getByRole('combobox', {
          name: selectPlaceHolder,
        }),
      );

      expect(
        within(screen.getByRole('dialog')).getByRole('listbox'),
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(
          within(screen.getByRole('dialog')).getAllByRole('option'),
        ).toHaveLength(50);
      });

      // // select an available option
      userEvent.click(
        screen.getByRole('option', {
          name: 'Customer Service Department',
        }),
      );

      await waitFor(() => {
        expect(onChangeMock).toHaveBeenCalledWith(
          ['11', '248', '159'],
          [
            {
              abbreviation: 'CUS',
              company_id: 'ABC123',
              create_time: '2023-11-27T11:55:12Z',
              direct_descendants_count: 2,
              id: 11,
              name: 'Customer Service Department',
              resource_uri: 'https://example.com/resource/11',
              type: 'department',
            },
            {
              abbreviation: 'SAL',
              company_id: 'ABC123',
              create_time: '2023-06-30T11:55:12Z',
              direct_descendants_count: 0,
              id: 248,
              name: 'Sales Department 18',
              parent_id: 11,
              type: 'department',
            },
            {
              abbreviation: 'TRA',
              company_id: 'ABC123',
              create_time: '2023-12-10T11:55:12Z',
              direct_descendants_count: 0,
              id: 159,
              name: 'Training and Development Department 10',
              parent_id: 11,
              type: 'department',
            },
          ],
        );
      });
    });

    it('should render with empty option once the select is clicked', async () => {
      const onChangeMock = jest.fn();
      const listOrgUnitsSpy = jest.spyOn(requests, 'listOrgUnits');
      renderWithWrapper(
        <OrgUnitsSelect
          selectedOptionIds={[]}
          type="department"
          onChange={onChangeMock}
          placeholder={selectPlaceHolder}
          addEmptyOption
        />,
      );

      await waitFor(() => {
        expect(listOrgUnitsSpy).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: selectPlaceHolder }),
        ).toBeEnabled();
      });

      userEvent.click(
        screen.getByRole('combobox', {
          name: selectPlaceHolder,
        }),
      );

      expect(
        within(screen.getByRole('dialog')).getByRole('listbox'),
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(
          within(screen.getByRole('dialog')).getAllByRole('option'),
        ).toHaveLength(51);
      });

      expect(screen.getByText(t('select.empty'))).toBeInTheDocument();
    });

    it('should render successfully preselect an org unit', async () => {
      renderWithWrapper(
        <OrgUnitsSelect
          type="department"
          onChange={jest.fn()}
          selectedOptionIds={['1']}
          placeholder={selectPlaceHolder}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: selectPlaceHolder }),
        ).toBeEnabled();
      });

      await expect(
        screen.findByDisplayValue('Marketing Department'),
      ).resolves.toBeInTheDocument();
    });

    it('should not render a list if there is no org units available', async () => {
      server.use(listOrgUnitsDataHandler.emptyHandler);
      renderWithWrapper(
        <OrgUnitsSelect
          type="department"
          onChange={jest.fn()}
          placeholder={selectPlaceHolder}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: selectPlaceHolder }),
        ).toBeEnabled();
      });

      userEvent.click(
        screen.getByRole('combobox', {
          name: selectPlaceHolder,
        }),
      );

      // assert listbox is visible based on previous click
      expect(
        screen.queryByText(t('select.loading-error')),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(listOrgUnitsDataHandler.errorHandler);

      renderWithWrapper(
        <OrgUnitsSelect
          type="department"
          onChange={jest.fn()}
          placeholder={selectPlaceHolder}
        />,
      );
    });

    it('should show an error when there is no items available', async () => {
      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: selectPlaceHolder }),
        ).toBeEnabled();
      });

      userEvent.click(
        screen.getByRole('combobox', {
          name: selectPlaceHolder,
        }),
      );

      // assert error while loading items
      expect(screen.getByText(t('select.loading-error'))).toBeInTheDocument();
    });
  });

  describe('browser specific', () => {
    beforeEach(() => {
      server.use(listOrgUnitsDataHandler.defaultHandler);
    });

    it.each([
      ['default', undefined, 'Chrome/135.0.0.0 Safari/537.36'],
      ['Safari', false, 'Safari/537.36'],
      ['Firefox', false, 'Firefox/137.0'],
    ])('%s should set autoFocus to %2', async (_, __, autoFocus) => {
      renderWithWrapper(
        <OrgUnitsSelect
          selectedOptionIds={[]}
          type="department"
          onChange={jest.fn()}
          placeholder={selectPlaceHolder}
        />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: selectPlaceHolder }),
        ).toBeEnabled();
      });

      userEvent.click(
        screen.getByRole('combobox', {
          name: selectPlaceHolder,
        }),
      );

      expect(multiSelectRender).toHaveBeenCalledWith(
        expect.objectContaining({ autoFocus }),
        null,
      );
    });

    // it('should avoid multiselect from auto focus on Safari', async () => {
    //   Object.defineProperty(navigator, 'userAgent', {
    //     value:
    //       'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15',
    //     writable: true,
    //   });

    //   renderWithWrapper(
    //     <OrgUnitsSelect
    //       selectedOptionIds={[]}
    //       type="department"
    //       onChange={jest.fn()}
    //       placeholder={selectPlaceHolder}
    //     />,
    //   );

    //   await waitFor(() => {
    //     expect(
    //       screen.getByRole('combobox', { name: selectPlaceHolder }),
    //     ).toBeEnabled();
    //   });

    //   userEvent.click(
    //     screen.getByRole('combobox', {
    //       name: selectPlaceHolder,
    //     }),
    //   );

    //   expect(multiSelectRender).toHaveBeenCalledWith(
    //     expect.objectContaining({
    //       autoFocus: false,
    //     }),
    //     null,
    //   );
    // });
  });
});
