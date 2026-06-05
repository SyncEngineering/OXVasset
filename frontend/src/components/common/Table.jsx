import React from 'react';

/**
 * Common data table component with support for actions.
 */
const Table = ({ columns, data, actions, onRowClick }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} style={{ width: col.width }}>
              {col.label}
            </th>
          ))}
          {actions && <th style={{ width: '100px' }}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              className={onRowClick ? 'row-hover' : ''}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td>
                  <div className="action-links">
                    {actions.map((action, actionIndex) => (
                      <span
                        key={actionIndex}
                        className={`action-link ${action.className || ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(row);
                        }}
                      >
                        {action.label}
                      </span>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length + (actions ? 1 : 0)} style={{ textAlign: 'center', padding: '10px' }}>
              No records found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Table;
