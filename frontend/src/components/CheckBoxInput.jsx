import { Checkbox, InputLabel } from "@mui/material";

// from https://stackoverflow.com/questions/73107755/checkboxes-with-react-and-mui
// The component is a wrapper of mui checkbox for checkbox input
function CheckBoxInput({ setCheckBox, checkBox, description }) {
	const choices = Object.entries(checkBox).map(([key, value]) => {
		return (
			<>
				<InputLabel id={key}>{key} {description}</InputLabel>

				<Checkbox
					labelId={key}
					sx={{ mb: 3 }}

					checked={checkBox[value]}
					onChange={event => {
						const newData = { ...checkBox };
						newData[key] = event.target.checked;
						setCheckBox(newData);
					}}
					color="primary"
					label={`${key} is avabilible`}

				/>
			</>)
	});
	return (
		<>
			{choices}
		</>

	)
}
export default CheckBoxInput;