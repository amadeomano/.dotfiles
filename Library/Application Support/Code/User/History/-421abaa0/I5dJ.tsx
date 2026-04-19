import { useRouter } from 'next/router';
import { z } from 'zod';
import { FederatedLoader } from '@personio-web/federated-module';
import type {
  DocumentManagement_View_DocumentEditor_FedProps,
  DocumentEditorViewProps,
} from '@personio-web/document-management-view-document-editor-types';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';

import Error404Page from '../../../../404.page';
import type { PersonioPage } from '../../../../../@types/page';

const importFn = () => import('documentManagement/view/document-editor');

const routeParamsSchema = z.object({
  employeeId: z.string(),
  documentId: z.string(),
});

const DocumentPage: PersonioPage = () => {
  const { isOn, isReady } = useFeatureFlag('DM-3506-preview-overhaul');
  const router = useRouter();

  const result = routeParamsSchema.safeParse(router.query);

  if (!isReady) return null;
  if (!result.success || !isOn) return <Error404Page />;

  const { employeeId, documentId } = result.data;

  return (
    <FederatedLoader<
      DocumentManagement_View_DocumentEditor_FedProps,
      DocumentEditorViewProps
    >
      _importFn={importFn}
      _remote="documentManagement"
      _module="./view/document-editor"
      _namedExport="DocumentEditor"
      employeeId={employeeId}
      documentId={documentId}
    />
  );
};

export default DocumentPage;
DocumentPage.pageTitleKey = 'employee-document-editor';
