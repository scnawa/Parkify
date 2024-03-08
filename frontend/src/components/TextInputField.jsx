import { TextField } from "@mui/material";

function TextInputField({ label, setFunction, value, type, color, variant, multiline }) {
	return (
		<TextField
			name={label}
			label={label}
			onChange={e => setFunction(e.target.value)}
			required
			variant={variant}
			color={color}
			type={type}
			sx={{ mb: 3 }}
			fullWidth
			multiline={multiline}
			value={value}
			InputProps={{ inputProps: { min: 0 } }}

		/>
	)
}
export default TextInputField;