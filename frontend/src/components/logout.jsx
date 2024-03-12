async function Logout (token, SID, setToken) {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: token,
            currentSessionID: SID,
        }),
      });

      const data = await response.json();
      console.log(data)
      if (response.status === 200) {
        setToken(null);
      } else {
        console.error('Logout failed:', data.error);
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
    }
  };

export default Logout;