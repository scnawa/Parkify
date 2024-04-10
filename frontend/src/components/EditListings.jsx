import React from 'react';
import { Box, Button, Paper, ThemeProvider, Typography, createTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import TextInputField from './TextInputField';
import FileInputField from './FileInputField';
import Background from '../assets/car.png'
const pageStyle = {
    backgroundImage: `url(${Background})`,
    "backgroundSize": "cover",
    height: "100%",

}
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

// the general purpose file image processing function is from comp6080 assignment 4
const uploadFile = (file) => {
    let targetFile;
    // https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript
    if (file.length === 0) {
        return Promise.resolve('');
    }
    else if (typeof file === 'string' || file instanceof String) {
        return Promise.resolve(file);
    } else {
        console.log("yes");
        targetFile = file[0];
    }
    const expectedType = ['image/jpeg', 'image/png', 'image/jpg']
    const valid = expectedType.find(type => type === targetFile.type);
    if (!valid) {
        return new Promise(resolve => resolve(targetFile));
    }
    const reader = new FileReader();
    const dataPromise = new Promise((resolve, reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(targetFile);
    return dataPromise;
}

function EditListings(props) {
    const { state } = useLocation();
    console.log("editListings " + state.token)
    const [listing, setListing] = React.useState(state.listing);

    const navigate = useNavigate();
    React.useEffect(() => {
        if (!state.token) {
            navigate('/login');
        }
        // eslint-disable-next-line
    }, [state.token]);
    const handleRemove = (event) => {
        const fetchDelete = async () => {
            const data = {
                listings: {
                    "listing_id": listing.listing_id,
                    "listing_no": listing.listing_no
                }
            }
            try {
                const response = await fetch('http://localhost:8080/delete_listing', {
                    method: 'DELETE',
                    headers: {
                        'email': state.token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const res = await response.json();
                if (res.error) {
                    return Promise.reject(res.error);
                } else {
                    return Promise.resolve(res);
                }
            } catch (error) {
                return Promise.reject(error);
            }
        };
        console.log(listing);
        fetchDelete().then((res) => {
            if (props.isAdmin) {
                navigate('/adminViewListings', { state: { token: state.token } });
            } else {
                navigate('/myListing');
            }
        }).catch(alert);
    }

    const submitForm = (e) => {
        e.preventDefault();
        uploadFile(listing.image_url).then((url) => {
            const new_listing = { ...listing };
            new_listing["image_url"] = url;
            const data = {
                email: state.token,
                listings: {
                    ...new_listing
                }
            }
            console.log(data);
            const fetchListings = async () => {
                try {
                    const response = await fetch('http://localhost:' + '8080/' + 'update_listing', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'email': state.token
                        },
                        body: JSON.stringify(data),
                    });

                    const res = await response.json();
                    if (res.error) {
                        return Promise.reject(res.error);
                    } else {
                        return Promise.resolve();
                    }
                } catch (error) {
                    return Promise.reject(error);
                }
            };
            return fetchListings();
        }).then(() => {
            if (props.isAdmin) {
                navigate('/adminViewListings', { state: { token: state.token } });
            } else {
                navigate('/myListing');
            }
        }).catch((err) => {
            alert(err);
        });
    }
    const handleChange = (field) => {
        return (value) => {
            const new_listing = { ...listing };
            new_listing[field] = value;
            setListing(new_listing);
        }
    }
    return (
        <ThemeProvider theme={theme} >

            <div style={pageStyle}>
                <Paper elevation={4}
                    sx={{
                        p: 2,
                        margin: 'auto',
                        maxWidth: "md",
                    }}
                >
                    <Typography>Edit Listings</Typography>

                    <Box component="form" sx={{
                        mt: 1, rowGap: "20px", display: 'flex', justifyContent: 'center',
                        alignItems: 'center', flexDirection: 'column', ml: '20px'
                    }} onSubmit={(e) => submitForm(e)}>
                        <TextInputField label="Address:" setFunction={handleChange("address")} value={listing.address} color="success" variant="filled" disabled />
                        <TextInputField label="Rate:" setFunction={handleChange("price")} value={listing.price} color="success" variant="outlined" type="number" required={true} />
                        <TextInputField label="Quantity:" setFunction={handleChange("quantity")} value={listing.quantity} color="success" variant="outlined" type="number" required={true} />

                        <TextInputField label="Details:" setFunction={handleChange("details")} value={listing.details} color="success" variant="outlined" multiline={true} />
                        <TextInputField label="Restrictions:" setFunction={handleChange("restrictions")} value={listing.restrictions} color="success" variant="outlined" multiline={true} />
                        {/* <CheckBoxInput setCheckBox={setAmenties} checkBox={amenties} description="" /> */}
                        <p></p>
                        <FileInputField color='green' variant="contained" multiple={false} setImage={handleChange("image_url")} content="Upload Thumbnail" required={false} />
                        {/* <FileInputField multiple={true} setImage={setImages} content="More Images" /> */}
                        <Box>
                            <Button color='success' variant="contained" type="submit">Edit</Button>
                            <Button color='success' variant="contained" onClick={handleRemove} sx={{ ml: '21px' }}>Remove</Button>
                        </Box>
                    </Box>
                </Paper>

            </div>
        </ThemeProvider>

    )
}
export default EditListings;
