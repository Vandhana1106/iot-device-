import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import './Login.css';

const Login = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onFinish = async (values) => {
        console.log('Username:', values.username);
        console.log('Password:', values.password);
    
        try {
            const response = await fetch("https://pinesphere.pinesphere.co.in/api/user_login/", { // this should be /api/user_login
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });
    
            if (!response.ok) {
                throw new Error("Authentication failed");
            }
    
            const data = await response.json();
            Cookies.set('jwt', data.token);  // Adjust based on the actual response format
            navigate("/dashboard");
        } catch (error) {
            console.error('Error during login:', error.message);
            toast.error('Incorrect username or password');
        }
    };
    console.log('Request URL:', "/api/user_login/");
    
    const onFinishFailed = (errorInfo) => {
        // Handle form validation failures if any
        console.log('Failed:', errorInfo);
    };

    return (
        <>
            <div className="login-container">
                <div className="login-form">
                    <Form
                        name="basic"
                        layout="vertical"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        {error && <p className="error-message">{error}</p>}

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Log In
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
            <footer className="login-footer">
                <p>@ <a href="https://pinesphere.com/">Pinesphere</a>. All rights reserved.</p>
            </footer>
            <ToastContainer />
        </>
    );
};

export default Login;
