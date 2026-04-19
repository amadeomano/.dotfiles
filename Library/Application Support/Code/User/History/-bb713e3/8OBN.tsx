import {
  type SubmitFilingData,
  useListFilings,
  usePollFiling,
  usePreviewFiling,
  useSubmitFiling,
} from '@personio-web/payroll-data-payroll-me';
import {
  listFilingsAPI,
  pollFilingAPI,
  previewFilingAPI,
  submitFilingAPI,
} from '@personio-web/payroll-data-payroll-me/src/common';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { Button } from 'designSystem/component/button';
import { Dialog } from 'designSystem/component/dialog';
import { Enum } from 'designSystem/component/enum';
import { FormField } from 'designSystem/component/form-field';
import { Inline, Stack } from 'designSystem/component/layout';
import {
  List,
  ListItem,
  ListItemAccessories,
  ListItemText,
} from 'designSystem/component/list';
import { toaster } from 'designSystem/component/toaster';
import { useEffect, useState } from 'react';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import {
  useGetDefaultHeaders,
  useWrapMutation,
  useWrapQuery,
} from '../../hooks/temporary/useWrapQuery';
import { XMLPrettyPreview, xmlExtractSingleValue } from '../../utils/xml';
import { downloadTextAsXMLFile } from '../../utils/fileDownload';

