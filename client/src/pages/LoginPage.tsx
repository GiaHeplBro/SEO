import Auth from '@/components/loginGoogle/Auth';
import { useLocation } from 'wouter';

// This is just an example, the onLoginSuccess logic is handled in App.tsx
// We pass a dummy function here because the real logic is one level up.
const LoginPage = () => {
    const [, navigate] = useLocation();
    
    const handleSuccess = () => {
        // After successful login, App.tsx will handle the state change
        // and this component will be unmounted. We can navigate to dashboard
        // as a fallback.
        navigate("/dashboard");
    };

    return <Auth onLoginSuccess={handleSuccess} />;
};

export default LoginPage;