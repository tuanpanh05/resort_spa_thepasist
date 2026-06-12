import React from "react";

export function Table({ headers = [], children, className = "" }) {
  return (
    <div
      className={`bg-white border border-primary-100 shadow-sm overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          {headers && headers.length > 0 && (
            <thead>
              <tr className="bg-primary-50/50 text-sage-600 font-bold border-b border-primary-100">
                {headers.map((h, idx) => (
                  <th key={idx} className="p-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-primary-50/50">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
