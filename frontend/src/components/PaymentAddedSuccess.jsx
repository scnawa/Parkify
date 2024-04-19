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
// The return page after a payment method is added
function PaymentAddedSuccess() {
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
                        You payment method is successfully added
                    </Typography>

                </Paper>
            </div>

        </ThemeProvider>

    )
}
export default PaymentAddedSuccess;