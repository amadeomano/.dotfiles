import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import GrantAccess from '../GrantAccess';
import { OAuthWindowEvent } from '../types';
import { customRender } from '../../../../test-setup/utils';

jest.mock('next/router', () => require('next-router-mock'));

const waitUntilAuthTabIsOpened = () =>
  waitFor(() =>
    expect(window.open).toHaveBeenCalledWith('https://personio.de', '_blank'),
  );

const findAuthButton = () =>
  screen.findByRole('button', { name: 'Connect Xero' });

describe('<GrantAccess/>', () => {
  afterEach(() => jest.restoreAllMocks());

  it('should render the connect view', async () => {
    customRender(<GrantAccess />);

    const text = await screen.findByText(
      'You can connect Xero to this legal entity',
    );

    expect(text).toBeVisible();
  });

  it('should open the redirect url in a new tab', async () => {
    window.open = jest.fn();
    customRender(<GrantAccess />);

    const authButton = await findAuthButton();
    userEvent.click(authButton);

    await waitFor(() =>
      expect(window.open).toHaveBeenCalledWith('https://personio.de', '_blank'),
    );
  });

  it('should put the authorize button in a loading state while the redirect url is being fetched', async () => {
    window.open = jest.fn();
    customRender(<GrantAccess />);

    const authButton = await findAuthButton();
    userEvent.click(authButton);

    await waitFor(() => {
      expect(authButton).toBeDisabled();
    });
  });

  it('should disable the authorize button when the authorization is active', async () => {
    window.open = jest.fn();
    customRender(<GrantAccess />);

    const authButton = await findAuthButton();
    userEvent.click(authButton);

    await waitFor(() => {
      expect(authButton).toBeDisabled();
    });
  });

  it('should close the spawned tab once the completed event is captured', async () => {
    const newTabMock = {
      postMessage: jest.fn(),
      close: jest.fn(),
    };
    window.open = jest.fn().mockReturnValue(newTabMock);

    customRender(<GrantAccess />);

    const authButton = await findAuthButton();
    userEvent.click(authButton);

    await waitUntilAuthTabIsOpened();

    // Simulate the completed event from the new tab
    const eventData: OAuthWindowEvent['data'] = {
      type: 'intp.oauth.completed',
      authId: '1',
    };
    window.postMessage(eventData, '*');

    await waitFor(() => expect(newTabMock.close).toHaveBeenCalled());
  });

  it('should close the spawned tab once the failure event is captured', async () => {
    const newTabMock = {
      postMessage: jest.fn(),
      close: jest.fn(),
    };
    window.open = jest.fn().mockReturnValue(newTabMock);

    customRender(<GrantAccess />);

    const authButton = await findAuthButton();
    userEvent.click(authButton);

    await waitUntilAuthTabIsOpened();

    // Simulate the failure event from the new tab
    const eventData: OAuthWindowEvent['data'] = {
      type: 'intp.oauth.failed',
      authId: '1',
    };
    window.postMessage(eventData, '*');

    await waitFor(() => expect(newTabMock.close).toHaveBeenCalled());
  });

  it('should render the failure toast when the failure event is captured', async () => {
    console.error = jest.fn();
    window.open = jest.fn();
    customRender(<GrantAccess />);

    const authButton = await findAuthButton();
    userEvent.click(authButton);

    await waitUntilAuthTabIsOpened();

    // Simulate the failure event from the new tab
    const eventData: OAuthWindowEvent['data'] = {
      type: 'intp.oauth.failed',
      authId: '1',
    };
    window.postMessage(eventData, '*');

    await waitFor(() =>
      expect(
        screen.getByText(
          'Authorization could not be completed. Please try again.',
        ),
      ).toBeVisible(),
    );
  });
});
