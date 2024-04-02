import React, { useEffect } from 'react';
import { Box, Button, Paper, Typography, createTheme, ThemeProvider, Popover, Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TextInputField from './TextInputField';
import CheckBoxInput from './CheckBoxInput';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import FileInputField from './FileInputField';
import Background from '../assets/car.png';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import location from '../assets/location.png';
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
function MapChild(props) {
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
const uploadFile = (file) => {
	let targetFile;
	if (file.length === 0) {
		return Promise.resolve('');
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
const mapApi = 'https://nominatim.openstreetmap.org/search?'
function CreateListings(props) {
	const [detail, setDetail] = React.useState('');

	const [rate, setRate] = React.useState(0);
	const [address, setAddress] = React.useState('');
	const [addressGeo, setGeo] = React.useState(null);

	const [addressOptions, setOptions] = React.useState([]);

	const [quantity, setQuantity] = React.useState(0);

	const [restriction, setRestriction] = React.useState('');
	const [thumbnail, setThumbnail] = React.useState([]);
	const [images, setImages] = React.useState([]);
	const loaded = React.useRef(false);
	console.log(addressGeo);

	const navigate = useNavigate();
	React.useEffect(() => {
		if (!props.token) {
			navigate('/login');
		}
		// eslint-disable-next-line
	}, [props.token]);
	// https://stackoverflow.com/questions/42217121/how-to-start-search-only-when-user-stops-typing
	React.useEffect(() => {
		setOptions([]);
		const delaySearch = setTimeout(() => {
			const mapParameter = {
				q: address,
				format: 'json',
				limit: 5,
				addressdetails: 1,
				polygon_geojson: 1,
				countrycodes:["AU"],
			}
			const mapQuery = new URLSearchParams(mapParameter).toString();
			fetch(`${mapApi}${mapQuery}`, { method: "GET", redirect: "follow" }).then((respond) => {
				return respond.json();
			}).then((data) => {
				loaded.current = true;
				setOptions(data);
			}).catch(alert);

			return;
		}, 500);
		return () => clearTimeout(delaySearch);
	}, [address]);
	const submitForm = (e) => {
		e.preventDefault();
		console.log(addressGeo);
		uploadFile(thumbnail).then((url) => {
			const data = {
				email: props.token,
				listings: {
					"address": addressGeo.display_name,
					"price": rate,
					"quantity": quantity,
					"details": detail,
					"restrictions": restriction,
					"image_url": url
				}
			}
			console.log(data);

			const fetchListings = async () => {
				try {
					const response = await fetch('http://localhost:' + '8080/' + 'create_listing', {
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
			return fetchListings();
		}).then(() => alert("created listing")).then(() => navigate('/myListing'))
			.catch((err) => {
				alert(err);
				console.error(err);
			});
	}
	let locations = [50, 50];

	if (addressGeo && addressGeo.lat && addressGeo.lon) {
		locations = [addressGeo.lat, addressGeo.lon];

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

					<Box component="form" sx={{ mt: 1, rowGap: "50px" }}>
						{/* the below Autocomplete code is from https://mui.com/material-ui/react-autocomplete/#free-solo */}
						<Autocomplete
							sx={{ width: '100%' }}
							value={addressGeo}
							freeSolo
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
							getOptionLabel={(option) => {
								return `${option.display_name}`;
							}
							}
							renderInput={(params) => (
								<TextField {...params} label="Address" color="success" fullWidth required />
							)}

						/>
						{/* the below code of map is from https://www.youtube.com/watch?v=rmIhGPy8rSY and
						https://react-leaflet.js.org/docs/example-popup-marker/*/}
						<div style={{ width: "100%", height: "50vh", maxHeight: "600px" }}>
							<MapContainer center={[40.505, -50.09]} zoom={10} style={{ width: '100%', height: '100%' }}>
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

						<TextInputField label="Quantity:" setFunction={setQuantity} value={quantity} color="success" variant="outlined" type="number" />
						<TextInputField label="Rate:" setFunction={setRate} value={rate} color="success" variant="outlined" type="number" />
						<TextInputField label="Details:" setFunction={setDetail} value={detail} color="success" variant="outlined" multiline={true} />
						<TextInputField label="Restrictions:" setFunction={setRestriction} value={restriction} color="success" variant="outlined" multiline={true} />
						{/* <CheckBoxInput setCheckBox={setAmenties} checkBox={amenties} description="" /> */}
						<FileInputField multiple={false} setImage={setThumbnail} content="Upload Thumbnail" />
						{/* <FileInputField multiple={true} setImage={setImages} content="Upload Additional Images" /> */}

						<Button variant="contained" color="green" onClick={(e) => submitForm(e)}>Create</Button>
					</Box>
				</Paper>

			</div>
		</ThemeProvider>


	)
}
export default CreateListings;
