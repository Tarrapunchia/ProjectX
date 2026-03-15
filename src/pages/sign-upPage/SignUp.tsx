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
	const emailRef = useRef<HTMLInputElement>(null);
    const pwRef = useRef<HTMLInputElement>(null);
	const nameRef = useRef<HTMLInputElement>(null);
	const surnameRef = useRef<HTMLInputElement>(null);
	const reapetedpwRef = useRef<HTMLInputElement>(null);
    const googleDiv = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    async function handleLogin() 
	{
		const LOGIN_URL = 'https://localhost:5000/api/v1/users/addUser'
		try
		{
			const email = emailRef.current?.value
			const password = pwRef.current?.value
			const name	= nameRef.current?.value
			const surname = surnameRef.current?.value
			const passwordRepeat = reapetedpwRef.current?.value
			const phone = "673932"
			const jobQualifier = "developer"

			const response = await fetch(LOGIN_URL, 
			{
				method: "POST",
                headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password, name, surname, passwordRepeat, phone, jobQualifier }),
			});

			const data = await response.json();

			if (!response.ok) 
			{
				// TO DO: chiedere ai ragazi dei messaggi coerenti in csdo di errore
				const errorMessage = data.error || 'Something went wrong';
                alert(errorMessage)
                return
            }
		}
		catch (error)
		{
            console.log(error)
            alert('Failed to fetch')
            return
        }
		alert('Success!');
		navigate("/")
	}

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
                    client_id: "420347973399-53ldf8k6q09iknee12tupq5it194auss.apps.googleusercontent.com",
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
                <input ref={nameRef} type="text" placeholder="Name" className='input-field'/>
                <input ref={surnameRef} type="text" placeholder="Surname" className='input-field'/>
                <input ref={emailRef} type="text" placeholder="E-mail" className='input-field'/>
                <input ref={pwRef} type="password" placeholder="Password" className='input-field'/>
                <input ref={reapetedpwRef} type="password" placeholder="Confirm-Password" className='input-field'/>
                <button onClick={handleLogin}>SignUp</button>
            </div>
        </div>
    )
}

export default SignUp;