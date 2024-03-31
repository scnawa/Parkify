import {  TextField } from "@mui/material";

function TextInputField({ label, setFunction, value, type, color, variant, multiline }) {
	return (
			<TextField
				onChange={e => setFunction(e.target.value)}
				required
				color={color}
				type={type}
				name={label}
				label={label}

				fullWidth
				multiline={multiline}
				value={value}
				variant={variant}

				InputProps={{ inputProps: { min: 0 } }}

			/>
	)
}
export default TextInputField;