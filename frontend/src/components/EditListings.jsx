import React from 'react';
import { Box, Button, Paper, ThemeProvider, Typography, createTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import TextInputField from './TextInputField';
import FileInputField from './FileInputField';
import Background from '../assets/car.png';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

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
    if (!file) {
        return Promise.resolve('');
    } else if (typeof file === 'string' || file instanceof String) {
        return Promise.resolve(file);
    } else {
        targetFile = file;
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
// The page to perform editing of a listing and removal of listing
function EditListings(props) {
    const { state } = useLocation();
    const [listing, setListing] = React.useState(state.listing);
    // ref is used to controll the state of a file input to perform preview image remove
    const thumbnailRef = React.useRef('');
    const imagesRef = React.useRef('');
    const [thumbnailFile, setThumbnailFile] = React.useState('');
    const [imagesFiles, setImagesFiles] = React.useState('');

    const navigate = useNavigate();
    React.useEffect(() => {
        if (!state.token) {
            navigate('/login');
        }
        // eslint-disable-next-line
    }, [state.token]);
    // handle remove of listing
    const handleRemove = (event) => {
        const fetchDelete = async () => {
            const data = {
                listings: {
                    "listingId": listing.listingId,
                    "listingNo": listing.listingNo
                }
            }
            try {
                const response = await fetch('http://localhost:8080/delete_listing', {
                    method: 'DELETE',
                    headers: {
                        'token': state.token,
                        'email': state.email,
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
        fetchDelete().then((res) => {
            if (props.isAdmin) {
                navigate('/adminViewListings', { state: { token: state.token, email: state.email } });
            } else {
                navigate('/myListing');
            }
        }).catch(alert);
    }

    const submitForm = (e) => {
        e.preventDefault();
        uploadFile(listing.imageUrl).then((url) => {
            const newListing = { ...listing };
            newListing["imageUrl"] = url;
            const data = {
                token: state.token,
                listings: {
                    ...newListing
                }
            }
            const fetchListings = async () => {
                try {
                    const response = await fetch('http://localhost:8080/update_listing', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'token': state.token,
                            'email': state.email,
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
                navigate('/adminViewListings', { state: { token: state.token, email: state.email } });
            } else {
                navigate('/myListing');
            }
        }).catch((err) => {
            alert(err);
        });
    }
    const handleChange = (field) => {
        return (value) => {
            const newListing = { ...listing };
            newListing[field] = value;
            setListing(newListing);
        }
    }
    const handleThubnailChange = (e) => {
        setThumbnailFile(e.target.value);
        uploadFile(e.target.files[0]).then((url) => { handleChange('imageUrl')(url); }).then(() => {
            thumbnailRef.current = "";
        }
        ).catch(alert);

    }
    const handleImagesChangle = (e) => {
        setImagesFiles(e.target.value);
        let imagePromises = Array.from(e.target.files).map((file) => uploadFile(file));
        // i handled the multiple images upload similarly in my comp6080 assignment 4
        // since this part of code is general and i don't know another way to do it
        Promise.allSettled(imagePromises).then((results) => {
            return results.filter((promise) => promise.status === "fulfilled").map((promise) => promise.value);
        }).then((newImages) => {
            handleChange('images')([...listing.images, ...newImages]);
            imagesRef.current = "";
        }).catch(alert);
    }

    const handleThumbnailDelete = () => {
        setThumbnailFile('');
        handleChange('imageUrl')('');
    }
    const handleImageDelete = (removeIndex) => {
        setImagesFiles('');
        handleChange('images')(listing.images.filter((_, index) => index !== removeIndex));
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
                        <FileInputField multiple={false} color="green" onChange={handleThubnailChange} inputRef={thumbnailRef} content="Upload Thumbnail" images={thumbnailFile} />
                        {listing.imageUrl ? (
                            <>
                                <ImageListItem>
                                    <img alt="thumbnail" src={listing.imageUrl} style={{ 'height': '200px', 'object-fit': 'cover' }} />

                                    <ImageListItemBar
                                        title="thumbnail"
                                        actionIcon={
                                            <IconButton
                                                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                                aria-label={'button to remove thumbnail'}
                                                onClick={handleThumbnailDelete}
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        }
                                    />

                                </ImageListItem>
                            </>
                        ) : null}
                        <FileInputField multiple={true} color="green" onChange={handleImagesChangle} inputRef={imagesRef} content="Upload Additional Images" images={imagesFiles} />
                        {listing.images && listing.images.length !== 0 ? (
                            <>
                                <ImageList sx={{ width: '100%', height: 250 }} cols={3} rowHeight={150}>

                                    {listing.images.map((image, index) => (
                                        <ImageListItem key={image}>
                                            <img alt="additional" src={image} style={{ 'height': '150px', 'object-fit': 'contain' }} />
                                            <ImageListItemBar
                                                title={"images" + index}
                                                actionIcon={
                                                    <IconButton
                                                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                                        aria-label={'button to remove image'}
                                                        onClick={() => { handleImageDelete(index); }}
                                                    >
                                                        <ClearIcon />
                                                    </IconButton>
                                                }
                                            />

                                        </ImageListItem>

                                    ))}
                                </ImageList>

                            </>

                        ) : null}
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
