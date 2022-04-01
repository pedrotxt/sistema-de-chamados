import { useState, useEffect, useContext } from "react";

import { AuthContext } from "../../contexts/auth";

import firebase from "../../services/firebaseConnection";

import { useHistory, useParams } from 'react-router-dom';

import Header from "../../components/Header";
import Title from "../../components/Title";

import "./new.css";

import { FiPlus } from "react-icons/fi";

import { toast } from "react-toastify";

export default function New(){

    const {id} = useParams();
    const history = useHistory();

    const [loadCustomers, setLoadCustomers] = useState(true);
    const [customerSelected, setCustomerSelected] = useState(0);
    const [customers, setCustomers] = useState([]);

    const [assunto, setAssunto] = useState('Suporte');

    const [status, setStatus] = useState('Aberto'); 

    const [complemento, setComplemento] = useState('');

    const [idCustomer, setIdCustomer] = useState(false);

    const { user } = useContext(AuthContext);

    useEffect(()=> {
        async function loadCustomer(){
            await firebase.firestore().collection('customers')
            .get()
            // snapshot me permite acessar todos os itens que tem na minha collection de customers
            .then((snapshot)=>{
                let lista = [];

                // percorre os itens da collection customers do doc que...
                snapshot.forEach((doc)=> {
                    // adicionando os valores que estão la dentro pra minha lista
                    lista.push({
                        id: doc.id,
                        nomeFantasia: doc.data().nomeFantasia
                    })
                })

                // tentou percorrer mas não achou nenhum cliente
                if(lista.length === 0){
                    console.log('Nenhuma empresa encontrada.');
                    setLoadCustomers(false);
                    setCustomers([ { id: '1', nomeFantasia: 'FREELA'} ]);
                    // para de executar o codigo se a lista tiver vazia
                    return;
                }

                setCustomers(lista);
                setLoadCustomers(false);

                // ja finalizou o loading dos clientes
                // If(id) que dizer que ele está tentando editar
                // ele entrou numa rota que ele passou um id
                if(id){
                    loadId(lista);
                }
            })
            .catch((error)=>{
                console.log('Deu algum erro.', error)
                setLoadCustomers(false);
                setCustomers([ { id: '1', nomeFantasia: ''} ]);
            })

            
        }

        loadCustomer();

    }, [id]);

    async function loadId(lista){
        // buscar se o id passado no link esta certo
        await firebase.firestore().collection('chamados')
        .doc(id)
        .get()
        // se ele caiu dentro do then quer dizer que ele achou esse id
        .then((snapshot)=>{
            // atribuir os valores do id passado para os campos
            setAssunto(snapshot.data().assunto);
            setStatus(snapshot.data().status);
            setComplemento((snapshot.data().complemento));

            // achar o index do cliente
            // percorre a lista inteira de clientes comparando se o selecionado é igual ao id do cliente que você selecionou o chamado e quando ele acha o id igual ao id que a gente buscou da collection chamados ele vai devolver o id na variavel index
            // item.id dessa lista que for === ao clienteId do snapshot
            let index = lista.findIndex(item => item.id === snapshot.data().clienteId);
            setCustomerSelected(index);
            // quer dizer que ele está em alguma rota para editar algum item
            setIdCustomer(true);
        })
        .catch((error)=>{
            console.log('ERRO NO ID PASSADO: ', error);
            // cai na condição de que o Id passado não existe
            setIdCustomer(false);
        })
    }

    async function handleRegister(e){
        e.preventDefault();

        // se tiver true quer dizer que ta tentando editar
        // não vou mandar o created pois não quero mexer quando ele foi criado
        if(idCustomer){
            await firebase.firestore().collection('chamados')
            .doc(id)
            .update({
                cliente: customers[customerSelected].nomeFantasia,
                clienteId: customers[customerSelected].id,
                assunto: assunto,
                status: status,
                complemento: complemento,
                userId: user.uid
            }) 
            .then(()=>{
                toast.success('Chamado editado com sucesso!');
                setCustomerSelected(0);
                setComplemento('');
                history.push('/dashboard');
            })
            .catch((err)=>{
                toast.error('Ops.. erro ao registrar, tente mais tarde.')
                console.log(err)
            })

            // parar execução do codigo
            return;
        }

        await firebase.firestore().collection('chamados')
        .add({
            created: new Date(),
            // customerSelected é onde fica o index do item selecionado que é passado para acessar o valor da customer especifica desse index
            cliente: customers[customerSelected].nomeFantasia,
            clienteId: customers[customerSelected].id,
            assunto: assunto,
            status: status,
            complemento: complemento,
            // Pegando o UID do usuario que fez o chamado(que está logado) pelo context
            userId: user.uid
        })
        .then(()=>{
            toast.success('Chamado criado com sucesso!');
            setComplemento('');
            setCustomerSelected(0);
        })
        .catch((error)=>{
            toast.error('Ops.. erro ao registrar, tente mais tarde.');
            console.log(error);
        })
    }

    // Chamado quando troca de Assunto
    function handleChangeSelect(e){
        // pegar o valor do option que ele selecionou 
        setAssunto(e.target.value);
    }

    // Chamado quando troca de Status
    function handleOptionChange(e){
        // pegar o valor do radio que ele selecionou 
        setStatus(e.target.value); 
    }

    // Chamado quando troca de Cliente
    function handleChangeCustomers(e){
        //console.log('INDEX SELECIONADO: ', e.target.value);
        //console.log('CLIENTE SELECIONADO: ', customers[e.target.value]);
        setCustomerSelected(e.target.value)
    }

    return(
        <div>
            <Header />

            <div className="content">
                <Title name="Novo Chamado">
                    <FiPlus size={25} />
                </Title>

                <div className="container">
                    <form className="form-profile" onSubmit={handleRegister} >

                        <label>Cliente</label>

                        {loadCustomers ? (
                            <input type="text" disable={true} value="Carregando clientes..." />
                        ) : (
                            <select value={customerSelected} onChange={handleChangeCustomers} >
                                {customers.map((item, index)=> {
                                    return(
                                        <option key={item.id} value={index} >
                                            {item.nomeFantasia}
                                        </option>
                                    )
                                })}
                            </select>
                        )}

                    <label>Assunto</label>
                        <select value={assunto} onChange={handleChangeSelect} > 
                            <option value="Suporte">Suporte</option>
                            <option value="Visita tecnica">Visita tecnica</option>
                            <option value="Financeiro">Financeiro</option> 
                        </select>

                    <label>Status</label>
                    <div className="status">
                        <input 
                        type="radio"
                        name="radio"
                        value="Aberto"
                        onChange={handleOptionChange}
                        checked={ status === 'Aberto' }
                        />
                        <span>Em aberto</span>

                        <input 
                        type="radio"
                        name="radio"
                        value="Progresso"
                        onChange={handleOptionChange}
                        checked={ status === 'Progresso' }
                        />
                        <span>Progresso</span>

                        <input 
                        type="radio"
                        name="radio"
                        value="Atendido"
                        onChange={handleOptionChange}
                        checked={ status === 'Atendido' }
                        />
                        <span>Atendido</span>
                    </div>

                    <label>Complemento</label>
                    <textarea 
                        type="text"
                        placeholder="Descreva seu problema (opcional)."
                        value={complemento}
                        onChange={ (e)=> setComplemento(e.target.value) }
                    />

                    <button type="submit">Registrar</button>

                    </form>
                </div>
            </div>
        </div>
    )
}