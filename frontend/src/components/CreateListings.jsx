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
    height:"100%",

}

function CreateListings (props) {
    const [title, setTitle] = React.useState('' );
    const [price, setPrice] = React.useState(0);
    const [address, setAddress] = React.useState('');
    const [restriction, setRestriction] = React.useState('');
    const [amenties, setAmenties] = React.useState({ 'car charging': false, 'under shade': false, 'private security': false });
    const [thumbnail, setThumbnail] = React.useState('');
    const [images, setImages] = React.useState([]);

    const navigate = useNavigate();
    const submitForm = (e) => {

    }
    return (
        <div style={pageStyle}>
        <Paper elevation={3}
            sx={{
                p: 2,
                margin: 'auto',
                width:0.8,
                maxWidth: 800,
                minWidth:325,
                // flexGrow: 1,
            }}
        >
            <h3>Create Listings</h3>
                <p></p>
                <form autoComplete="off" onSubmit={(e) => submitForm(e)}>
                    <TextInputField label="Title:" setFunction={setTitle} value={title} color="success" variant="outlined"/>
                    <TextInputField label="Price:" setFunction={setPrice} value={price} color="success" variant="outlined"/>
                    <TextInputField label="Address:" setFunction={setAddress} value={address} color="success" variant="outlined"/>
                    <TextInputField label="Restriction:" setFunction={setRestriction} value={restriction} color="success" variant="outlined"/>
                    <CheckBoxInput setCheckBox={setAmenties} checkBox={amenties} description="is provided"/>
                    <p></p>

                    <FileInputField multiple={false} setImage={setThumbnail} content="Upload Thumbnail"/>
                    <FileInputField multiple={true} setImage={setImages} content="Upload Additional Images"/>
                    <p></p>

                    <Button variant="outlined" color="secondary" type="submit">Create</Button>
                </form>
        </Paper>

        </div>
    )
}
export default CreateListings;
