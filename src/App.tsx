import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboardPage/dashBoard"
import Login from "./pages/loginPage/login"
import SignUp from "./pages/sign-upPage/SignUp"

export default function App()
{
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/SignUp" element={<SignUp />} />
    </Routes>
  );
}