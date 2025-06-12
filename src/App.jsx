import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import CanvasPage from "./layout/pages/Canvas";
import Header from "./layout/pages/Header";
import Footer from "./layout/pages/Footer";
import NotFoundPage from "./layout/pages/NotFoundPage";
import HomePage from "./layout/pages/HomePage";
import ProfilePage from "./layout/pages/ProfilePage";
import SignInPage from "./layout/pages/SignInPage";
import SignUpPage from "./layout/pages/SignUpPage";
import SettingsPage from "./layout/pages/SettingsPage";
import InvitationsPage from "./layout/pages/InvitationsPage";
import { AuthProvider } from "./utils/authContext";
import { ToastContainer, Slide } from "react-toastify";

function AppContent() {
	const location = useLocation();
	const noFooterPaths = ["/mindmap"];
	const shouldShowFooter = !noFooterPaths.some((path) => location.pathname.startsWith(path));

	return (
		<>
			<Header />
			<div>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/signin/" element={<SignInPage />} />
					<Route path="/signup/" element={<SignUpPage />} />
					<Route path="/profile/:userId" element={<ProfilePage />} />
					<Route path="/settings/" element={<SettingsPage />} />
					<Route path="/mindmap/:mindmapId" element={<CanvasPage />} />
					<Route path="/invitations/" element={<InvitationsPage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Routes>
				<ToastContainer
					position="bottom-right"
					autoClose={1000}
					limit={3}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
					transition={Slide}
				/>
				{shouldShowFooter && <Footer />}
			</div>
		</>
	);
}

function App() {
	return (
		<AuthProvider>
			<Router>
				<AppContent />
			</Router>
		</AuthProvider>
	);
}

export default App;
