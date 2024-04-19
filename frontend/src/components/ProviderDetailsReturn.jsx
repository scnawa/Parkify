import { Paper, Typography, createTheme } from "@mui/material";
import { ThemeProvider } from '@emotion/react';

const theme = createTheme({
	palette: {
		green: {
			main: '#4caf50',
			light: '#E0F2F1',
			dark: '#004D40',
			contrastText: '#E0F2F1',
		},
	},
});
// the return page after user entered the provider details
function ProviderDetailsReturn() {
	return (
		<ThemeProvider theme={theme}>
			<div style={{
				backgroundSize: "cover",
				height: "80vh",
				marginTop: '10px'
			}}>

				<Paper elevation={4}
					sx={{
						p: 2,
						margin: 'auto',
						maxWidth: "md",
						height: '100%',
					}}
				>
					<Typography variant="h4" display="block" gutterBottom color="green.dark">
						Your information is submitted.
					</Typography>
					<Typography variant="h4" display="block" gutterBottom color="green.dark">
						It may take a few minutes to activate your account
					</Typography>


				</Paper>
			</div>

		</ThemeProvider>

	)
}
export default ProviderDetailsReturn;