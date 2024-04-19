
// The function to handle logout
async function Logout(token, setToken, setIsAdmin, setEmail) {
	try {
		const response = await fetch('/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: token,
				currentSessionID: token,
			}),
		});

		const data = await response.json();
		// remove all status of the user
		if (response.status === 200) {
			setToken(null);
			setIsAdmin(false);
			setEmail(null);
			localStorage.removeItem('token');
			localStorage.removeItem('email');
			localStorage.removeItem('isAdmin');
		} else {
			console.error('Logout failed:', data.error);
			setToken(null);
			setEmail(null);
			localStorage.removeItem('token');
			localStorage.removeItem('email');
			localStorage.removeItem('isAdmin');
		}
	} catch (error) {
		console.error('An error occurred during logout:', error);
		setToken(null);
		setEmail(null);
		localStorage.removeItem('token');
		localStorage.removeItem('email');
		localStorage.removeItem('isAdmin');
	}
};

export default Logout;