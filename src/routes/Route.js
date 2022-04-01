// Controle de Rotas

import { useContext } from "react";
import { Route, Redirect} from "react-router-dom";
import { AuthContext } from "../contexts/auth";

export default function RouteWrapper({
    component: Component,
    isPrivate,
    ...rest
}){

    const { signed, loading } = useContext(AuthContext);

    // se o loading for true vai devolver uma div vazia
    if(loading){
        return(
            <div></div>
        )
    }

    // se ele não estar logado(signed for false) e a rota que ele está tentando acessar é privada, redirecionar para tela de login
    if(!signed && isPrivate){
        return <Redirect to="/" />
    }

    // se ele esta logado(signed for true) e a rota que ele tentou acessar não é privada, redirecionar para tela de dashboard
    if(signed && !isPrivate){
        return <Redirect to="/dashboard" />
    }

    return(
        <Route
            {...rest}
            render={ props => (
                <Component {...props}/>
            )}
        />
    )
}