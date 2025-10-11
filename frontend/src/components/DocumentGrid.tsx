import React from 'react';
import DocumentCard from './DocumentCard';
import { DocumentMetrics } from '../api';

interface DocumentGridProps {
  documents: DocumentMetrics[];
  onViewDetails: (docName: string) => void;
  onViewDocument: (docName: string) => void;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  onViewDetails,
  onViewDocument,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.doc}
          doc={doc}
          onViewDetails={onViewDetails}
          onViewDocument={onViewDocument}
        />
      ))}
    </div>
  );
};

export default DocumentGrid;

