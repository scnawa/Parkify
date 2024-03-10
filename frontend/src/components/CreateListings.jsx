import React from 'react';
import { Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TextInputField from './TextInputField';
import CheckBoxInput from './CheckBoxInput';
import FileInputField from './FileInputField';
import Background from '../assets/car.png'
const pageStyle = {
	backgroundImage: `url(${Background})`,
	"background-size": "cover",
	height: "100%",

}

function CreateListings(props) {
	const [detail, setDetail] = React.useState('');

	const [price, setPrice] = React.useState(0);
	const [address, setAddress] = React.useState('');
	const [Quantity, setQuantity] = React.useState(0);

	const [restriction, setRestriction] = React.useState('');
	const [amenties, setAmenties] = React.useState({ 'car charging': false, 'under shade': false, 'private security': false });
	const [thumbnail, setThumbnail] = React.useState('');
	const [images, setImages] = React.useState([]);

	const navigate = useNavigate();
	React.useEffect(() => {
		if (!props.token) {
		  navigate('/login');
		}
	  }, [props.token]);
	
	const submitForm = (e) => {

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
				<h3>Create Listings</h3>
				<p></p>
				<form autoComplete="off" onSubmit={(e) => submitForm(e)}>
					<TextInputField label="Address:" setFunction={setAddress} value={address} color="success" variant="outlined" />
					<TextInputField label="Price:" setFunction={setPrice} value={price} color="success" variant="outlined" type="number"/>
					<TextInputField label="Quantity:" setFunction={setQuantity} value={Quantity} color="success" variant="outlined" type="number"/>

					<TextInputField label="Details:" setFunction={setDetail} value={detail} color="success" variant="outlined" multiline={true} />
					<TextInputField label="Restrictions:" setFunction={setRestriction} value={restriction} color="success" variant="outlined" multiline={true} />
					{/* <CheckBoxInput setCheckBox={setAmenties} checkBox={amenties} description="" /> */}
					<p></p>

					<FileInputField multiple={false} setImage={setThumbnail} content="Upload Thumbnail" />
					{/* <FileInputField multiple={true} setImage={setImages} content="Upload Additional Images" /> */}
					<p></p>

					<Button variant="outlined" color="secondary" type="submit">Create</Button>
				</form>
			</Paper>

		</div>
	)
}
export default CreateListings;
