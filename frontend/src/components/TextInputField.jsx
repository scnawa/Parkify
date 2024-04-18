import { TextField } from "@mui/material";

function TextInputField({ label, setFunction, value, type, color, variant, multiline, disabled, required }) {
	return (
		<TextField
			onChange={e => setFunction(e.target.value)}
			required={required}
			color={color}
			type={type}
			name={label}
			label={label}
			fullWidth
			multiline={multiline}
			value={value}
			variant={variant}
			disabled={disabled}
			InputProps={{ inputProps: { min: 0 } }}

		/>
	)
}
export default TextInputField;