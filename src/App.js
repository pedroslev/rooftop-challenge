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

  /* state for email */
  const[Email, setEmail] = React.useState('');
  /* state for token */  
  const[Token, setToken] = React.useState('');
  /* state for Blocks */  
  const[Blocks, setBlocks] = React.useState({});
  /* state for enabling getBlocks */
  const[disableBlocks, setDisableBlocks] = React.useState(true);
  /* state for enabling ordering and check buttons */
  const[disable, setDisable] = React.useState(true);

  /* Function for getting token */
  let getToken = (mail) => {
    /* email regex validation */
    let emailRegex= /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(mail.match(emailRegex)){
      /* Get token api request with axios */
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

  /* Function for getting blocks with pre-obtained token*/
  let getBlocks = async (token) => {
    try {
      await axios.get(`/blocks?token=${token}`)
      .then((response) => {
        setTimeout(() => {
          let blockArray = response.data.data
          document.getElementById('blocks').value = blockArray
          console.log(blockArray)
          setBlocks(blockArray)
          /* Need for enabling Check button if getBlocks response 200 */
          setDisable(false)
        }, 200)     
          
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

    /* FLAGS FOR BLOCKS */
    console.log(`Genesis:${genesisBlock}`)
    console.log(`antiGenesis:${antiGenesis}`)

    let orderValidated = []
    orderValidated.push(genesisBlock)
    console.log(`order validated at first: ${orderValidated}`)
      try {
        let validated = false
        let order = 0
        while(validated === false){
          console.log(antiGenesis.length)
          for (let index = 0; index < antiGenesis.length; index++) 
          {
            let data = JSON.stringify({
              "blocks": [
                orderValidated[order],
                antiGenesis[index]
              ]
            })

            /* BLOCKS TO CHECK */
            console.log(`Pair of block being checked: ${data}`)
          
            let result = await axios({
             method: 'post',
             url: `/check?token=${Token}`,
             headers: {'Content-Type': 'application/json'},
             data: data
            })
            console.log(`Pair of blocks checked result: ${result.data.message}`)
            if(result.data.message){
              orderValidated.push(antiGenesis[index])
              let auxiliar = []
              for (let sust = 0; sust < antiGenesis.length; sust++) {
                if(antiGenesis[index] !== antiGenesis[sust]){
                  auxiliar.push(antiGenesis[sust])
                }
              }
              antiGenesis = auxiliar;
              order++;
            }
          }
          if(orderValidated.length === 9){validated=true}
        }
        console.log(`Orden validado encontrado! ${orderValidated}`)
      } catch (error) {
        console.error(`checkBlockError: ${error}`)
      }
  }

  let arraySorter = (array, value) => {
    return array.filter((element) => {
      return element !== value
    })
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