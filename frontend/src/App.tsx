import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboardPage/dashBoard"
import Login from "./pages/loginPage/login"
import SignUp from "./pages/sign-upPage/SignUp"
import LandingPage from "./pages/landingPage/LandingPage";
import DocsPage from "./pages/docsPage/DocsPage";
import MarkdownDocPage from "./pages/docsPage/MarkdownPage";
import HowToUsePage from "./pages/howToUsePage/HowToUsePage";
import { WebSocketProvider } from './utilities/WebSocketContext'
import TermsOfService from './pages/TermsOfService/TermsOfService';
import './i18n';

export default function App()
{
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <WebSocketProvider>
            <Dashboard />
          </WebSocketProvider>
        } 
      />
      <Route path="/SignUp" element={<SignUp />} />
    
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/docs/:slug" element={<MarkdownDocPage />} />
      <Route path="/how-to-use" element={<HowToUsePage />} />
	  <Route path="/terms-of-service" element={<TermsOfService />} />
    </Routes>
  );
}