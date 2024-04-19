import React from 'react';
import { Box, Button, Paper, Typography, createTheme, ThemeProvider, Autocomplete, TextField } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import TextInputField from './TextInputField';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import FileInputField from './FileInputField';
import Background from '../assets/car.png';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import location from '../assets/location.png';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';

const placeholder = L.icon({
	iconUrl: location,
	iconSize: [30, 30]
});
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
/* the below code of map is from https://www.youtube.com/watch?v=rmIhGPy8rSY */
export function MapChild(props) {
	const map = useMap();
	if (props.addressGeo) {
		if (props.addressGeo.lat && props.addressGeo.lon) {
			map.setView(
				L.latLng(props.addressGeo.lat, props.addressGeo.lon),
				map.getZoom(12)

			);

		}
	}
	return null;
}
// the general purpose file image processing function is from comp6080 assignment 4
export const uploadFile = (file) => {
	let targetFile;
	if (!file) {
		return Promise.resolve('');
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
const mapApi = 'https://nominatim.openstreetmap.org/search?'
// The page to let user create the listing
function CreateListings(props) {
	const [detail, setDetail] = React.useState('');

	const [rate, setRate] = React.useState(0);
	const [address, setAddress] = React.useState('');
	const [addressGeo, setGeo] = React.useState(null);

	const [addressOptions, setOptions] = React.useState([]);

	const [quantity, setQuantity] = React.useState(0);

	const [restriction, setRestriction] = React.useState('');
	const [thumbnail, setThumbnail] = React.useState('');
	const [thumbnailFile, setThumbnailFile] = React.useState('');

	const [images, setImages] = React.useState([]);
	const [imagesFiles, setImagesFiles] = React.useState('');
	// ref is used to controll and reset the file input field
	// so that we can perform delete on preview image and perform re-upload
	const thumbnailRef = React.useRef('');
	const imagesRef = React.useRef('');


	const loaded = React.useRef(false);
	const location = useLocation();
	const state = location.state || {};
	const navigate = useNavigate();

	React.useEffect(() => {
		if (!props.token) {
			navigate('/login');
		}
		// eslint-disable-next-line
	}, [props.token]);
	// https://stackoverflow.com/questions/42217121/how-to-start-search-only-when-user-stops-typing
	// delay the search to prevent user typing to fast and annoy the api server
	React.useEffect(() => {
		setOptions([]);
		const delaySearch = setTimeout(() => {
			const mapParameter = {
				q: address,
				format: 'json',
				limit: 5,
				addressdetails: 1,
				"polygon_geojson": 1,
				countrycodes: ["AU"],
			}
			const mapQuery = new URLSearchParams(mapParameter).toString();
			fetch(`${mapApi}${mapQuery}`, { method: "GET", redirect: "follow" }).then((respond) => {
				return respond.json();
			}).then((data) => {
				loaded.current = true;
				setOptions(data);
			}).catch(alert);

			return;
		}, 380);
		return () => clearTimeout(delaySearch);
	}, [address]);
	// The submission of listing form
	const submitForm = (e) => {
		e.preventDefault();
		// convert the file first
		uploadFile(thumbnail).then((url) => {
			const data = {
				token: state.token,
				email: state.email,
				listings: {
					"address": addressGeo['display_name'],
					"lat": addressGeo.lat,
					"lon": addressGeo.lon,
					"price": rate,
					"quantity": quantity,
					"details": detail,
					"restrictions": restriction,
					"imageUrl": url,
					"images": images,
				}
			}

			const fetchCreateListing = async () => {
				try {
					const response = await fetch('http://localhost:8080/create_listing', {
						method: 'PUT',
						headers: {
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
			return fetchCreateListing();
		}).then(() => alert("created listing")).then(() => {
			if (props.isAdmin) {
				navigate('/adminViewListings', { state: { token: state.token } });
			} else {
				navigate('/myListing');
			}
		})
			.catch((err) => {
				alert(err);
				console.error(err);
			});
	}
	let locations = [-33.9062434, 151.23465683738365];
	// set the random default location to user input if provided
	if (addressGeo && addressGeo.lat && addressGeo.lon) {
		locations = [addressGeo.lat, addressGeo.lon];

	}
	const handleThubnailChange = (e) => {
		setThumbnailFile(e.target.value);
		uploadFile(e.target.files[0]).then((url) => { setThumbnail(url); }).then(() => {
			thumbnailRef.current = "";
			setThumbnailFile('');
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

			setImages([...images, ...newImages]);
			imagesRef.current = "";
		}).catch(alert);
	}

	const handleThumbnailDelete = () => {
		setThumbnailFile('');
		setThumbnail('');
	}
	const handleImageDelete = (removeIndex) => {
		setImagesFiles('');
		setImages(images.filter((_, index) => index !== removeIndex));
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
					<Typography>Create Listings</Typography>
					<Box component="form" sx={{
						mt: 1, rowGap: "20px", display: 'flex', justifyContent: 'center',
						alignItems: 'center', flexDirection: 'column', ml: '20px'
					}} onSubmit={(e) => submitForm(e)}>
						{/* the below Autocomplete code is from https://mui.com/material-ui/react-autocomplete/#free-solo */}
						<Autocomplete
							sx={{ width: '100%' }}
							value={addressGeo}
							onChange={(_, newGeo) => {
								setGeo(newGeo);
							}}
							includeInputInList
							filterOptions={(x) => x}
							inputValue={address}
							noOptionsText="No location"
							onInputChange={(event, newAddress) => {
								setAddress(newAddress);
							}}
							options={addressOptions.map((item => { return { ...item }; }))
							}
							isOptionEqualToValue={(option, value) => (option['display_name'] === value['display_name'])}
							getOptionLabel={(option) => {
								return `${option['display_name']}`;
							}
							}
							renderInput={(params) => (
								<TextField {...params} label="Address" color="success" fullWidth required />
							)}
							required

						/>
						{/* the below code of map is from https://www.youtube.com/watch?v=rmIhGPy8rSY and
						https://react-leaflet.js.org/docs/example-popup-marker/*/}
						<div style={{ width: "100%", height: "50vh", maxHeight: "600px" }}>
							<MapContainer center={locations} zoom={10} style={{ width: '100%', height: '100%' }}>
								<TileLayer
									attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
									style={{ width: '100%', height: '100%' }}
								/>
								{addressGeo &&
									<div>
										<Marker icon={placeholder} position={locations}>
											<Popup></Popup>
										</Marker>
									</div>
								}
								<MapChild addressGeo={addressGeo} />
							</MapContainer>
						</div>

						<TextInputField label="Quantity:" setFunction={setQuantity} value={quantity} color="success" variant="outlined" type="number" required={true} />
						<TextInputField label="Rate:" setFunction={setRate} value={rate} color="success" variant="outlined" type="number" required={true} />
						<TextInputField label="Details:" setFunction={setDetail} value={detail} color="success" variant="outlined" multiline={true} required={true} />
						<TextInputField label="Restrictions:" setFunction={setRestriction} value={restriction} color="success" variant="outlined" multiline={true} required={true} />
						{/* <CheckBoxInput setCheckBox={setAmenties} checkBox={amenties} description="" /> */}
						<FileInputField multiple={false} color="green" setImage={setThumbnail} onChange={handleThubnailChange} inputRef={thumbnailRef} content="Upload Thumbnail" images={thumbnailFile} />
						{thumbnail ? (
							<>
								<ImageListItem>
									<img alt="uploaded thumbnail" src={thumbnail} style={{ 'height': '200px', 'object-fit': 'cover' }} />

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
						<FileInputField multiple={true} color="green" setImage={setImages} onChange={handleImagesChangle} inputRef={imagesRef} content="Upload Additional Images" images={imagesFiles} />
						{images.length !== 0 ? (
							<>
								<ImageList sx={{ width: '100%', height: 250 }} cols={3} rowHeight={150}>

									{images.map((image, index) => (
										<ImageListItem key={image}>
											<img alt="additional images" src={image} style={{ 'height': '150px', 'object-fit': 'contain' }} />
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
						<Button variant="contained" color="green" type="submit">Create</Button>
					</Box>
				</Paper>

			</div>
		</ThemeProvider>


	)
}
export default CreateListings;
