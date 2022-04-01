import './dashboard.css';

import { useState, useEffect } from "react";

import Header from "../../components/Header";
import Title from "../../components/Title";
import Modal from '../../components/Modal';

import { FiMessageSquare, FiPlus, FiSearch, FiEdit2 } from "react-icons/fi";
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

import firebase from '../../services/firebaseConnection';

// referencia para não ter repetição de codigo
const listRef = firebase.firestore().collection('chamados')
// ordenar em decrecente pela nossa propriedade created que contém a data de criação
.orderBy('created', 'desc');

export default function Dashboard(){
    // vai ser um array pois os chamados vão ficar dentro de uma lista
    const [chamados, setChamados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [isEmpty, setIsEmpty] = useState(false);
    const [lastDocs, setLastDocs] = useState();

    const [showPostModal, setShowPostModal] = useState(false);
    const [detail, setDetail] = useState();

    // exibir todos os chamados assim que a página é aberta
    useEffect(()=>{

        // pegar todos os chamados da nossa collection chamados do firestore
        async function loadChamados(){
            // limite de 5 aparições
            await listRef.limit(5)
            .get()
            // snapshot: acessa as informações pegas no get
            .then((snapshot)=>{
                updateState(snapshot)
            })
            .catch((err)=> {
                console.log('Deu algum erro: ',err)
                setLoadingMore(false);
            })
    
            setLoading(false);
        }

        loadChamados();
    },[]);



    // function para buscar mais chamados
    async function updateState(snapshot){
        // se for igual a 0, vai receber um true
        const isCollectionEmpty = snapshot.size === 0;

        // se não for true, quer dizer que não está vazia
        if(!isCollectionEmpty){
            let lista = [];

            // percorrendo todas as documentações
            snapshot.forEach((doc)=>{
                lista.push({
                    id: doc.id,
                    assunto: doc.data().assunto,
                    cliente: doc.data().cliente,
                    clienteId: doc.data().clienteId,
                    created: doc.data().created,
                    createdFormated: format(doc.data().created.toDate(), 'dd/MM/yyyy'),
                    status: doc.data().status,
                    complemento: doc.data().complemento
                });
            })

            // para não duplicar nossa listagem
            const lastDoc = snapshot.docs[snapshot.docs.length -1]; // Pegando o ultimo documento buscado (no caso o 5 documento que setei como limite)

            // pegando todos os chamados que eu ja tenho em ...chamados e se ele carregou mais chamados ele vai buscar na nossa lista e vai acrecentar mais essa lista dentro do array
            setChamados(chamados => [...chamados, ...lista]);

            // passando nossa variavel para useState
            setLastDocs(lastDoc);
        } else{
            setIsEmpty(true);
        }

        setLoadingMore(false);
    }

    // Função para nosso Modal de abrir e fechar mais detalhes do chamado selecionado
    // toggle> toda vez que eu clico ele abre, e se ja tiver aberto ele fecha
    function togglePostModal(item){
        //console.log(item);
        // trocando de true para false e de false para true toda vez que clicar com base no valor que ja tem
        // se o showPostModal estiver true vai renderizar o Modal
        setShowPostModal(!showPostModal);
        setDetail(item);
    }

    //renderização condicional - enquanto os chamados não são carregados
    if(loading){
    //loading = true
        return(
            <div>
                <Header/>

                <div className='content'>
                    <Title name="Atendimentos">
                        <FiMessageSquare size={25} />
                    </Title>
                </div>

                <div className='container dashboard'>
                    <span>Buscando chamados...</span>
                </div>

            </div>
        )
    }


    async function handleMore(){
        setLoading(true);
        // começando depois da nossa useState lastDocs
        await listRef.startAfter(lastDocs).limit(5)
        .get()
        .then((snapshot)=>{
            // vai montar toda nossa lista já
            updateState(snapshot)
            setLoading(false);
        })
    }

    

    // se não tiver carregando mais e se não tiver mais vazia(ele tentou buscar tudo que tinha e ja acabou) pode mostrar o button
    return(
        <div>
            <Header/>

            <div className='content'>
                <Title name="Atendimentos">
                <FiMessageSquare size={25} />
                </Title>

                {chamados.length === 0 ? (
                    <div className='container dashboard'>
                      <span>Nenhum chamado registrado...</span>

                      <Link to="/new" className="new">
                        <FiPlus size={25} color='#FFF'/>
                        Novo chamado
                      </Link>
                    </div>
                ) : (
                    <>
                      <Link to="/new" className="new">
                        <FiPlus size={25} color='#FFF'/>
                        Novo chamado
                      </Link>
                      <table>
                          <thead>
                              <tr>
                                  <th scope='col'>Cliente</th>
                                  <th scope='col'>Assunto</th>
                                  <th scope='col'>Status</th>
                                  <th scope='col'>Cadastrado em</th>
                                  <th scope='col'>#</th>
                              </tr>
                          </thead>

                          <tbody>
                              {chamados.map((item, index)=> {
                                  return(
                                    <tr key={index}>
                                        <td data-label='Cliente'>{item.cliente}</td>
                                        <td data-label='Assunto'>{item.assunto}</td>
                                        <td data-label='Status'>
                                            <span className='badge' style={{backgroundColor: item.status === 'Aberto' ? '#5cb85c'
                                                : '#999'
                                            }}>
                                            {item.status}
                                            </span>
                                        </td>
                                        <td data-label='Cadastrado'>{item.createdFormated}</td>
                                        <td data-label='#'>

                                            <button className='action' style={{backgroundColor: '#3583f6'}} onClick={ ()=> togglePostModal(item) } >
                                                <FiSearch color='#FFF' size={17}/>
                                            </button>

                                            <Link className='action' style={{backgroundColor: '#F6a935'}} to={`/new/${item.id}`}> 
                                                <FiEdit2 color='#FFF' size={17}/>
                                            </Link>
                                            
                                        </td>
                                    </tr>
                                  )
                              })}

                          </tbody>
                      </table>
                      
                      {loadingMore && <h3 style={{textAlign: 'center', marginTop: 15}}>Buscando chamados...</h3>}
                      { !loadingMore && !isEmpty && <button className='btn-more' onClick={handleMore}>Buscar mais</button>}
                    </>
                )}
            </div>

            {showPostModal && (
                <Modal 
                    conteudo={detail}
                    close={togglePostModal}
                />
            )}
            
        </div>
    )
}