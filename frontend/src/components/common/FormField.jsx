import React from 'react';

/**
 * Common form field component supporting various input types.
 */
const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  options = [],
  disabled = false,
  error = ''
}) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>
        {label}
        {required && <span className="required-star">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          <option value="">-- Select --</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          rows="3"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      )}
      
      {error && <span className="error-text">{error}</span>}
    </div>
  );
};

export default FormField;
