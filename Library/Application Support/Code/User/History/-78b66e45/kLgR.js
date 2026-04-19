const IS_DEV = process.env.NODE_ENV === 'development';

const trustedDefaultDomains = `
  https://*.personio.de
  https://*.personio-internal.de
  http://*.dev.personio.de
  ${
    IS_DEV
      ? `https://fonts.gstatic.com https://pro.fontawesome.com http://localhost.localstack.cloud:* http://localhost:* ws://localhost:*`
      : ''
  }
  https://api.eu.amplitude.com
  https://*.eu.amplitude.com
  https://*.eppo.cloud
  https://featuregates.org
  https://events.statsigapi.net
  https://api.statsig.com
  https://statsigapi.net
  https://api.statsigcdn.com
  https://featureassets.org
  https://assetsconfigcdn.org
  https://prodregistryv2.org
  https://*.qualtrics.com
  https://surveys.personio.com
  https://*.googleapis.com
  https://*.userlane.com
  https://*.ingest.sentry.io
  https://*.ingest.us.sentry.io
  https://player.vimeo.com
  https://*.stripe.com
  https://api.gohiring.com
  https://tracking.gohiring.com
  https://stackpath.bootstrapcdn.com
  https://*.zendesk.com
  https://www.youtube.com
  https://embedded.tray.io
  https://*.datadoghq.eu/
  https://*.split.io/
  https://calendly.com
  https://assets.calendly.com
  https://*.cronofy.com
  https://stonly.com/
  https://*.stonly.com/
  https://personio-stage-payroll-import-svc-ytd.s3.eu-central-1.amazonaws.com
  https://personio-dev-payroll-import-svc-ytd.s3.eu-central-1.amazonaws.com
  https://personio-prod-payroll-import-svc-ytd.s3.eu-central-1.amazonaws.com
  https://*.fullview.io
  https://static.zdassets.com
  https://ekr.zdassets.com
  https://ekr.zendesk.com
  https://*.zendesk.com
  https://*.zopim.com
  https://zendesk-eu.my.sentry.io
  wss://*.zendesk.com
  https://s3.eu-central-1.amazonaws.com/dev-whistleblowing-service/
  https://s3.eu-central-1.amazonaws.com/stage-whistleblowing-service/
  https://s3.eu-central-1.amazonaws.com/prod-whistleblowing-service/
  https://embed.eu.oneschema.co
  https://api.hsforms.com
  wss://*.zopim.com
  https://*.hereapi.com
  https://*.here.com`;

const trustedConnectDomains = `
  https://qa-dm-employee-documents-service-raw-upload-bucket.s3.amazonaws.com
  https://dev-employee-documents-service-raw-upload-bucket.s3.amazonaws.com
  https://stage-employee-documents-service-raw-upload-bucket.s3.amazonaws.com
  https://prod-employee-documents-service-raw-upload-bucket.s3.amazonaws.com
  https://qa-dm-employee-documents-service-raw-upload-bucket.s3.eu-central-1.amazonaws.com
  https://dev-employee-documents-service-raw-upload-bucket.s3.eu-central-1.amazonaws.com
  https://stage-employee-documents-service-raw-upload-bucket.s3.eu-central-1.amazonaws.com
  https://prod-employee-documents-service-raw-upload-bucket.s3.eu-central-1.amazonaws.com
  wss://*.fullview.io
  https://*.fullview.services
  wss://*.fullview.services
  https://*.liveblocks.io
  wss://*.liveblocks.io
  https://*.daily.co
  wss://*.daily.co
  https://cdn.contentful.com
`;

const contentSecurityPolicy = `
  frame-ancestors 'none';
  report-uri /csp-reports;
  report-to csp-endpoint;
  default-src
  'self'
  'unsafe-inline'
  'unsafe-eval'
  data:
  ${trustedDefaultDomains};
  frame-src 'self' blob: ${trustedDefaultDomains};
  img-src * data:;
  connect-src
  'self'
  ${trustedDefaultDomains}
  ${trustedConnectDomains};
  worker-src
  'self'
  blob:
  data:
  ${IS_DEV ? `http://localhost:*` : ''};
`;

const cspHeader = {
  key: 'Content-Security-Policy',
  value: contentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
};
const cspHeaderSelf = {
  ...cspHeader,
  value: cspHeader.value.replace(
    "frame-ancestors 'none';",
    "frame-ancestors 'self';",
  ),
};
const cspHeaderAuth0 = {
  ...cspHeader,
  value: cspHeader.value.replace(
    "frame-ancestors 'none';",
    'frame-ancestors https://login.personio.de https://login.personio-internal.de;',
  ),
};

const strictTransportSecurityHeader = {
  key: 'Strict-Transport-Security',
  value: 'max-age=31540000; includeSubDomains; preload',
};

const xssProtectionSecurityHeader = {
  key: 'X-XSS-Protection',
  value: '1; mode=block',
};

const xFrameSecurityHeader = {
  key: 'X-Frame-Options',
  value: 'DENY',
};
const xFrameSecurityHeaderSelf = {
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN',
};
const xFrameSecurityHeaderAuth0 = {
  key: 'X-Frame-Options',
  value: 'ALLOW-FROM https://login.personio.de',
};

const xContentTypeOptionsHeader = {
  key: 'X-Content-Type-Options',
  value: 'nosniff',
};

const securityHeaders = [
  cspHeader,
  strictTransportSecurityHeader,
  xssProtectionSecurityHeader,
  xFrameSecurityHeader,
  xContentTypeOptionsHeader,
];
const securityHeadersWithSelfFraming = [
  cspHeaderSelf,
  strictTransportSecurityHeader,
  xssProtectionSecurityHeader,
  xFrameSecurityHeaderSelf,
  xContentTypeOptionsHeader,
];
const securityHeadersWithAuth0Framing = [
  cspHeaderAuth0,
  strictTransportSecurityHeader,
  xssProtectionSecurityHeader,
  xFrameSecurityHeaderAuth0,
  xContentTypeOptionsHeader,
];

module.exports = {
  securityHeaders,
  securityHeadersWithSelfFraming,
  securityHeadersWithAuth0Framing,
};
