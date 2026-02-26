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
    const navigate = useNavigate();
    function handleLogin() { navigate("/dashboard"); }
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
                <input type="text" placeholder="E-mail" className='input-field email-field'/>
                <input type="text" placeholder="Password" className='input-field'/>
                <span className="password-forgotten" onClick={handleSignUp}> Password forgotten? </span>
                <button onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
}

export default login;