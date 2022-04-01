import { useState, createContext, useEffect } from "react";
import firebase from "../services/firebaseConnection";
import { toast } from "react-toastify";

export const AuthContext = createContext({});

function AuthProvider({ children }){

    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    // Quando minha aplicação abre e o contexto é montado no nosso App.js(AuthProvider) ele vai chamar o useEffect
    // Se tiver algum usuario logado automaticamente coloco dentro da useState user, e minha aplicação automaticamente por causa do signed vai redirecionar para o dashboard
    useEffect( ()=>{
        function loadStorage(){
            // se tiver algo no localStorage do SistemaUser vai ficar dentro desse storageUser
            const storageUser = localStorage.getItem('SistemaUser');

            // Se tiver algo dentro desse storageUser, faça
            if(storageUser) {
                // Jogando o que ele buscou para nossa useState user
                // JSON.parse para converter de volta para um objeto
                setUser(JSON.parse(storageUser));

                // para aplicação não ficar sem nada, enquanto ele faz a busca no localStorage e tenta ver se tem algum usuario que ja ta cadastrado, vou usar o useState loading que começa como true e mudar para false depois que ja tiver um usuario
                setLoading(false);
            };

            setLoading(false);
        };

        loadStorage();
    }, []);

    // função para cadastrar usuario
    async function signUp(email, password, nome){
        setLoadingAuth(true);
        // await para o js esperar essa requisição createUserWithEmailAndPassword
        // criando um usuario com o email e a senha que eu passar no singUp
        await firebase.auth().createUserWithEmailAndPassword(email, password)
        // .then é nosso case de sucesso, então caso o cadastro no auth for bem sucedido, vamos cadastrar no banco do firestore o que queremos agora.
        // passamos value no parametro da nossa função anonima e nesse value temos acesso ao email do usuario que ele acabou de cadastrar, ao id do usuario...
        .then( async (value)=> {
            // Vamos relacionar o Authentication do firebase(nosso usuario com email e senha), ao nosso banco de dados firestore, criando uma collection de users que vai ter os document(que vai ser o mesmo id que está na Auth) e então colocar as informações restantes dele, como por exemplo o nome que não pode ser passado no auth e vai ser armazenado no firestore

            // salvando o user id do auth que ele cadastrou
            let uid = value.user.uid;

            await firebase.firestore().collection('users')
            .doc(uid)
            // .set = dentro da coleção de users eu passo o que eu quero colocar/setar dentro do doc que vai ser criado com o uid que eu peguei do auth 
            .set({
                // setando nome, que vai receber o valor da nossa função signUp
                nome: nome,
                // setando avatarUrl como nula, que vai começar com a foto padrão
                avatarUrl: null
            })
            .then( ()=> {
                // depois dele cadastrar um usuario(auth) -> cadastrar no meu banco(firestore) e der tudo certo, vai cair nesse .then que vai disponibilizar os dados para o meu setUser, para todo mundo da minha aplicação ter acesso a esses dados
                let data = {
                    uid: uid,
                    nome: nome,
                    email: value.user.email,
                    avatarUrl: null
                };

                // seta no user essas informações para usar em toda aplicação e em seguida user muda para true
                setUser(data);

                // passo pro nosso localStorage
                storageUser(data);

                setLoadingAuth(false);

                toast.success('Bem vindo a plataforma!');
            })
        })
        // .catch é nosso caso de erro
        .catch((error)=> {
            console.log(error);

            toast.error('Ops, algo deu errado!')
            setLoadingAuth(false);
        })
    }

    // Criando uma função para salvar no nosso localStorage
    function storageUser(data){
        localStorage.setItem('SistemaUser', JSON.stringify(data));
    }

    // função de deslogar usuario
    async function signOut(){
        await firebase.auth().signOut();

        localStorage.removeItem('SistemaUser');
        setUser(null);
    }

    // função para logar usuario
    async function signIn(email, password){
        setLoadingAuth(true);

        // logar com signInWithEmailAndPassword, logando no usuario do firebase
        await firebase.auth().signInWithEmailAndPassword(email, password)
        // se logou caiu dentro do .then
        .then(async (value)=> {
            // dentro do .then pego o id do usuario que ele logou
            let uid = value.user.uid;

            // vou no banco de dados desse usuario e pego as informações desse usuario que ele logou com o .get() 
            const userProfile = await firebase.firestore().collection('users')
            .doc(uid).get();
            
            // passamos para data as informações que quero utilizar
            let data = {
                uid: uid,
                nome: userProfile.data().nome,
                avatarUrl: userProfile.data().avatarUrl,
                email: value.user.email
            };

            // seta no user essas informações para usar em toda aplicação e em seguida user muda para true
            setUser(data);
            // passo pro nosso localStorage
            storageUser(data);

            setLoadingAuth(false);

            toast.success('Bem vindo a plataforma!');
        })

        .catch((error)=>{
            console.log(error);
            toast.error('Ops, algo deu errado!')
            setLoadingAuth(false);
        })
    }



    // passando a verificação signed de Route, e as informações desse usuario
    // !! ele vai converter o que tiver dentro do useState para booleano
    // ex: se nesse nosso useState user tiver: nome: 'Matheus', convertido para booleano, o !!user vai receber um true, que quer dizer que tem alguma coisa ali dentro, se não tiver nada e ainda for null, ele vai receber como false
    // vamos usar esses valores para verifição de acesso a rotas para pessoas com user e sem user em Route
    return(
        <AuthContext.Provider value={{ 
            signed: !!user,
            user,
            loading,
            signUp,
            signOut,
            signIn,
            loadingAuth,
            // passando setUser(para alterar nossa useState de user aqui do contexto com os novos valores que ele digitar no formulario do perfil) e passando storageUser para salvar os mesmos novos valores no localStorage
            setUser,
            storageUser
            }}>  
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;