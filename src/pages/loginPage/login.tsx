import './login.css';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

function login() 
{
    const googleDiv = useRef<HTMLDivElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const pwRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    // function handleLogin() { navigate("/dashboard"); }
    async function handleLogin() 
	{
        const LOGIN_URL = 'https://localhost:5000/api/v1/users/login'
        const DASHBOARD = '/dashboard'
        let res: any
        try {
            const email = emailRef.current?.value
            const password = pwRef.current?.value

            const login = await fetch(LOGIN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            if (!login.ok) {
                alert('Invalid Credentials')
                return
            }
            console.log(login)
            res = await login.json()
        } catch (error) {
            console.log(error)
            alert('Failed to fetch')
            return
        }
        alert('Valid Credentials')
        // chiamata per WS
        navigate(DASHBOARD)
    }

	function handleGoogleLogin()
	{
		window.location.href = "https://localhost:5000/auth/google";
	}

    function handleSignUp() { navigate("/SignUp"); }

    return (
        <div className="login-layout">
            <div className="login-box">
                <h1>Login to your account!</h1>
                <button onClick={handleGoogleLogin}>Accedi con Google</button>
                <span className="divider" > OR </span>
                <input ref={emailRef} type="text" placeholder="E-mail" className='input-field email-field'/>
                <input ref={pwRef} type="password" placeholder="Password" className='input-field'/>
                <span className="password-forgotten"> Password forgotten? </span>
				<div>
					<span className='text-muted'>Not a member yet? </span>
					<span className='Sign-Up' onClick={handleSignUp}> Sign-Up! </span>
				</div>
                <button onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
}

export default login;
