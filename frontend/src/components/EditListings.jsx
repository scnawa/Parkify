import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
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
    const [listing, setListing] = React.useState(state.listing);

    const navigate = useNavigate();
    React.useEffect(() => {
        if (!state.token) {
            navigate('/login');
        }
        // eslint-disable-next-line
    }, [state.token]);

    const submitForm = (e) => {
        e.preventDefault();
        uploadFile(listing.image_url).then((url) => {
            const data = {
                email: state.token,
                listings: {
                    ...listing
                }
            }
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
            return new Promise(fetchListings);
        }).then(navigate('/myListing')).catch((err) => {
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
        <div style={pageStyle}>
            <Paper elevation={4}
                sx={{
                    p: 2,
                    margin: 'auto',
                    maxWidth: "md",
                }}
            >
				<Typography>Edit Listings</Typography>
				<Box component="form" sx={{ mt: 1}}>
                    <TextInputField label="Address:" setFunction={handleChange("address")} value={listing.address} color="success" variant="outlined" />
                    <TextInputField label="Price:" setFunction={handleChange("price")} value={listing.price} color="success" variant="outlined" type="number" />
                    <TextInputField label="Quantity:" setFunction={handleChange("quantity")} value={listing.quantity} color="success" variant="outlined" type="number" />

                    <TextInputField label="Details:" setFunction={handleChange("details")} value={listing.details} color="success" variant="outlined" multiline={true} />
                    <TextInputField label="Restrictions:" setFunction={handleChange("restrictions")} value={listing.restrictions} color="success" variant="outlined" multiline={true} />
                    {/* <CheckBoxInput setCheckBox={setAmenties} checkBox={amenties} description="" /> */}
                    <p></p>
                    <FileInputField multiple={false} setImage={handleChange("image_url")} content="Upload Thumbnail" />
                    {/* <FileInputField multiple={true} setImage={setImages} content="More Images" /> */}
                    <p></p>

                    <Button variant="outlined" color="secondary" type="submit">Edit</Button>
                </Box>
            </Paper>

        </div>
    )
}
export default EditListings;
