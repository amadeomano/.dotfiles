import { Translate } from '@personio-web/translate-component';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Requests } from '../../api';
import { MICRO_FRONTEND_TRANSLATION_NAMESPACE } from '../../application/config/constants';
import { CarouselV2 } from '../../components/Carousel/CarouselV2';
import { Alert, TokenisedTypography } from '../../components/ds';
import { INTEGRATION_IDS } from '../../shared';
import styles from './Tabs.module.scss';

type Props = {
  tabContent: {
    media?: Requests['IntegrationContent']['media'];
    transferOfData: Requests['IntegrationContent']['transferOfData'];
  };
  selectedIntegration:
    | Requests['Integration']
    | Requests['RecruitingIntegration'];
};

export const TabOverviewV2 = ({ tabContent, selectedIntegration }: Props) => {
  const { t } = useTranslation(MICRO_FRONTEND_TRANSLATION_NAMESPACE);

  const isGoogleMeetIntegration =
    selectedIntegration.id === INTEGRATION_IDS.google_meet;

  const isMsTeamsInterviewsIntegration =
    selectedIntegration.id ===
    INTEGRATION_IDS.video_conferencing_microsoft_teams;

  const sections = {
    carousel: tabContent?.media,
    transferOfData: tabContent?.transferOfData,
  };

  const getVideoIntegrationBanner = (
    translationKey: ParseKeys<'integrations'>,
    values?: {} | undefined,
  ) => (
    <div className={styles.videoIntegrationBanner}>
      <Alert fullWidth status="highlight">
        <TokenisedTypography
          token="body-base"
          className="no-margin"
          component="span"
        >
          <Translate
            namespace={MICRO_FRONTEND_TRANSLATION_NAMESPACE}
            i18nKey={translationKey}
            components={{ b: <b /> }}
          />
        </TokenisedTypography>
      </Alert>
    </div>
  );

  return (
    <>
      {isGoogleMeetIntegration &&
        getVideoIntegrationBanner('details.google-meet-banner')}
      {isMsTeamsInterviewsIntegration &&
        getVideoIntegrationBanner('details.ms-teams-interviews-banner')}
      {!!sections.carousel?.length && (
        <CarouselV2
          slides={sections.carousel}
          selectedIntegration={selectedIntegration}
        />
      )}
      <TokenisedTypography
        token="heading-medium"
        dangerouslySetInnerHTML={{
          __html: t('details.tabs-content.overview.how-it-works'),
        }}
      />
      {!!sections.transferOfData && (
        <TokenisedTypography
          token="body-base"
          dangerouslySetInnerHTML={{
            __html: sections.transferOfData,
          }}
        />
      )}
    </>
  );
};
