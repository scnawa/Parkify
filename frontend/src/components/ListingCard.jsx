import { Box, Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Background from '../assets/car.png'
const theme = createTheme({
    palette: {
        green: {
            main: '#00897B',
            light: '#E0F2F1',
            dark: '#004D40',
            contrastText: '#E0F2F1',
        },
    },
});

function ListingCard() {
    return(
        <ThemeProvider theme={theme}>
        <Card sx={{ minWidth: 325,maxWidth:375, border: 0, boxShadow:0 }}>
        <CardMedia
            sx={{ height: 280, borderRadius:3.5}}
            image={Background}
            address="green iguana"
        />
        <CardContent sx={{ border: 0, padding:1}}>
            <Box sx={{ display:'flex', justifyContent:"space-between"}}>
                <Box>
                    <Typography variant="h5" component="div">
                        address
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        price
                    </Typography>
                </Box>
                <Box sx={{ display:'flex', flexDirection:"column", justifyContent:"space-between", rowGap:0.4}}>
                    <Button size="small" color='green' variant="contained">status</Button>

                    <Box sx={{ display:'inline-flex', columnGap:0.3}}>
                        <Button size="small" color='green' variant="contained">Edit</Button>
                        <Button size="small" color='green' variant="contained">Delete</Button>
                    </Box>

                </Box>
            </Box>
        </CardContent>
        </Card>
        </ThemeProvider>
    )
}
export default ListingCard; 