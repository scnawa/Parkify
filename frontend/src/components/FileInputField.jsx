import { Button } from "@mui/material";
// The input field for file input wrapped the mui component
function FileInputField({ multiple, setImage, content, required, color, onChange, inputRef, images }) {
	let handleChange = () => {
		setImage(images);
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
				value={images}
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