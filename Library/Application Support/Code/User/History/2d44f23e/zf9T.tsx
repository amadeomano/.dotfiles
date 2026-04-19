import { Table, useTable } from 'designSystem/component/table';
import { useCurrentPayrollRun } from '../data/useCurrentPayrollRun';
import { useDocumentTableRow as useBACSRow } from '../features/reports/BacsDocument';
import { useDocumentTableRow as useFPSRow } from '../features/reports/FPSReport';
import { useDocumentTableRow as useGrossToNetRow } from '../features/reports/GrossToNetReport';
import { useDocumentTableRow as useCompByEERow } from '../features/reports/CompByEEReport';
import { useDocumentTableRow as useDiffRecRow } from '../features/reports/DifferencesRecReport';
import { useDocumentTableRow as useEEByCompRow } from '../features/reports/EEByCompReport';
import { useDocumentTableRow as useYTDRow } from '../features/reports/YTDReport';
import { useDocumentTableRow as useHMRCP32Row } from '../features/reports/HMRCP32';
import { nameColumn, typeColum, downloadColumn } from './DocumentsTab/columns';
import type { DocumentRow } from './DocumentsTab/columns';

export const DocumentsTab = () => {
  const { isFetching: isLoading } = useCurrentPayrollRun();
  const table = useTable();

  // Document row hooks return undefined or false if document not available for current run
  const allDocuments: Array<DocumentRow> = [
    useBACSRow(),
    useFPSRow(),
    useGrossToNetRow(),
    useCompByEERow(),
    useDiffRecRow(),
    useEEByCompRow(),
    useYTDRow(),
    useHMRCP32Row(),
  ];

  const validDocuments = allDocuments.filter((v) => v.enabled ?? true);

  return (
    <Table
      isLoading={isLoading}
      table={table}
      columnConfig={[nameColumn, typeColum, downloadColumn]}
      getRowId={(row) => row.name}
      data={validDocuments}
    />
  );
};
