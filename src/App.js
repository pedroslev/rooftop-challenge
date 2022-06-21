import './App.css';
import React from 'react';
import  Container  from 'react-bootstrap/Container';
import  Row  from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar'
import logo from './media/rooftoplogo.png'
import Button from 'react-bootstrap/Button'
import axios from 'axios'


function App() {
  axios.defaults.baseURL = 'https://rooftop-career-switch.herokuapp.com/';
  axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

  /* state for email */
  const[Email, setEmail] = React.useState('');
  /* state for token */  
  const[Token, setToken] = React.useState('');
  /* state for Blocks */  
  const[Blocks, setBlocks] = React.useState([]);
  /* state for enabling getBlocks */
  const[disableBlocks, setDisableBlocks] = React.useState(true);
  /* state for enabling ordering and check buttons */
  const[disable, setDisable] = React.useState(true);

  /* func for getting token */
  let getToken = (mail) => {
    /* email regex validation */
    let emailRegex= /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(mail.match(emailRegex)){
      /* get token api request with axios */
      try {
        axios.get(`/token?email=${mail}`)
        .then((response) => {
          console.log(`token has been obtained: ${response.data.token}`)
          document.getElementById("token").value = response.data.token
          setToken(response.data.token)
        })
        /* Need for enabling getBlocks button if token response 200 */
        setDisableBlocks(false)
    } catch (error) {
        console.error(`failure at getToken: ${error}`)
    }
    }else{
      return(alert("Your Email address is invalid"))
    }
  }

  /* func for getting blocks with pre-obtained token*/
  let getBlocks = async (token) => {
    try {
      await axios.get(`/blocks?token=${token}`)
      .then((response) => {
        setTimeout(() => {
          let blockArray = response.data.data
          document.getElementById('blocks').value = blockArray
          console.log(blockArray)
          setBlocks(blockArray)
          setDisable(false)
        }, 2000)     
          
      })
    } catch (error) {
      console.error(`failure at getBlocks: ${error}`)
    }
  }


  let orderBlocks = async (blocks)=> {
    let genesisBlock = blocks[0]
    let aux = blocks.splice(1,9)
    let antiGenesis = []
    for (let index = 0; index < 8; index++) {
      antiGenesis.push(aux[index]) 
    }
    let orderValidated = []
    orderValidated.push(genesisBlock)
      try {
        let validated = false
        let order = 0
        while(validated === false){
          let lenght = antiGenesis.length
          for (let index = 0; index < lenght; index++) 
          {
            let data = `{"blocks": ["${orderValidated[order]}","${antiGenesis[index]}"]}`
            console.log(data)
            await axios.post(`/check?token=${Token}`, data)
            .then((response) => {
              console.log(response)
            })
            /*
              if(response === true){
                orderValidated.push(antiGenesis[index])
                antiGenesis = antiGenesis.splice(index,1)
                order++;}*/
          }
          if(orderValidated.length === 9){validated=true}
        }
        console.log(orderValidated)
      } catch (error) {
        console.error(`checkBlockError: ${error}`)
      }
  }
  

  return (
    <div>
      {/* NAVBAR */}
      <Navbar bg="dark" variant="dark">
        <Container fluid className='flexNavbar'>
          <Navbar.Brand href="/">
            <img
              alt="rooftopLogo"
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '}
          Rooftop Challenge
          </Navbar.Brand>
        </Container>
      </Navbar>

      {/* MENU */}
      <Container fluid className='flexMenu'>

          <Row>

            {/* INPUT AND OPERATIONS */}
            <Col className='colMenu' sm={4}>
            {/* MAIL INPUT */}
            <div className='emailDiv'>
            <input type="email" id="emailInput" onChange={() => setEmail(document.getElementById('emailInput').value)} className='emailEntry'></input>
            </div>
              
              {/* TOKEN PETITION BUTTON */}
              <div className='mailSubmit'>
                <Button variant="primary" type='submit' onClick={() => getToken(Email)}>Get Token</Button>
              </div>
              <hr/>
              {/* BLOCKS PETITION BUTTON */}
              <div className='buttonSubmitters'>
              <Button variant="secondary" id='getBlocksButton' onClick={() => getBlocks(Token)} disabled={disableBlocks}>Get Blocks</Button>
              </div>
            
              {/* BLOCK ORDER PETITION BUTTON */}
              <div className='buttonSubmitters'>
              <Button variant="warning" disabled={disable} onClick={() => orderBlocks(Blocks)}>Order</Button>
              </div>

              {/* CHECK BLOCK ORDER PETITION BUTTON */}
              <div className='buttonSubmitters'>
              <Button variant="success" disabled={disable}>Check</Button>
              </div>

            </Col>

            {/* DASHBORAD */}
            <Col className='colMenu' sm={8}>

              <div className='dataViewers'>
                <h4>Token:</h4>
                <input className='dataValues' type="text" id='token' name='token' readOnly></input>
              </div>

              <div className='dataViewers'>
                <h4>Blocks:</h4>
                <input className='dataValues' id='blocks' type="text" readOnly></input>
              </div>

              <div className='dataViewers'>
                  <h4>Status:</h4>
                  <input className='dataValues' type="text" readOnly></input>
              </div>

            </Col>

          </Row>

      </Container>
    </div>
      
    
  );
}

export default App;
