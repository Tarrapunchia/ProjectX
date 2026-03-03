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
    async function handleLogin() {
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
    function handleSignUp() { navigate("/SignUp"); }

    useEffect(() => 
    {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => 
        {
            if (window.google && googleDiv.current) 
            {
                window.google.accounts.id.initialize({
                    client_id: "IL_TUO_CLIENT_ID",
                    callback: (response: any) => {
                        console.log("Google response:", response);
                        navigate("/dashboard");
                    }
                });

                window.google.accounts.id.renderButton(
                    googleDiv.current,
                    { theme: "outline", size: "large", width: 300 }
                );
            }
        };
        document.body.appendChild(script);
    }, []);

    return (
        <div className="login-layout">
            <div className="login-box">
                <h1>Login to your account!</h1>
                <div ref={googleDiv}></div>
                <span className="divider" > OR </span>
                <input ref={emailRef} type="text" placeholder="E-mail" className='input-field email-field'/><br></br>
                <input ref={pwRef} type="text" placeholder="Password" className='input-field'/>
                <span className="password-forgotten" onClick={handleSignUp}> Password forgotten? </span>
                <button onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
}

export default login;