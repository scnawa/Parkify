async function Logout (token, SID, setToken, setSID, setIsAdmin) {
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
      // sessionID should be removed from local storage all below as well maybe?
      if (response.status === 200) {
        setToken(null);
        setSID(null);
        setIsAdmin(false);
        localStorage.removeItem('token');
      } else {
        console.error('Logout failed:', data.error);
        // should we be doing the below stuff on error??
        setToken(null);
        setSID(null);
        localStorage.removeItem('token');
  
      }
    } catch (error) {
      console.error('An error occurred during logout:', error);
      setToken(null);
      setSID(null);
      localStorage.removeItem('token');

    }
  };

export default Logout;