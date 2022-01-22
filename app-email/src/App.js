import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { TextField, Button } from '@mui/material';

export default () => {
  const [messages, setMessages] = useState([{}]);
  const [value, setValue] = useState('');

  const fetchMessages = async () => {
    console.log('I am fetching');
    const response = await axios.get('http://localhost:8081/messages');
    setMessages(response.data);
  };

  useEffect(fetchMessages, []);
  return (
    <div className={'container'}>
      <div className={'chat-container'}>
        <div className={'message-box'}>
          {messages.map(({ sender, message }) => {
            return <div key={sender + message}>{`${sender} : ${message}`}</div>;
          })}
        </div>
        <TextField
          label='Standard'
          variant='standard'
          color='primary'
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button
          variant='outlined'
          onClick={async () => {
            console.log(value);
            await axios.post('http://localhost:8081/messages', {
              message: value,
            });
            setValue('');
            await fetchMessages();
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
};
