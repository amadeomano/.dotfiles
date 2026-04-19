import React from 'react';
import { screen } from '@testing-library/react';

import AppLayout from './AppLayout';
import PageHeader from './PageHeader';
import { customRender } from '../../test-utils/test-utils';

jest.mock('next/router', () => require('next-router-mock'));

const interactionObserverMock = function () {
  return {
    observe: jest.fn(),
    disconnect: jest.fn(),
  };
};

const stickyHeaderObserverMock = {
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
};

describe('PageHeader', () => {
  beforeEach(() => {
    window.IntersectionObserver = interactionObserverMock as any;
  });

  it('should render the correct title', () => {
    customRender(<AppLayout />);

    const title = screen.getByRole('heading', {
      name: 'Payroll (a3innuva)',
    });
    expect(title).toBeVisible();
  });

  it('should render the children', async () => {
    customRender(
      <PageHeader
        setStickyHeaderVariant={jest.fn()}
        stickyHeaderObserver={stickyHeaderObserverMock}
      >
        <section>This is an exemplary alert</section>
      </PageHeader>,
    );

    const child = screen.getByText('This is an exemplary alert');
    expect(child).toBeVisible();
  });
});
