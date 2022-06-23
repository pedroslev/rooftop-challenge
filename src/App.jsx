import './App.css';
import React from 'react';
import  Container  from 'react-bootstrap/Container';
import  Row  from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar'
import logo from './media/rooftoplogo.png'
import rules from './media/rules.png'
import repository from './media/repository.png'
import linkedin from './media/linkedin.png'
import github from './media/github.png'
import Button from 'react-bootstrap/Button'
import axios from 'axios'

function App() {
  /* Axios config for URL */
  axios.defaults.baseURL = 'https://rooftop-career-switch.herokuapp.com/';

  /* state for email */
  const[Email, setEmail] = React.useState('');
  /* state for token */  
  const[Token, setToken] = React.useState('');
  /* state for Blocks */  
  const[Blocks, setBlocks] = React.useState({});
  /* state for ordered Blocks */  
  const[validatedOrder, setValidatedOrder] = React.useState([]);
  /* state for enabling getBlocks */
  const[disableBlocks, setDisableBlocks] = React.useState(true);
  /* state for enabling ordering and check buttons */
  const[disable, setDisable] = React.useState(true);

  /* Function for getting token */
  let getToken = (mail) => {

    /* email regex validation */
    let emailRegex= /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if(mail.match(emailRegex))
    {
      /* Get token api request with axios.js */
      try 
      {
          axios.get(`/token?email=${mail}`)
          .then((response) => {
            console.log(`token has been obtained: ${response.data.token}`);
            document.getElementById("token").innerText = response.data.token;
            /* Setting token on React State */
            setToken(response.data.token);
          })
          /* Need for enabling getBlocks button if token response 200 */
          setDisableBlocks(false);
      } catch (error) 
        {
          console.error(`failure at getToken: ${error}`);
        }
    }else
      {
      /* Alert for invalid addresses  */
      return(alert("Your email address is invalid"));
      }
  }

  /* Function for getting blocks with pre-obtained token*/
  let getBlocks = async (token) => {
    try 
    {
      /* GET to API for obtaining blocks using axios.js */
      await axios.get(`/blocks?token=${token}`)
      .then((response) => {
      /* Due to reciving large chunk of data, value assignment may be incomplete due to async function - needed timeout in case of internet quality issues - 2s timeout*/
        setTimeout(() => {
          let blockArray = response.data.data
          console.log(blockArray)
          setBlocks(blockArray)
          /* Need for enabling Check button if getBlocks response 200 */
          setDisable(false)
        }, 200);
      })
    } catch (error) 
      {
        console.error(`failure at getBlocks: ${error}`);
      }
  }

  /* Function for /check? endpoint */
  let checkBlocks = async (token, blocks)=> {

    let genesisBlock = blocks[0];
    let antiGenesis = arraySorter(blocks, blocks[0])

    /* FLAGS FOR BLOCKS */
    console.log(`Genesis:${genesisBlock}`);
    console.log(`antiGenesis:${antiGenesis}`);

    let orderValidated = [];
    orderValidated.push(genesisBlock);
    console.log(`order validated at first: ${orderValidated}`);
      try {
        let validated = false;
        let order = 0;
        while(validated === false){
          for (let index = 0; index < antiGenesis.length; index++) 
          {
            let data = JSON.stringify({
              "blocks": [
                orderValidated[order],
                antiGenesis[index]
              ]
            });

            /* BLOCKS TO CHECK */
            console.log(`Pair of block being checked: ${data}`);
          
            /* POST to API for checking pair of blocks using axios.js */
            let result = await axios({
             method: 'post',
             url: `/check?token=${token}`,
             headers: {'Content-Type': 'application/json'},
             data: data
            });

            /* Logs */
            console.log(`Pair of blocks checked result: ${result.data.message}`);
            
            /* Validate if /check message: true/flase */
            if(result.data.message)
            {
              /* Insert into already validated blocks the found one */
              orderValidated.push(antiGenesis[index]);
              /* Removing found value from antiGenesis blocks for less /check tries */
              antiGenesis = arraySorter(antiGenesis, antiGenesis[index]);
              /* Increment on order variable for checking following blocks on /check endpoint */
              order++;
            }
          /* Saving one unnecessary loop and API POST discarding last value on antiGenesis*/
          if(orderValidated.length === 8)
            {
              orderValidated.push(antiGenesis[0]);
              validated=true;
            }
          }
        }
        console.log(`Orden validado encontrado! ${orderValidated}`);
        setValidatedOrder(orderValidated)
        return orderValidated;
      } catch (error) {
        console.error(`checkBlockError: ${error}`);
      }
  }

  let arraySorter = (array, value) => {
    return array.filter((element) => {
      return element !== value;
    });
  };

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
        <div className='infoImages'>
          <a href='https://docs.google.com/document/d/19swkIiCr9MM6vhdyWY4xk3iMlXhFZxJmcqGgzYHj6Ok/edit' target="_blank"><img className='infoLogos' alt='rules' src={rules}></img></a>
          <a href='https://github.com/pedroslev/rooftop-challenge' target="_blank"><img className='infoLogos' alt='repository' src={repository}></img></a>
          <a href='https://www.linkedin.com/in/pedrolopezslevin/' target="_blank"><img className='infoLogos' alt='linkedin' src={linkedin}></img></a>
          <a href='https://github.com/pedroslev' target="_blank"><img className='infoLogos' alt='github' src={github}></img></a>
        </div>
      </Navbar>

      {/* MENU */}
      <Container fluid className='flexMenu'>
          <Row>

            {/* INPUT AND OPERATIONS */}
            <Col className='colMenu' sm={4}>

            {/* MAIL INPUT */}
            <div className='emailDiv'>
            <h6> Please insert your email</h6>
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

              {/* BLOCK CHECK PETITION BUTTON */}
              <div className='buttonSubmitters'>
              <Button variant="success" disabled={disable} onClick={() => checkBlocks(Token, Blocks)}>Check</Button>
              </div>
            </Col>

            {/* DASHBORAD */}
            <Col className='colMenu' sm={8}>

              <div className='dataViewers'>
                <h4>Token:</h4>
                <p id='token' name='token'></p>
              </div>

              <div className='dataViewers'>
                <h4>Blocks:</h4>
                <ol>
                {
                  Object.values(Blocks).map((hash) => {
                      return <li>{hash}</li>
                  })
                }
                </ol>
              </div>

              <div className='dataViewers'>
                  <h4>Correct order:</h4>
                  <ol>
                {
                  validatedOrder.map((orderedHash) => {
                      return <li>{orderedHash}</li>
                  })
                }
                </ol>
              </div>
            </Col>
          </Row>
      </Container>
    </div>
  );
}

export default App;