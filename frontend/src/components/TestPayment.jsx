import React, { useState } from 'react';

function TestPayment(props) {
    const handleTest = () => {
        const fetchdata = async () => {
			try {
				const response = await fetch('http://localhost:8080/testPay', {
					method: 'Get',
					headers: {
						'Content-Type': 'application/json',
						'email': props.token
					},
				});


				const data = await response.json();
                if (data.error) {
                    return Promise.reject(data.error);
                } else {
                    return Promise.resolve(data);
                }
            } catch (error) {
                return Promise.reject(error);
            }
		};
        fetchdata().then(console.log).catch(console.log);
    }
    return(
        <>
            <button onClick={handleTest}>test payment</button>
        </>
    );
}
export default TestPayment;