import Header from "./components/Header";
import Footer from "./components/Footer";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./i18n";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gradient-to-t from-teal-400 via-cyan-300 to-teal-400 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default App;
