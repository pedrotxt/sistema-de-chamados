// Configuração de todas as nossas rotas

import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";

import Profile from "../pages/Profile";

import Dashboard from "../pages/Dashboard";

import Customers from "../pages/Customers";

import New from "../pages/New";

import Route from "./Route";

// Um componente por página
import { Switch } from "react-router-dom";

export default function Routes(){
    return(
        <Switch>
            <Route exact path="/" component={SignIn} />

            <Route exact path="/registro" component={SignUp}/>

            <Route exact path="/dashboard" component={Dashboard} isPrivate />

            <Route exact path="/profile" component={Profile} isPrivate />

            <Route exact path="/customers" component={Customers} isPrivate />

            <Route exact path="/new" component={New} isPrivate />

            <Route exact path="/new/:id" component={New} isPrivate />
        </Switch>
    );
}