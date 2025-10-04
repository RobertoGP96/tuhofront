import { FieldContainer } from "../../styles/styles";

function Field({label, value, readOnly, type = "text", onChange}: { label: string, value: string, readOnly: boolean, type?: string, onChange: () => void }) {
  return (
    <FieldContainer>
      <label>{label}</label>
      {type === "textarea" ? (
        <textarea value={value} readOnly={readOnly} onChange={onChange} />
      ) : (
        <input type={type} value={value} readOnly={readOnly} onChange={onChange} />
      )}
    </FieldContainer>
  );
}

export default Field;