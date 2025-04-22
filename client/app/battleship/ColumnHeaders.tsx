"use client"
import React, { useMemo } from 'react';

const ColumnHeaders: React.FC = () => {
  const renderColumnHeaders = useMemo(
    () => (
      <div className="grid grid-cols-11">
        <div></div> {/* Empty top-left corner */}
        {Array.from({ length: 10 }, (_, index) => (
          <div key={`col-${index}`} className="flex justify-center items-center w-10 h-10">
            {index + 1}
          </div>
        ))}
      </div>
    ),
    []
  );

  return <>{renderColumnHeaders}</>;
};

export default ColumnHeaders;
