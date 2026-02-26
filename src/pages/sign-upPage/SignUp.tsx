import './SignUp.css';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react"
import { useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

function SignUp()
{
    const googleDiv = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    function handleLogin() { navigate("/"); }

    function handleGoogleResponse(response: any) 
    {
        const token = response.credential;

        // invia il token al backend
        fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token })
        })
        .then(res => res.json())
        .then(data => {
            data = null
            // se l’utente non esiste → backend lo crea
            // se esiste → backend fa login
            handleLogin()
        });
    }

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
                    callback: handleGoogleResponse
                });

                window.google.accounts.id.renderButton(
                    googleDiv.current,
                    { theme: "outline", size: "large", text: "signup_with", shape: "rectangular", width: 300, height: 50}
                );
            }
        };
        document.body.appendChild(script);
    },[]);

    return (
        <div className="signUp-layout">
            <div className='SignUp-box'>
                <h1>Create your account!</h1>
                <div ref={googleDiv}></div>
                <span className="divider" > OR </span>
                <input type="text" placeholder="Name" className='input-field'/>
                <input type="text" placeholder="Surname" className='input-field'/>
                <input type="text" placeholder="E-mail" className='input-field'/>
                <input type="text" placeholder="Password" className='input-field'/>
                <input type="text" placeholder="Confirm-Password" className='input-field'/>
                <button onClick={handleLogin}>SignUp</button>
            </div>
        </div>
    )
}

export default SignUp;