import { useState, useContext } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../../contexts/auth";
import "./signin.css";
import logo from "../../assets/logo.png"

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn, loadingAuth } = useContext(AuthContext);

  function handleSubmit(e){
    // Serve pra ele não atualizar a pagina
    e.preventDefault();
    
    // Se email for diferente de vazio e também se password for diferente de vazio, chama a função com email e a password que ele digitou
    if(email !== '' && password !== ''){
      signIn(email, password);
    }
  }

    // Utilizando renderização condicional no loadingAuth ja que ele é um booleano = ?(se for true)-'Carregando...' :(se ele for false)'Acessar';
    return (
      <div className="container-center">
        <div className="login">
          <div className="logo-area">
            <img src={logo} alt="Sistema Logo" />
          </div>

          <form onSubmit={handleSubmit}>
            <h1>Entrar</h1>
            <input type="text" placeholder="email@email.com" value={email} onChange={ (e)=> setEmail(e.target.value) } />

            <input type="password" placeholder="*******" value={password} onChange={ (e)=> setPassword(e.target.value) } />

            <button type="submit">{loadingAuth ? 'Carregando...' : 'Acessar'}</button>
          </form>

          <Link to="/registro">Criar uma conta</Link>
        </div>
      </div>
    );
  }
  
  export default SignIn;
  