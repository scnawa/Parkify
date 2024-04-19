// The function to get a user information
async function GetUser(token, email) {
	try {
		const response = await fetch('/getUserInfo', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'token': token,
				'email': email
			}
		});

		const data = await response.json();
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