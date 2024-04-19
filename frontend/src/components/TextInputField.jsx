import { TextField } from "@mui/material";

function TextInputField({ label, setFunction, value, type, color, variant, multiline, disabled, required }) {
	let inputMin = {};
	if (type === "number") {
		inputMin = { inputProps: { min: 1, max: 10000 } }
	}
	return (
		<TextField
			onChange={e => setFunction(e.target.value)}
			required={required}
			color={color}
			type={type}
			InputProps={inputMin}
			name={label}
			label={label}
			fullWidth
			multiline={multiline}
			value={value}
			variant={variant}
			disabled={disabled}
		/>
	)
}
export default TextInputField;