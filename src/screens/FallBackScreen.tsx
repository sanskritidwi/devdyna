import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function FallBackScreen() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      navigate('/');
    }, 60000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className='FallBackScreenWrapper'>
      <h1>Oops! the mock server does not allow too many requests &#128547;</h1>
      <h3>Taking you back in {countdown} seconds...</h3>
    </div>
  );
}

export default FallBackScreen;
