import { Button } from "@mui/material";

function FileInputField({ multiple, setImage, content }) {
	return (
		<Button
			variant="contained"
			component="label"
			color="success"
			sx={{ mb: 3 }}
		>
			{content}
			<input
				type="file"
				accept="image/*"
				onChange={e => {
					const file = e.target.files;
					setImage(file);
				}
				}
				hidden multiple={multiple}
			/>
		</Button>
	)


}
export default FileInputField;