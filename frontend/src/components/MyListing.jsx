function MyListings(props) {
	const [detail, setDetail] = React.useState('');


	const navigate = useNavigate();
	React.useEffect(() => {
		if (!props.token) {
		  navigate('/login');
		}
	  }, [props.token]);
    return (
        <>
        </>
    )
}