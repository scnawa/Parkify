import React from 'react';
import { Box, Button, Paper, Typography, createTheme, ThemeProvider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TextInputField from './TextInputField';
import CheckBoxInput from './CheckBoxInput';
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

function CreateListings(props) {
	const [detail, setDetail] = React.useState('');

	const [rate, setRate] = React.useState(0);
	const [address, setAddress] = React.useState('');
	const [quantity, setQuantity] = React.useState(0);

	const [restriction, setRestriction] = React.useState('');
	const [amenties, setAmenties] = React.useState({ 'car charging': false, 'under shade': false, 'private security': false });
	const [thumbnail, setThumbnail] = React.useState([]);
	const [images, setImages] = React.useState([]);

	const navigate = useNavigate();
	React.useEffect(() => {
		if (!props.token) {
			navigate('/login');
		}
		// eslint-disable-next-line
	}, [props.token]);

	const submitForm = (e) => {
		e.preventDefault();
		uploadFile(thumbnail).then((url) => {
			const data = {
				email: props.token,
				listings: {
					"address": address,
					"price": rate,
					"quantity": quantity,
					"details": detail,
					"restrictions": restriction,
					"image_url": url
				}
			}
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
		}).then(()=>navigate('/myListing'))
		.catch((err) => {
			alert(err);
			console.error(err);
		});
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

				<Box component="form" sx={{ mt: 1}}>
					<TextInputField label="Address:" setFunction={setAddress} value={address} color="success" variant="outlined" />
					<TextInputField label="Quantity:" setFunction={setQuantity} value={quantity} color="success" variant="outlined" type="number" />
					<TextInputField label="Rate:" setFunction={setRate} value={rate} color="success" variant="outlined" type="number" />
					<TextInputField label="Details:" setFunction={setDetail} value={detail} color="success" variant="outlined" multiline={true} />
					<TextInputField label="Restrictions:" setFunction={setRestriction} value={restriction} color="success" variant="outlined" multiline={true} />
					{/* <CheckBoxInput setCheckBox={setAmenties} checkBox={amenties} description="" /> */}
					<p></p>

					<FileInputField multiple={false} setImage={setThumbnail} content="Upload Thumbnail" />
					{/* <FileInputField multiple={true} setImage={setImages} content="Upload Additional Images" /> */}
					<p></p>

					<Button variant="contained" color="green" onClick={(e) => submitForm(e)}>Create</Button>
				</Box>
			</Paper>

		</div>
		</ThemeProvider>

	)
}
export default CreateListings;
