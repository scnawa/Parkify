import { InputLabel, MenuItem, Select } from '@mui/material';
import React from 'react';
// compoenet for input selection field
function SelectionInputField({ setSelection, selectionNames, label }) {
	const selectionChoices = selectionNames.map((x, index) => {
		return (
			<MenuItem key={index} value={x}>{x}</MenuItem>
		)
	})
	return (
		<>
			<InputLabel id={type}>{label}</InputLabel>
			<Select
				id={label}
				value={type}
				label={label}
				required
				sx={{ mb: 3 }}
				onChange={e => setSelection(e.target.value)}
			>
				{selectionChoices}
			</Select>
		</>
	)
}
export default SelectionInputField
