import { render, screen } from '@testing-library/react';
import type { TFunction } from 'i18next';
import { getPeopleData as getRawPeopleData } from '@personio-web/payroll-mocks-payroll-integration-hub';
import { TableCell } from 'designSystem/component/table';
import {
  getBlockersTooltip,
  getColumnsConfig,
  getPersonId,
} from './columnsConfig';
import { recursiveToCamelCase } from '@personio-web/payroll-util-common';
import { XeroPeopleData } from '@personio-web/payroll-data-payroll-integration-hub-types';
import { Inline } from 'designSystem/component/layout';
import { Tooltip } from 'designSystem/component/tooltip';
import { Icon, icons } from 'designSystem/component/icon';
import { ColumnIds } from '../../commons/columns';

const t = jest.fn((key) => key) as unknown as TFunction<'payroll-integrations'>;

const getPeopleData = (): { data: XeroPeopleData[] } =>
  recursiveToCamelCase(getRawPeopleData('xero'));

describe('tableConfig', () => {
  describe('getBlockersTooltip', () => {
    it('should return undefined no blockers are provided', () => {
      expect(getBlockersTooltip([], t)).toBeUndefined();
    });

    it('should render a list of blockers', () => {
      const TooltipData = getBlockersTooltip(
        [
          { attributeName: 'ABC', attributeValue: 'abc', message: 'msg' },
          { attributeName: 'DEF', attributeValue: 'def', message: 'gsm' },
        ],
        t,
      );
      render(TooltipData);

      expect(screen.getByText('xero.hub.people-table.msg')).toBeInTheDocument();
      expect(screen.getByText('xero.hub.people-table.gsm')).toBeInTheDocument();
    });
  });

  describe('getPersonId', () => {
    it('should and return extract the person ID from the object', () => {
      const { data } = getPeopleData();
      expect(getPersonId(data[0])).toBe('123');
    });
  });

  describe('columnConfig', () => {
    const { data } = getPeopleData();
    const [person, status, employeeNumber, salaryType, blockers, grossSalary] =
      getColumnsConfig(t);

    describe('omit columns', () => {
      const TOTAL_COLUMNS_AMOUNT = 6;

      it('should return the expected amount of columns', () => {
        const columns = getColumnsConfig(t);

        expect(columns).toHaveLength(TOTAL_COLUMNS_AMOUNT);
      });

      it('should not return the status column if its omitted', () => {
        const columns = getColumnsConfig(t, { [ColumnIds.STATUS]: true });

        const statusColumn = columns.find(
          (column) => column.id === ColumnIds.STATUS,
        );

        expect(statusColumn).toBeUndefined();
        expect(columns).toHaveLength(TOTAL_COLUMNS_AMOUNT - 1);
      });
    });

    describe('person column', () => {
      it('should format person to full name for the person column', () => {
        expect(person.accessor(data[0], 0)).toBe('abc cde');
      });

      it('should setup a Token TableCell to display the person name', () => {
        expect(
          getColumnsConfig(t)[0].cell({ row: data[0], value: 'person name' }),
        ).toEqual(
          <TableCell.Token
            value="person name"
            avatar={{
              name: 'person name',
            }}
            href={`/staff/details/${data[0].person.id}`}
          />,
        );
      });
    });

    describe('employment status column', () => {
      it('should render the column', () => {
        expect(status.accessor(data[0], 0)).toBe('active');
      });
    });

    describe('employee number column', () => {
      it('should extract and return the employee number from the data source', () => {
        expect(employeeNumber.accessor(data[0], 0)).toBe('123');
      });

      it('should setup a Number TableCell to display the employee number', () => {
        expect(employeeNumber.cell({ row: data[0], value: 123 })).toEqual(
          <TableCell.Number value={123} />,
        );
      });
    });

    describe('blockers column', () => {
      it('should extract and return the employee blockers', () => {
        expect(blockers.accessor(data[0], 0)).toBe(data[0].blockers);
      });

      it('should render the blockers using a Enum TableCell when any blocker exists', () => {
        const blockersList = [
          { attributeName: 'abc', attributeValue: 'bcd', message: 'cde' },
        ];
        const tooltip = getBlockersTooltip(blockersList, t);
        expect(
          blockers.cell({
            row: data[0],
            value: blockersList,
          }),
        ).toEqual(
          <TableCell.Enum
            color="red"
            icon={expect.anything()}
            tooltip={{
              content: tooltip,
            }}
            value={expect.anything()}
            onClick={expect.anything()}
          />,
        );
      });

      it('should render the blockers using an empty TextCell when no blocker exists', () => {
        expect(blockers.cell({ row: data[0], value: [] })).toEqual(
          <TableCell.Text value={expect.anything()} />,
        );
      });
    });

    describe('salary type column', () => {
      it('should extract and return the employee salaryType', () => {
        expect(salaryType.accessor(data[0], 0)).toBe(data[0].grossSalary.type);
      });

      it('should render the salaryType using a Text TableCell for fixed wages', () => {
        expect(salaryType.cell({ row: data[0], value: 'FIXED' })).toEqual(
          <TableCell.Text value={expect.anything()} />,
        );
      });

      // TODO: remove this check once synchronising hourly wages is supported
      it('should render the salaryType using a Text TableCell for hourly wages', () => {
        expect(salaryType.cell({ row: data[0], value: 'HOURLY' })).toEqual(
          <TableCell.Enum
            color={expect.anything()}
            value={expect.anything()}
            icon={expect.anything()}
            tooltip={expect.anything()}
          />,
        );
      });
    });

    describe('gross pay column', () => {
      it('should extract and return the employee salaryType', () => {
        expect(grossSalary.accessor(data[0], 0)).toBe(data[0].grossSalary);
      });

      it('should render the gross pay using a Currency TableCell', () => {
        expect(
          grossSalary.cell({
            row: data[0],
            value: { amount: 123, currency: 'GBP', type: 'FIXED' },
          }),
        ).toEqual(
          <TableCell.Currency
            currency={expect.anything()}
            locale={expect.anything()}
            value={expect.anything()}
          />,
        );
      });

      it('should render the empty cell if no salary is set', () => {
        expect(
          grossSalary.cell({
            row: data[0],
            value: { amount: null, currency: null, type: null },
          }),
        ).toEqual(
          <TableCell.Currency
            value={null}
            currency={expect.anything()}
            locale={expect.anything()}
          />,
        );
      });

      it('should render a info icon with tooltip with the salary is prorated', () => {
        expect(
          grossSalary.cell({
            row: data[0],
            value: {
              amount: 123,
              currency: 'GBP',
              type: 'FIXED',
              proratedExternally: true,
            },
          }),
        ).toEqual(
          <TableCell.Custom
            value={
              (
                <Inline alignVertical={'center'} space={'gap-xsmall'}>
                  <Tooltip
                    content={t(
                      'commons.hub.people-table.tooltips.prorated-salary',
                    )}
                  >
                    <Icon icon={icons.infoCircle} color={'tertiary'} />
                  </Tooltip>
                  <TableCell.Currency
                    currency={expect.anything()}
                    locale={expect.anything()}
                    value={expect.anything()}
                  />
                </Inline>
              ) as any
            }
          />,
        );
      });
    });
  });
});
