
import { useState, useContext } from 'react';
import './profile.css';
import Header from '../../components/Header';
import Title from '../../components/Title';

import avatar from '../../assets/avatar.png'

import firebase from '../../services/firebaseConnection';

import { AuthContext } from '../../contexts/auth';

import { FiSettings, FiUpload } from 'react-icons/fi';

export default function Profile(){
    const { user, signOut, setUser, storageUser } = useContext(AuthContext);

    // se tem um user, então user.nome
    // ele pega do nosso contexto e preenche dentro das nossas useState
    const [nome, setNome] = useState(user && user.nome);
    const [email, setEmail] = useState(user && user.email);
    
    const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl);

    // salvar a foto que ele mandar nessa useState separada
    const [imageAvatar, setImageAvatar] = useState(null);

    // Um Preview da foto selecionada / onChange do input file
    // Quando recebe uma foto ele recebe um evento
    // e pode pegar a primeira foto desse array que vem do evento que é a foto selecionada agora
    function handleFile(e){

        // se tem uma imagina selecionada, faça
        if(e.target.files[0]){
            const image = e.target.files[0];

            if(image.type === 'image/jpeg' || image.type === 'image/png'){
                setImageAvatar(image);
                // quero criar uma URL em cima dessa foto que ele mandou pra mim e colocar dentro do nosso preview da imagem no site
                setAvatarUrl(URL.createObjectURL(e.target.files[0]))
            }else{
                alert('Envie uma imagem do tipo PNG ou JPEG');
                setImageAvatar(null);
                // para a execução do nosso codigo
                return null;
            }
        }
    }

    // Enviar para o firebase storage(imagens) a foto salva no perfil e depois para o firestore a url dessa mesma foto e o nome que ele digitou
    async function handleUpload(){
        const currentUid = user.uid;

        const uploadTask = await firebase.storage()
        // criando uma pasta images/ com id do usuario logado/ e o nome da imagem
        .ref(`images/${currentUid}/${imageAvatar.name}`)
        // dentro dessa pasta vou colocar a imagem
        .put(imageAvatar)
        // em caso de sucesso da foto ser enviada para o storage
        .then(async()=>{
            console.log('FOTO ENVIADA COM SUCESSO');
            // buscar a url da imagem/ .getDownloadURL() firebase que disponibiliza
            await firebase.storage().ref(`images/${currentUid}`)
            .child(imageAvatar.name).getDownloadURL()
            // em caso de sucesso, vou receber a url dessa foto dentro do parametro
            .then( async (url)=>{
                let urlFoto = url;

                // enviando essa url para o banco firestore
                await firebase.firestore().collection('users')
                .doc(user.uid)
                .update({
                    avatarUrl: urlFoto,
                    nome: nome
                })
                // refletindo as alterações dentro do contexto para toda aplicação receber os valores novos
                .then(()=> {
                    let data = {
                        // pego todos os dados que ja tem no nosso contexto de auth e atualizo somente o avatarUrl com a url da foto e o nome com o nome do useState atualizado que ele digitou
                        ...user,
                        avatarUrl: urlFoto,
                        nome: nome
                    };

                    // mandando os valores atualizados pro setUser la do contexto
                    setUser(data);
                    // armazena os valores atualizados pro localStorage
                    storageUser(data);
                })
            })
        })
    }
    
    // Verificações e salvamento do formulario
    async function handleSave(e){
        // não atualiza a página
        e.preventDefault();
        
        // Quer dizer que ele só quer trocar o nome e não colocou nenhuma foto de avatar
        if(imageAvatar === null && nome !== ''){
            await firebase.firestore().collection('users')
            .doc(user.uid)
            .update({
                // dando um update no campo nome do firestore para o nome que ta salvo no useState nome
                nome: nome
            })
            .then(()=> {
                let data = {
                    // joga todos os valores que o usuario já tem dentro do data
                    ...user,
                    // depois alterando somente o nome, com o nome que ele digitou
                    nome: nome
                };
                // passando o novo data com as novas informações do usuario para o user que está no useContext
                setUser(data);
                // passando o novo data com as novas informações do usuario para o localStorage
                storageUser(data);
            })
        }

        

        // Se o nome for diferente de vazio e o imageAvatar diferente de null quer dizer que ele mudou os dois
        else if(nome !== '' && imageAvatar !== null){
            handleUpload();
        }
    }

    return(
        <div>
            <Header /> 

            <div className='content'>
                <Title name="Meu perfil">
                    <FiSettings size={25} />
                </Title>

                <div className='container'>
                    <form className='form-profile' onSubmit={handleSave}>
                        <label className='label-avatar'>
                            <span>
                                <FiUpload color='#FFF' size={25} />
                            </span>
                            

                            <input type="file" accept='image/*' onChange={handleFile} /><br/>
                            { avatarUrl === null ? 
                                <img src={avatar} width="250" height="250" alt='Foto de perfil do usuario' />
                                :
                                <img src={avatarUrl} width="250" height="250" alt='Foto de perfil do usuario' />
                            }


                        </label>

                        <label>Nome</label>
                        <input type="text" value={nome} onChange={ (e)=> setNome(e.target.value) } />

                        <label>Email</label>
                        <input type="text" value={email} disabled={true} />

                        <button type='submit'>Salvar</button>

                    </form>
                </div>

                <div className='container'>
                    <button className='logout-btn' onClick={ ()=> { signOut() } } >
                        Sair
                    </button>
                </div>
            </div>

        </div>
    )
}