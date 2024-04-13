
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
		// sessionID should be removed from local storage all below as well maybe?
		if (response.status === 200) {
			setToken(null);
			setIsAdmin(false);
			setEmail(null);
			localStorage.removeItem('token');
			localStorage.removeItem('email');
		} else {
			console.error('Logout failed:', data.error);
			// should we be doing the below stuff on error??
			setToken(null);
			setEmail(null);
			localStorage.removeItem('token');
			localStorage.removeItem('email');
		}
	} catch (error) {
		console.error('An error occurred during logout:', error);
		setToken(null);
		setEmail(null);
		localStorage.removeItem('token');
		localStorage.removeItem('email');
	}
};

export default Logout;