export const HmrcRtiFpsProcess = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [authenticatedAction, setAuthenticatedAction] = useState<
    undefined | ((username: string, password: string) => void)
  >();
  const [openPreview, setOpenPreview] = useState({ content: '', title: '' });

  const defaultHeaders = useGetDefaultHeaders();
  const { run } = useCurrentPayrollRun();
  const { data: filings, refetch: refetchFilings } = useWrapQuery(
    useListFilings,
    listFilingsAPI,
  )({
    requestHeaders: {
      'X-Company-Id': '123',
      'X-Legal-Entity-Id': '12',
      something: 'hi',
    },
  });

  const { mutateAsync: mutateGetPreview, isLoading: isPreviewLoading } =
    useWrapMutation(
      usePreviewFiling,
      previewFilingAPI,
      { responseType: 'text' }, // TODO: How to fix responseType inside request-sync's useRenderPayrollRunPayslip?
    );

  const { mutateAsync: mutateSubmitFiling, isLoading: isSubmitLoading } =
    useWrapMutation(useSubmitFiling, submitFilingAPI);

  const { mutateAsync: mutatePollFiling, isLoading: isPollLoading } =
    useWrapMutation(usePollFiling, pollFilingAPI);

  const runAuthenticatedAction = (
    callback: (username: string, password: string) => void,
  ) => {
    if (credentials.username && credentials.password) {
      callback(credentials.username, credentials.password);
      return;
    }

    setAuthenticatedAction(() => (username: string, password: string) => {
      setAuthenticatedAction(undefined);
      if (username && password) {
        setCredentials({ username, password });
        callback(username, password);
      }
    });
  };

  type Filing = SubmitFilingData;
  const [filing, setFiling] = useState<Filing | undefined>();
  useEffect(() => {
    setFiling(
      filings?.data
        ?.filter(
          (it: Filing) =>
            it.taxPeriod.number === run?.period &&
            it.taxPeriod.year === run?.taxYear,
        )
        ?.at(0),
    );
  }, [filings, run?.period]);

  const status =
    filing?.status ??
    (run?.status === 'APPROVED' ? 'Not started' : 'Approve payroll first');

  const latestSubmission = filing?.submissions?.at(-1);
  const statusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'positive';
      case 'REJECTED':
        return 'warning';
      case 'SUBMITTED':
        return 'accent';
      default:
        return 'gray';
    }
  };

  return (
    <>
      <Stack space="gap-default">
        <div />
        <Inline space="gap-default" alignVertical="center">
          <Stack space="gap-default">
            <p>
              Status: <Enum label={status} color={statusColor(status)} />
            </p>
          </Stack>

          <Button
            disabled={!['SUBMITTED'].includes(filing?.status ?? '')}
            loading={isPollLoading}
            onClick={() => {
              runAuthenticatedAction((username: string, password: string) => {
                mutatePollFiling({
                  requestPathParams: { id: filing?.id ?? '' },
                  requestHeaders: defaultHeaders,
                  requestBody: { username, password },
                }).then(
                  (response) => {
                    const data = response as unknown as Filing;
                    data && setFiling(data);

                    toaster.notify({
                      variant: 'success',
                      title: 'Heard back from HMRC: ' + data?.status,
                      showCloseButton: true,
                    });
                  },
                  (error: any) => {
                    toaster.notify({
                      variant: 'error',
                      title: 'Problem refreshing from HMRC',
                      description: error?.response?.data?.errors
                        ?.map((err: { title?: string }) => err.title)
                        ?.filter((v: any) => v)
                        .join('; '),
                      showCloseButton: true,
                    });
                  },
                );
              });
            }}
          >
            Refresh
          </Button>
          <Button
            variant="emphasisAccent"
            disabled={
              run?.status !== 'APPROVED' ||
              !['PENDING', 'REJECTED'].includes(filing?.status ?? 'PENDING')
            }
            loading={isSubmitLoading}
            onClick={() => {
              runAuthenticatedAction((username: string, password: string) => {
                mutateSubmitFiling({
                  requestPathParams: { id: filing?.id ?? '' },
                  requestHeaders: defaultHeaders,
                  requestBody: { username, password },
                }).then(
                  (response) => {
                    const data = response as unknown as Filing;
                    data && setFiling(data);
                    if (data?.status === 'REJECTED') {
                      // TODO: more accurate invalid credentials error from backend
                      toaster.notify({
                        variant: 'error',
                        title: 'Problem talking to HMRC',
                        description: 'Check your credentials',
                        showCloseButton: true,
                      });
                      setCredentials({ username: '', password: '' });
                    } else {
                      toaster.notify({
                        variant: 'success',
                        title: 'Submitted!',
                        description: 'FPS sent to HMRC',
                        showCloseButton: true,
                      });
                    }
                  },
                  (error: any) => {
                    toaster.notify({
                      variant: 'error',
                      title: 'Problem submitting to HMRC',
                      description: JSON.stringify(error),
                      showCloseButton: true,
                    });
                  },
                );
              });
            }}
          >
            Submit
          </Button>
        </Inline>
        <List>
          {filing?.id && (
            <ListItem
              onClick={() => {
                mutateGetPreview({
                  requestPathParams: { id: filing?.id ?? 0 },
                  requestHeaders: defaultHeaders,
                  requestBody: {
                    username: 'placeholder',
                    password: 'placeholdr',
                  },
                }).then(
                  (response) => {
                    setOpenPreview({
                      content: (response as unknown as { data: string }).data,
                      title: 'FPS',
                    });
                  },
                  (error: any) => {
                    toaster.notify({
                      variant: 'error',
                      title: JSON.stringify(error),
                      showCloseButton: true,
                    });
                  },
                );
              }}
            >
              <ListItemText
                meta={
                  ['PENDING', 'REJECTED'].includes(filing.status)
                    ? 'Preview FPS to be sent to HMRC'
                    : `View FPS sent to HMRC`
                }
              >
                Submission
              </ListItemText>
              {!['PENDING', 'REJECTED'].includes(filing.status) && (
                <ListItemAccessories>
                  <small>
                    {new Date(
                      filing.submissions?.at(-1)?.submissionTime ?? 0,
                    ).toLocaleString()}
                  </small>
                </ListItemAccessories>
              )}
            </ListItem>
          )}
          {filing?.submissions?.length && (
            <ListItem
              onClick={() => {
                setOpenPreview({
                  content: filing?.submissions?.at(-1)?.statusDetail ?? '',
                  title: 'HMRC response',
                });
              }}
            >
              <ListItemText
                // GovTalkMessage CorrelationID from https://assets.publishing.service.gov.uk/media/5b90f59de5274a0bd7d11954/Transaction.pdf
                // is a reference payroll managers need to refer to for any queries to HMRC
                meta={`HMRC cid: ${xmlExtractSingleValue(
                  filing.submissions?.at(-1)?.statusDetail,
                  '//govtalk:CorrelationID',
                )}`}
              >
                Response
              </ListItemText>
              <ListItemAccessories>
                <small>
                  {new Date(
                    // GovTalkMessage GatewayTimestamp from https://assets.publishing.service.gov.uk/media/5b90f59de5274a0bd7d11954/Transaction.pdf
                    // displayed here to be accurate from HMRC perspective for cross-referencing
                    xmlExtractSingleValue(
                      filing.submissions?.at(-1)?.statusDetail,
                      '//govtalk:GatewayTimestamp',
                    ) ?? new Date(),
                  ).toLocaleString()}
                </small>
              </ListItemAccessories>
            </ListItem>
          )}
        </List>
      </Stack>
      <AuthenticatedSubmission actionCallback={authenticatedAction} />
      {openPreview.content && (
        <Dialog.Promo
          open
          onOpenChange={() => setOpenPreview({ content: '', title: '' })}
        >
          <Dialog.NavigationBar
            title={openPreview.title}
          ></Dialog.NavigationBar>
          <Dialog.Content>
            <XMLPrettyPreview xml={maskFPSPassword(openPreview.content)} />
          </Dialog.Content>
          <Dialog.Footer>
            <ActionBar>
              <Actions.Secondary
                variant="ghost"
                onClick={() =>
                  downloadTextAsXMLFile(
                    openPreview.content,
                    openPreview.title.replace(/[ ]/g, '_') + '.xml',
                  )
                }
              >
                Download XML
              </Actions.Secondary>
              <Actions.Primary
                onClick={() => setOpenPreview({ content: '', title: '' })}
              >
                Close
              </Actions.Primary>
            </ActionBar>
          </Dialog.Footer>
        </Dialog.Promo>
      )}
    </>
  );
};

