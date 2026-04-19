import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  getTranslation,
  renderWithWrapper,
} from '../../../../../test-setup/testHelpers';
import { MockOrgChartPreferencesContext } from '../../../../../test-setup/mocks/MockOrgChartPreferencesContext';
import { toTranslate } from '../../../../../src/toTranslate';
import { TestIds } from '../../../../../src/utils/test-ids';
import { FeatureFlags } from '../../../../../src/constants/featureFlags';
import { OrgUnitCustomize } from './Customize';

describe('OrgUnitCustomize', () => {
  const { t } = getTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar.cards.customize-cards',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const TRIGGER_TEST_ID = TestIds.ControlBarCards + `-popover-trigger`;

  describe('CustomizeMenu component', () => {
    it('renders all customisation options except disabled ones', async () => {
      renderWithWrapper(
        <MockOrgChartPreferencesContext>
          <OrgUnitCustomize />
        </MockOrgChartPreferencesContext>,
      );

      const toggle = screen.getByTestId(TRIGGER_TEST_ID);
      userEvent.click(toggle);
      await expect(
        screen.findByText(t('nodes.title')),
      ).resolves.toBeInTheDocument();

      expect(
        screen.getByText(toTranslate.orgUnitCard.customisation.description),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(toTranslate.orgUnitCard.customisation.layer),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(toTranslate.orgUnitCard.customisation.abbreviation),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(toTranslate.orgUnitCard.customisation.leads),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(toTranslate.orgUnitCard.customisation.totalMembers),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(toTranslate.orgUnitCard.customisation.openPositions),
      ).not.toBeInTheDocument();
    });

    it('renders switches with correct checked state', async () => {
      const mockCardCustomisations = {
        entries: [],
        get: jest.fn().mockImplementation((id: string) => ({
          id,
          isActive: id === 'description' || id === 'abbreviation',
        })),
        set: jest.fn(),
      };

      renderWithWrapper(
        <MockOrgChartPreferencesContext
          cardCustomisations={mockCardCustomisations}
        >
          <OrgUnitCustomize />
        </MockOrgChartPreferencesContext>,
      );

      const toggle = screen.getByTestId(TRIGGER_TEST_ID);
      userEvent.click(toggle);
      await expect(
        screen.findByText(t('nodes.title')),
      ).resolves.toBeInTheDocument();

      const switches = screen.getAllByRole('switch');
      expect(switches).toHaveLength(3);

      // Check that switches reflect the correct state
      expect(switches[0]).toBeChecked(); // description
      expect(switches[1]).toBeChecked(); // abbreviation
      expect(switches[2]).not.toBeChecked(); // totalMembers
      // The following are hidden and should not be rendered for the MVP release
      // expect(switches[1]).not.toBeChecked(); // layer
      // expect(switches[3]).not.toBeChecked(); // leads
      // expect(switches[5]).not.toBeChecked(); // openPositions
    });

    it('renders leads customisation when feature flag is enabled', async () => {
      renderWithWrapper(
        <MockOrgChartPreferencesContext>
          <OrgUnitCustomize />
        </MockOrgChartPreferencesContext>,
        {
          features: { [FeatureFlags.ENABLE_ORG_UNIT_LEADS]: 'on' },
        },
      );

      const toggle = screen.getByTestId(TRIGGER_TEST_ID);
      userEvent.click(toggle);
      await expect(
        screen.findByText(t('nodes.title')),
      ).resolves.toBeInTheDocument();

      // Leads should now be visible
      expect(
        screen.getByText(toTranslate.orgUnitCard.customisation.leads),
      ).toBeInTheDocument();

      // description, abbreviation, leads, totalMembers
      const switches = screen.getAllByRole('switch');
      expect(switches).toHaveLength(4);
    });

    it('does not render leads customisation when feature flag is disabled', async () => {
      renderWithWrapper(
        <MockOrgChartPreferencesContext>
          <OrgUnitCustomize />
        </MockOrgChartPreferencesContext>,
        {
          features: { [FeatureFlags.ENABLE_ORG_UNIT_LEADS]: 'off' },
        },
      );

      const toggle = screen.getByTestId(TRIGGER_TEST_ID);
      userEvent.click(toggle);
      await expect(
        screen.findByText(t('nodes.title')),
      ).resolves.toBeInTheDocument();

      // Leads should not be visible
      expect(
        screen.queryByText(toTranslate.orgUnitCard.customisation.leads),
      ).not.toBeInTheDocument();

      // description, abbreviation, totalMembers
      const switches = screen.getAllByRole('switch');
      expect(switches).toHaveLength(3);
    });

    // Skip reason: the MVP release does not have disabled customisations
    it.skip('renders disabled switches for disabled customisations', async () => {
      renderWithWrapper(
        <MockOrgChartPreferencesContext>
          <OrgUnitCustomize />
        </MockOrgChartPreferencesContext>,
      );

      const toggle = screen.getByTestId(TRIGGER_TEST_ID);
      userEvent.click(toggle);
      await expect(
        screen.findByText(t('nodes.title')),
      ).resolves.toBeInTheDocument();

      const switches = screen.getAllByRole('switch');

      // Layer and openPositions should be disabled
      expect(switches[1]).toBeDisabled(); // layer
      expect(switches[3]).toBeDisabled(); // leads
      expect(switches[5]).toBeDisabled(); // openPositions

      // Other switches should be enabled
      expect(switches[0]).toBeEnabled(); // description
      expect(switches[2]).toBeEnabled(); // abbreviation
      expect(switches[4]).toBeEnabled(); // totalMembers
    });

    it('calls set function when clicking on enabled customisation', async () => {
      const mockCardCustomisations = {
        entries: [],
        get: jest.fn(),
        set: jest.fn(),
      };

      renderWithWrapper(
        <MockOrgChartPreferencesContext
          cardCustomisations={mockCardCustomisations}
        >
          <OrgUnitCustomize />
        </MockOrgChartPreferencesContext>,
      );

      const toggle = screen.getByTestId(TRIGGER_TEST_ID);
      userEvent.click(toggle);
      await expect(
        screen.findByText(t('nodes.title')),
      ).resolves.toBeInTheDocument();

      const switches = screen.getAllByRole('switch');

      // Click on description customisation (enabled)
      userEvent.click(switches[0]);

      expect(mockCardCustomisations.set).toHaveBeenCalledWith(
        'description',
        true,
      );
    });

    it('toggles active state when clicking on customisation', async () => {
      const mockCardCustomisations = {
        entries: [],
        get: jest.fn().mockImplementation((id) => ({
          id,
          isActive: id === 'description',
        })),
        set: jest.fn(),
      };

      renderWithWrapper(
        <MockOrgChartPreferencesContext
          cardCustomisations={mockCardCustomisations}
        >
          <OrgUnitCustomize />
        </MockOrgChartPreferencesContext>,
      );

      const toggle = screen.getByTestId(TRIGGER_TEST_ID);
      userEvent.click(toggle);
      await expect(
        screen.findByText(t('nodes.title')),
      ).resolves.toBeInTheDocument();

      const switches = screen.getAllByRole('switch');

      // Click on description customisation (currently active)
      userEvent.click(switches[0]);

      expect(mockCardCustomisations.set).toHaveBeenCalledWith(
        'description',
        false,
      );
    });

    it('handles undefined customisation state gracefully', async () => {
      const mockCardCustomisations = {
        entries: [],
        get: jest.fn().mockImplementation(() => undefined),
        set: jest.fn(),
      };

      renderWithWrapper(
        <MockOrgChartPreferencesContext
          cardCustomisations={mockCardCustomisations}
        >
          <OrgUnitCustomize />
        </MockOrgChartPreferencesContext>,
      );

      const toggle = screen.getByTestId(TRIGGER_TEST_ID);
      userEvent.click(toggle);
      await expect(
        screen.findByText(t('nodes.title')),
      ).resolves.toBeInTheDocument();

      const switches = screen.getAllByRole('switch');

      // All switches should be unchecked when state is undefined
      switches.forEach((switchElement) => {
        expect(switchElement).not.toBeChecked();
      });
    });
  });

  describe('Component display name', () => {
    it('has correct display name', () => {
      expect(OrgUnitCustomize.displayName).toBe('Controls.Custom');
    });
  });
});
