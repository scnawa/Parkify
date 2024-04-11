import { Button } from "@mui/material";
function FileInputField({ multiple, setImage, content, required, color, onChange, inputRef }) {
	let handleChange = (e) => {
		const file = e.target.files;
		setImage(file);
	};
	if (onChange) {
		handleChange = onChange;
	}
	return (
		<Button
			variant="contained"
			component="label"
			color={color}
			sx={{ mb: 3 }}
		>
			{content}
			<input
				type="file"
				accept="image/*"
				onChange={handleChange}
				// following css is provided by https://mui.com/material-ui/react-button/

				style={{
					clip: 'rect(0 0 0 0)',
					clipPath: 'inset(50%)',
					height: 1,
					overflow: 'hidden',
					position: 'absolute',
					bottom: 0,
					left: 0,
					whiteSpace: 'nowrap',
					width: 1,
				}}
				multiple={multiple}
				required={required}
				ref={inputRef}
			/>
		</Button>
	)


}
export default FileInputField;