async function GetUser (token) {
    try {
      const response = await fetch('/getUserInfo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'email': token,
        }
      });

      const data = await response.json();
      console.log(data)
      if (response.status === 200) {
        return data;
      } else {
        console.error('Could not get User:', data.error);
      }
    } catch (error) {
      console.error('An error occurred during getting user:', error);
    }
  };

export default GetUser;