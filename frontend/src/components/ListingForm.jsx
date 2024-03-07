import React from 'react';
import { InputLabel, Select, MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';

import Checkbox from '@mui/material/Checkbox';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';

import { apiCallWithBody } from '../helper.js';

// from assigment 3 helper.js
const uploadFile = (file) => {
  const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
  const valid = validFileTypes.find(type => type === file.type);
  if (!valid) {
    return new Promise(resolve => resolve(file));
  }
  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
}

// from https://stackoverflow.com/questions/73107755/checkboxes-with-react-and-mui
const renderAmenty = (type, setAmenties, amenties) => {
  return (
    <>
      <InputLabel id={type}>{type} is available</InputLabel>

      <Checkbox
        labelId={type}
        sx={{ mb: 3 }}

        checked={amenties[type]}
        onChange={event => {
          const newData = { ...amenties };
          newData[type] = event.target.checked;
          setAmenties(newData);
        }}
        color="primary"
        label={`${type} is avabilible`}

      />
    </>

  )
}
function renderInputForm (props) {

    

}
export const renderInputForm = (intialData, props, backendReq, methodReq) => {
  const [title, setTitle] = React.useState(intialData.title);
  const [address, setAddress] = React.useState(intialData.address);
  const [thumbnail, setThumbnail] = React.useState(intialData.thumbnail);
  const [price, setPrice] = React.useState(intialData.price);
  const [type, setType] = React.useState(intialData.type);
  const [bathroomNum, setbathroomNum] = React.useState(intialData.bathroomNum);
  const [bedRoomsNum, setbedNum] = React.useState(intialData.bedRoomsNum);
  const [bedRoomsInput, setBedRoomsInput] = React.useState(intialData.bedRoomsInput);
  const [amenties, setAmenties] = React.useState(intialData.amenties);
  const [city, setCity] = React.useState(intialData.city);
  const [images, setImages] = React.useState(intialData.additionalImages);
  const [thumbnailType, setThumbnailType] = React.useState(intialData.thumbnailType);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!props.token) {
      navigate('/login');
    }
  }, [props.token]);

  const bedRoomsNumOnchange = (value) => {
    setbedNum(value);

    const infoInputField = [];
    if (value > 0) {
      for (let i = 0; i < value; i++) {
        infoInputField.push({ id: i, bedNum: 0 });
      }
    }
    setBedRoomsInput(infoInputField);
  }
  const renderInput = (label, setFunction, value, type) => {
    return (
      <TextField
        name={label}
        label={label}
        onChange={e => setFunction(e.target.value)}
        required
        variant="outlined"
        color="secondary"
        type={type}
        sx={{ mb: 3 }}
        fullWidth
        value={value}
        InputProps={{ inputProps: { min: 0 } }}

      />
    )
  }
  const bedsNumChange = (index, e) => {
    const newData = [...bedRoomsInput];
    newData[index].bedNum = e.target.value;
    setBedRoomsInput(newData);
  }
  const submitForm = (event) => {
    event.preventDefault();
    const imagesUrlPromises = Array.from(images).map(image => uploadFile(image));
    if (thumbnailType === 'Youtube Url' && validateYoutube(thumbnail) === false) {
      alert('Youtube url invalid');
      return
    }
    let imagesUrl;
    Promise.allSettled(imagesUrlPromises).then(responds => {
      imagesUrl = responds.filter(x => x.status === 'fulfilled').map(y => y.value);
      return imagesUrl;
    }).then(() => {
      if (thumbnailType === 'Youtube Url') {
        return generateEmbedeYoutube(thumbnail);
      } else {
        return uploadFile(thumbnail);
      }
    }).then(thumbnailUrl => {
      const data = {
        title,
        address,
        thumbnail: thumbnailUrl,
        price,
        metadata: {
          bedRoomsInput,
          bathroomNum,
          bedRoomsNum,
          type,
          amenties,
          city,
          thumbnailType,
          additionalImages: imagesUrl
        }
      };
      return apiCallWithBody(backendReq, props.token, data, methodReq).then(() => navigate('/hosted-listings'));
    }).catch(alert);
  }
  const types = ['Apartment', 'House'];
  const thumbnailTypes = ['Youtube Url', 'Image file'];
  const typeLabel = 'House-Type';
  const thumbnailLabel = 'Thumbnail-Type';
  // from https://www.copycat.dev/blog/material-ui-form/
  // bedRoomsInput from https://blog.bitsrc.io/how-to-create-dynamic-form-fields-in-react-45cc2cc7b1b0
  return (
    <form autoComplete="off" onSubmit={(e) => submitForm(e)}>
      {renderInput('Title:', setTitle, title, 'text')}
      {renderInput('Address:', setAddress, address, 'text')}
      {renderInput('City:', setCity, city, 'text')}
      {renderTypeInput(thumbnailType, setThumbnailType, thumbnailTypes, (e) => setThumbnailType(e.target.value), thumbnailLabel)}
      <p></p>
      {(thumbnailType === 'Youtube Url') ? renderInput('thumbnail youtube Url:', setThumbnail, thumbnail, 'text') : null}
      {(thumbnailType === 'Image file') ? renderFileInput(thumbnail, setThumbnail, false) : null}

      {renderFileInput(images, setImages, true)}
      {renderInput('Price:', setPrice, price, 'number')}
      {renderTypeInput(type, setType, types, (e) => setType(e.target.value), typeLabel)}
      {renderInput('number of bathroom:', setbathroomNum, bathroomNum, 'number')}
      {renderInput('number of bedrooms:', bedRoomsNumOnchange, bedRoomsNum, 'number')}
      {bedRoomsInput.length > 0
        ? (<>
          {bedRoomsInput.map((value, index) => {
            return (
              <>
                <TextField
                  label={`number of beds in bedroom ${index + 1}`}
                  onChange={e => bedsNumChange(index, e)}
                  required
                  variant="outlined"
                  color="secondary"
                  type='number'
                  sx={{ mb: 2 }}
                  fullWidth
                  value={bedRoomsInput.find(x => x.id === value.id).bedNum}
                />
              </>
            )
          })}
        </>
          )
        : null}
      {renderAmenty('swimming pool', setAmenties, amenties)}
      {renderAmenty('gym', setAmenties, amenties)}
      {renderAmenty('WIFI', setAmenties, amenties)}
      <Button variant="outlined" color="secondary" type="submit">Create</Button>
    </form>
  )
}
export default renderInputForm;
