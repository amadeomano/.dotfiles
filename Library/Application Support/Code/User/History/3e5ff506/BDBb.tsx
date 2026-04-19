import { logRoles } from '@testing-library/dom';
import { screen } from '@testing-library/react';
import React, { ComponentProps } from 'react';
import { customRender } from '../../test-setup/testUtils';
import PayrollIntegrationSettings from './PayrollIntegrationSettings';
import * as useIntegrationSettings from '../../shared/hooks/useIntegrationSettings';
import userEvent from '@testing-library/user-event';
import { usePayrollIntegrationSettingsNavigator } from 'payroll/hook/use-payroll-integration-navigator';

const interactionObserverMock = function () {
  return {
    observe: jest.fn(),
    disconnect: jest.fn(),
  };
};

const legalEntitiesMock = [
  {
    id: '1',
    name: 'Legal Entity A',
  },
  {
    id: '2',
    name: 'Legal Entity B',
  },
];

const props: ComponentProps<typeof PayrollIntegrationSettings> = {
  integration: 'xero',
};

const switchLegalEntity = (
  legalEntitySelect: HTMLElement,
  targetLegalEntityName: string,
) => {
  userEvent.click(legalEntitySelect);
  screen.debug();

  userEvent.click(
    screen.getByRole('option', {
      name: targetLegalEntityName,
    }),
  );
};

const IntegrationMock = React.memo(() => {
  const {
    params: { legalEntityId },
  } = usePayrollIntegrationSettingsNavigator('xero');

  return <div>{legalEntityId}</div>;
});

describe('<PayrollIntegrationSettings/>', () => {
  beforeEach(() => {
    window.IntersectionObserver = interactionObserverMock as any;
  });

  describe('<PageContent/>', () => {
    it('should render the corresponding settings after switching legal entities', async () => {
      window.HTMLElement.prototype.hasPointerCapture = jest.fn();
      window.HTMLElement.prototype.scrollIntoView = jest.fn();

      jest
        .spyOn(useIntegrationSettings, 'default')
        .mockReturnValue({ Component: IntegrationMock });

      const [initialLegalEntity, targetLegalEntity] = legalEntitiesMock;
      customRender(<PayrollIntegrationSettings {...props} />);

      // const legalEntitySelect = await screen.findByRole('combobox', {
      //   name: initialLegalEntity.name,
      // });
      // console.log(legalEntitySelect);
      logRoles(document.body);
      expect(screen.queryByText(targetLegalEntity.id)).not.toBeInTheDocument();

      // switchLegalEntity(legalEntitySelect, targetLegalEntity.name);

      // expect(screen.queryByText(initialLegalEntity.id)).not.toBeInTheDocument();
      // expect(screen.getByText(targetLegalEntity.id)).toBeVisible();
    });

    describe('Based on search params', () => {
      it('should render correct settings based on search params', async () => {
        jest
          .spyOn(useIntegrationSettings, 'default')
          .mockReturnValue({ Component: IntegrationMock });
        const [, targetLegalEntity] = legalEntitiesMock;

        customRender(<PayrollIntegrationSettings {...props} />, {
          initialEntries: [`?legalEntityId=${targetLegalEntity.id}`],
        });

        expect(screen.getByText(targetLegalEntity.id)).toBeVisible();
      });

      it('should reflect switching legal entities in the search', async () => {
        window.HTMLElement.prototype.hasPointerCapture = jest.fn();
        window.HTMLElement.prototype.scrollIntoView = jest.fn();

        const [, targetLegalEntity] = legalEntitiesMock;
        const { history } = customRender(
          <PayrollIntegrationSettings {...props} />,
        );

        expect(history.location.search).toBe('');

        const legalEntitySelect = await screen.findByRole('combobox');
        switchLegalEntity(legalEntitySelect, targetLegalEntity.name);

        expect(history.location.search).toBe(
          `?legalEntityId=${targetLegalEntity.id}`,
        );
      });
    });
  });
});
