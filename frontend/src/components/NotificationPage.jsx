import React, { useEffect, useState, useRef } from 'react';

const NotificationPage = () => {
    const [changes, setChanges] = useState([]);
    const isInitialRender = useRef(true);
    /* useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('/changes', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
    
                const result = await response.json();
                setChanges(result);
                console.log("Notifications")
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };
    
        if (!isInitialRender.current) {
            fetchNotifications();
        } else {
            isInitialRender.current = false;
        }
    }, [changes]); // Include 'changes' as a dependency */
    useEffect(() => {
        const eventSource = new EventSource('/events');

        eventSource.onmessage = (event) => {
            const newNotification = JSON.parse(event.data);
            setChanges(prevNotifications => [...prevNotifications, newNotification]);
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <div>
            <h1>Notifications</h1>
            <p>There are notifications</p>
            <ul>
                {changes.map((change, index) => (
                <li key={index}>{JSON.stringify(change)}</li>
                ))}
            </ul>
        </div>
        );
    };

export default NotificationPage;