import { screen } from '@testing-library/react';
import React, { ComponentProps } from 'react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import mockRouter from 'next-router-mock';
import { customRender } from '../../test-setup/testUtils';
import PayrollIntegrationSettings from './PayrollIntegrationSettings';
import { PayrollIntegration } from '../../shared/types/PayrollIntegration';
import * as useIntegrationSettings from '../../shared/hooks/useIntegrationSettings';
import { getParams } from '../../shared/utils/navigationParams';

jest.mock('next/router', () => require('next-router-mock'));

expect.extend({
  toBeCalledWithUrl(received, expected) {
    const pass = received.mock.calls.some((call: URL) =>
      this.equals(decodeURIComponent(call.toString()), expected),
    );
    return {
      pass,
      actual: received,
      message: () => `
        Expected: ${this.utils.printExpected(expected)}
        Received: ${this.utils.printReceived(received.mock.calls)}`,
    };
  },
});

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
  integration: PayrollIntegration.Xero,
};

const switchLegalEntity = (
  legalEntitySelect: HTMLElement,
  targetLegalEntityName: string,
) => {
  userEvent.type(legalEntitySelect, '{arrowdown}');

  userEvent.click(
    screen.getByRole('menuitem', {
      name: targetLegalEntityName,
    }),
  );
};

const IntegrationMock = React.memo(() => {
  const router = useRouter();
  const { legalEntityId } = getParams(router.query);
  return <div>{legalEntityId}</div>;
});

describe('<PayrollIntegrationSettings/>', () => {
  beforeEach(() => {
    window.IntersectionObserver = interactionObserverMock as any;
  });

  describe('<PageContent/>', () => {
    it('should render the corresponding settings after switching legal entities', async () => {
      jest
        .spyOn(useIntegrationSettings, 'default')
        .mockReturnValue({ Component: IntegrationMock });

      const [initialLegalEntity, targetLegalEntity] = legalEntitiesMock;
      mockRouter.replace('?legalEntityId=1');
      customRender(<PayrollIntegrationSettings {...props} />);

      const legalEntitySelect = await screen.findByRole('button', {
        name: initialLegalEntity.name,
      });
      expect(screen.queryByText(targetLegalEntity.id)).not.toBeInTheDocument();

      switchLegalEntity(legalEntitySelect, targetLegalEntity.name);

      screen.debug();
      // expect(screen.queryByText(initialLegalEntity.id)).not.toBeInTheDocument();
      // expect(screen.getByText(targetLegalEntity.id)).toBeVisible();
    });

    it('should render correct settings based on search params', async () => {
      jest
        .spyOn(useIntegrationSettings, 'default')
        .mockReturnValue({ Component: IntegrationMock });
      const [initialLegalEntity, targetLegalEntity] = legalEntitiesMock;

      mockRouter.replace(`?legalEntityId=${initialLegalEntity.id}`);
      customRender(<PayrollIntegrationSettings {...props} />);

      expect(screen.getByText(initialLegalEntity.id)).toBeVisible();

      const legalEntitySelect = await screen.findByRole('button', {
        name: initialLegalEntity.name,
      });
      expect(screen.queryByText(targetLegalEntity.id)).not.toBeInTheDocument();
      screen.debug();
      switchLegalEntity(legalEntitySelect, targetLegalEntity.name);
      screen.debug();
    });

    describe('Based on search params', () => {
      it('should render correct settings based on search params', async () => {
        jest
          .spyOn(useIntegrationSettings, 'default')
          .mockReturnValue({ Component: IntegrationMock });
        const [_, targetLegalEntity] = legalEntitiesMock;

        mockRouter.replace(`?legalEntityId=${targetLegalEntity.id}`);
        customRender(<PayrollIntegrationSettings {...props} />);

        expect(screen.getByText(targetLegalEntity.id)).toBeVisible();
      });

      it('should reflect switching legal entities in the search', async () => {
        const [initialLegalEntity, targetLegalEntity] = legalEntitiesMock;
        mockRouter.asPath = '';
        const replaceSpy = jest.spyOn(mockRouter, 'replace');
        customRender(<PayrollIntegrationSettings {...props} />);

        expect(mockRouter.asPath).toBe('');

        const legalEntitySelect = await screen.findByRole('button', {
          name: initialLegalEntity.name,
        });
        switchLegalEntity(legalEntitySelect, targetLegalEntity.name);

        expect(replaceSpy).toBeCalledWithUrl(
          expect.stringContaining(`?legalEntityId=${targetLegalEntity.id}`),
        );
      });
    });
  });
});
