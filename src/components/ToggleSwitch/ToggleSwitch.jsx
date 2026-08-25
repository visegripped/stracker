/**
 * Simple accessible toggle — replaces @nextui-org/switch (unused in app routes).
 */
const ToggleSwitch = ({ label, id, checked, onChange }) => {
  const inputId = id || `toggle-${label}`;
  return (
    <label htmlFor={inputId} className="toggle-switch">
      <input
        id={inputId}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  );
};

export default ToggleSwitch;