const AuthenticatedSubmission = ({
  actionCallback,
}: {
  actionCallback?: (username: string, password: string) => void;
}) => {
  const [state, setState] = useState({
    touched: false,
    username: '',
    password: '',
    open: !!actionCallback,
  });
  useEffect(
    () => setState({ ...state, open: !!actionCallback }),
    [actionCallback],
  );

  return (
    <Dialog.Util
      open={state.open}
      title="HMRC / Government Gateway account"
      onOpenChange={() => {
        setState({ ...state, open: false, touched: false });
      }}
    >
      <Dialog.Content>
        <p>
          To communicate with HMRC RTI, please login with the Government Gateway
          account you normally use.
        </p>
        <br />
        <form>
          <FormField.Input
            title="Username"
            subTitle="Your HMRC / gov.uk username"
            required={true}
            onChange={(ev) => setState({ ...state, username: ev.target.value })}
            data-1p-ignore
            data-lpignore
            errorText={
              state.touched && !state.username
                ? 'Username is mandatory'
                : undefined
            }
          />
          <br />
          <FormField.Input
            title="Password"
            subTitle="Your HMRC / gov.uk password"
            type="password"
            required={true}
            onChange={(ev) => setState({ ...state, password: ev.target.value })}
            data-1p-ignore
            data-lpignore
            errorText={
              state.touched && !state.password
                ? 'Password is mandatory'
                : undefined
            }
          />
        </form>
      </Dialog.Content>
      <Dialog.Footer>
        <ActionBar>
          <Actions.Secondary
            variant="ghost"
            onClick={() => setState({ ...state, open: false, touched: false })}
          >
            Cancel
          </Actions.Secondary>
          <Actions.Primary
            onClick={() => {
              if (state.username && state.password) {
                actionCallback &&
                  actionCallback(state.username, state.password);
                setState({ ...state, open: false, touched: false });
              } else {
                setState({ ...state, touched: true });
              }
            }}
          >
            Authenticate
          </Actions.Primary>
        </ActionBar>
      </Dialog.Footer>
    </Dialog.Util>
  );
};

const maskFPSPassword = (xml: string) =>
  xml.replace(/<Value>.*?<\/Value>/gi, '<Value>***password***</Value>');
