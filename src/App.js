import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./contexts/auth";
import Routes from "./routes";

// Todas as rotas estão dentro do nosso AuthProvider, ou seja conseguimos acessar/consumir todos aqueles values que ele ta acessando para qualquer componente
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer autoClose={3000} />
        <Routes/>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
