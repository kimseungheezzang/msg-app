'use client'
import {useEffect, useRef, useState} from "react";
import axios from "axios";

export default function Home() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [roomId, setRoomId] = useState('1');
    const [senderName, setSenderName] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const connectToRoom = () => {
        if (eventSourceRef.current) eventSourceRef.current.close();

        eventSourceRef.current = new EventSource(`http://192.168.0.193:8080/chat/room/${roomId}`);

        eventSourceRef.current.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        };

        eventSourceRef.current.onerror = (error) => {
            console.error('방 접속 실패:', error);
            setIsConnected(false);
        };

        eventSourceRef.current.onopen = () => {
            setIsConnected(true);
        };
    };

    const sendMessage = async () => {
        if (inputMessage.trim() === '') return;

        try {
            const response = await axios.post(`http://192.168.0.193:8080/chat/send/msg/room/${roomId}`, {
                chatMsg: inputMessage,
                senderName: senderName
            });
            setInputMessage('');
        } catch (error) {
            console.error('메세지 전송 실패:', error);
        }
    };

    return (
        <div>
            {!isConnected ? (
                <div>
                    <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="방 ID 입력"
                    />
                    <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="이름 입력"
                    />
                    <button onClick={connectToRoom}>채팅방 입장</button>
                </div>
            ) : (
                <div>
                    <div>
                        {messages.map((msg, index) => (
                            <div key={index}>
                                <strong>{msg.senderName}:</strong> {msg.chatMsg}
                            </div>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                    />
                    <button onClick={sendMessage}>전송</button>
                </div>
            )}
        </div>
    );
}
