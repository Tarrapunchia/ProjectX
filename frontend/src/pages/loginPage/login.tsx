import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import helpers from "../../utilities/helpers";

declare global {
  interface Window {
    google: any;
  }
}

export let ws: WebSocket | null = null;

function Login() 
{
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const pwRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    async function handleLogin() 
    {
        setError(null)
        const LOGIN_URL = `/api/v1/users/login`
        const DASHBOARD = '/dashboard'
        try 
        {
            const email = emailRef.current?.value
            const password = pwRef.current?.value

            const login = await helpers.poster(LOGIN_URL, { email, password });

            if (!login.success) 
            {
                setError(t("login.err_wrong_credentials"));
                return
            }

        } catch (error) 
        {
            console.log(error)
            setError(t("login.err_server"));
            return
        }
        navigate(DASHBOARD)
    }

    function handleGoogleLogin()
    {
        window.location.href = "/auth/google";
    }

    function handleSignUp() { navigate("/SignUp"); }

    return (
    <div className="flex items-center justify-center h-screen w-screen bg-bg-color">
        <div className="flex flex-col items-center text-center gap-5 p-10 text-[8px] bg-side-bg-color rounded-[10px] shadow-[0_0_10px_rgba(0,0,0,0.5)] h-auto w-auto">
            <h1 className="text-[30px] mb-[50px] text-text-main font-bold">{t("login.title")}</h1>
            <button
                onClick={handleGoogleLogin}
                className="
                    flex items-center justify-center gap-3
                    w-[250px] min-h-[50px]
                    px-[10px] py-[10px]
                    text-[18px] leading-[18px]
                    rounded-[5px]
                    bg-white font-medium
                    shadow-[0_0_10px_rgba(0,0,0,0.5)]
                    border border-gray-300
                    transition-all duration-300 ease-in-out
                    hover:scale-105 hover:shadow-[0_0_15px_rgba(0,0,0,0.6)]
                    cursor-pointer
                "
                >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 12.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24.5c0-1.57-.14-3.08-.41-4.5H24v9h12.85c-.56 2.9-2.23 5.36-4.73 7.03l7.31 5.66C43.79 37.24 46.5 31.28 46.5 24.5z"/>
                    <path fill="#FBBC05" d="M10.54 28.41c-.48-1.43-.75-2.96-.75-4.41s.27-2.98.75-4.41l-7.98-6.19C.92 16.33 0 20.06 0 24c0 3.94.92 7.67 2.56 10.59l7.98-6.18z"/>
                    <path fill="#34A853" d="M24 48c6.47 0 11.9-2.38 15.96-6.31l-7.31-5.66C30.71 37.78 27.54 39 24 39c-6.26 0-11.57-3.22-14.46-8.41l-7.98 6.18C6.51 42.62 14.62 48 24 48z"/>
                </svg>

                <span className="text-[16px] text-text-login">{t("login.google_btn")}</span>
            </button>

            <span className="text-[14px] text-text-main"> {t("login.or")} </span>

            <input 
                ref={emailRef}
                type="text" 
                placeholder={t("login.placeholder_email")} 
                className="mt-[5px] bg-white text-text-login border border-gray-300 p-[10px] text-[18px] rounded-[5px] w-[300px] min-h-[50px] transition-transform duration-200 ease-in-out focus:scale-105 outline-none"
            />
            <input 
                ref={pwRef} 
                type="password" 
                placeholder={t("login.placeholder_password")} 
                className="mt-[5px] bg-white text-text-login border border-gray-300 p-[10px] text-[18px] rounded-[5px] w-[300px] min-h-[50px] transition-transform duration-200 ease-in-out focus:scale-105 outline-none"
            />
            
            {error && (
                <div className="w-[250px] bg-red-900/40 border border-red-700 text-text-main px-2 py-0.5 rounded-md text-[13px]">
                    {error}
                </div>
            )}

            <span className="text-[14px] text-text-main cursor-pointer hover:underline"> 
                {t("login.forgot_password")} 
            </span>
            <div>
                <span className="text-[14px] text-text-main">{t("login.not_member")} </span>
                <span 
                    className="ml-2 text-[12px] text-text-main cursor-pointer hover:underline" 
                    onClick={handleSignUp}> {t("login.signup_link")} 
                </span>
            </div>
            <button 
                onClick={handleLogin}
                className="
                    flex items-center justify-center gap-3
                    w-[200px] min-h-[50px]
                    px-[10px] py-[10px]
                    text-[18px] leading-[18px]
                    text-text-login
                    rounded-[5px]
                    bg-white font-medium
                    shadow-[0_0_10px_rgba(0,0,0,0.5)]
                    border border-gray-300
                    transition-all duration-300 ease-in-out
                    hover:scale-105 hover:shadow-[0_0_15px_rgba(0,0,0,0.6)]
                    cursor-pointer
                "
            >
                {t("login.login_btn")}
            </button>
        </div>
    </div>
    );
}

export default Login;