# Rooftop Challenge

This challenge consist on obtaining a token via API request (GET) using an email 
address as parameter. When obtaining this token, we are able to obtain a so called
"blocks" data using our token as parameter. This blocks data consist on eight values
of unkown generated pattern. But there is a twist, blocks obtained are unordered
except for the first one on position zero. The objective is ordering this blocks
validating by pairs or full concatenated string of block valuesusing the endpoint
 /check of out API, starting off the first value that we already know its ordered.

 

## Demo

- #### Heroku: https://rooftop-challenge-pls.herokuapp.com/
- #### VSCode Online: https://github1s.com/pedroslev/rooftop-challenge
- #### Deploy locally using docker(only WSL or Linux server/desktop):

#### Required:
 - docker: https://docs.docker.com/engine/install/
 - docker-compose: https://docs.docker.com/compose/install/
```bash
git clone https://github.com/pedroslev/rooftop-challenge.git
cd rooftop-challenge
sudo ./build.sh
sudo ./deploy.sh
```
This will run a detached container where deployed, binding port 8080
If you want to stop the container just run 'sudo ./stop.sh'
## Logic solution

### Obtaining token when clicking on submit email button
This is a get request using axios, parameters as email are given on submit retrieved
on an input. Token obtained is stored on a useState React variable
```javascript
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
```

### Obtaining blocks when clicking on 'Get blocks' button
This is a get request using axios, parameters as token are given on submit retrieved
on a useState React variable. Blocks obtained are also stored on a useState React 
variable
```javascript
let getBlocks = async (token) => {
    try 
    {
      /* GET to API for obtaining blocks using axios.js */
      await axios.get(`/blocks?token=${token}`)
      .then((response) => {
      /* Due to reciving large chunk of data, value assignment may be incomplete due to async function - needed timeout in case of internet quality issues - 2s timeout*/
        setTimeout(() => {
          let blockArray = response.data.data
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
```

### Checking blocks when clicking on 'Check' button
This was the actual challenge. Fist started to separate the first block that was
already sorted from the unsorted ones (genesis and antiGenesis blocks). Then created
an auxiliar array to store the sorted blocks(orderValidated). Did a while loop and
for loop, first one to recurse orderValidated and loop for antiGenesis. While on for
loop pair of blocks data its created, this gets to compare first ordered one with 
every other unordered blocks and validating it on /check endpoint. When the sequence
is found, that value is deleted from antiGenesis with the purpose of saving computational
process. Also, if there is only one value on antiGenesis this one is not validated
by the API and its pushed into orderValidated by discard.
```javascript
let checkBlocks = async (blocks)=> {
    /* First block called Genesis */
    let genesisBlock = blocks[0];
    /* other blocks that aren't Genesis :) */
    let antiGenesis = arraySorter(blocks, blocks[0])
    /* Array containing already order validated blocks w/ its pattern */
    let orderValidated = [];
    orderValidated.push(genesisBlock);
      try {
          /* bool needed to exit while loop */
        let validated = false;
        /* index for orderValidated array */
        let order = 0;
        while(validated === false){
          for (let index = 0; index < antiGenesis.length; index++) 
          {
            /* block chain being constructed */
            let data = JSON.stringify({
              "blocks": [
                orderValidated[order],
                antiGenesis[index]
              ]
            });
          
            /* POST to API for checking pair of blocks using axios.js */
            let result = await axios({
             method: 'post',
             url: `/check?token=${Token}`,
             headers: {'Content-Type': 'application/json'},
             data: data
            });

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
        setValidatedOrder(orderValidated)
      } catch (error) {
        console.error(`checkBlockError: ${error}`);
      }
  }
```

### Simple extra function used
It just deletes the sequence found on antiGenesis for saving loops. Its used on checkBlocks()
```javascript
let arraySorter = (array, value) => {
    return array.filter((element) => {
      return element !== value;
    });
  };
```
## Tech Stack

- **REACTJS** <img src='https://img.icons8.com/ultraviolet/344/react--v2.png' alt='REACTJS' height='40'>
- **JS** <img src='https://img.icons8.com/color/344/javascript--v1.png' alt='JS' height='40'>
- **HTML CSS** <img src='https://img.icons8.com/external-flaticons-lineal-color-flat-icons/344/external-html-media-agency-flaticons-lineal-color-flat-icons.png' alt='HTML CSS' height='40'>
- **BASH SCRIPTING** <img src='https://img.icons8.com/plasticine/344/bash.png' alt='BASH' height='40'>
- **DOCKER** <img src='https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png' alt='DOCKER' height='40'>


## API Reference

#### Get token

```http
  GET /token?email=usuario@gmail.com
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `varchar` | **Required**. Any email that has regex of existing one |

Response Example: {"token": "38772cdc-4720-4de4-9251-9a637e174fa8"}

#### Get blocks

```http
  GET /blocks
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token`      | `varchar` | **Required**. token obtained before on /token endpoint |



#### Check order of blocks

```http
  POST /check
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `token`      | `varchar` | **Required**. token obtained before on /token endpoint |

You can send either 'blocks' or 'encoded' object for validation. Only difference
is that blocks validates just a chain of two values of blocks and encoded validates
the whole eight blocks concatenated
| Data | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `blocks`      | `varchar` | {"blocks" : ["block0","block1"]}|
| `encoded`      | `varchar` |{"encoded" : "block0block1block2..block8"}|

## Authors

- [@pedroslev](https://github.com/pedroslev)

