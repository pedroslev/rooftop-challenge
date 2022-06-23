const request = require('supertest')('https://rooftop-career-switch.herokuapp.com')
const expect = require('chai').expect
const faker = require('faker')

const axios = require('axios')
/* Axios config for URL */
axios.defaults.baseURL = 'https://rooftop-career-switch.herokuapp.com/';

/* nedeed to increase timeout of test due to http requests time elapsed */
jest.setTimeout(5000000)

let token;
let  blocks;

const emailGenerator = () => {
   let email = faker.internet.email()
   return email;
}

describe('API getting token with random generated email using faker test', () => {
  describe('GET', () => {
    it('expected 200 code and token', async () => {
      let email = emailGenerator()
      let response = await request.get(`/token?email=${email}`)
      expect(response).to.be.an('object')
      /* text has token */
      token = JSON.parse(response.text).token
      console.log(`token obtained for faked email ${email} : ${token}`)
      expect(response.text).to.be.an('string')
      expect(response.status).to.equal(200)
    })
  })
})


describe('API getting blocks with previous generated tokens using faker emails test', () => {
  describe('GET', () => {
    it('expected 200 code and blocks in return', async () => {
      let response = await request.get(`/blocks?token=${token}`)
      expect(response.status).to.eql(200)
      blocks = response.body.data
      console.log(`blocks obtained unordered: ${blocks}`)
      expect(blocks).to.be.an('array')
      expect(blocks).to.have.length(9)
      expect(response).to.be.an('object')
    })
  })
})



describe('Blocks generated ordered and checked on encoded option', () => {
  describe('POST', () => {
    it('expected 200 code and true message due to correct order', async () => {

      let genesisBlock = blocks[0];
      let antiGenesis = arraySorter(blocks, blocks[0])

      let orderValidated = [];
      orderValidated.push(genesisBlock);
      
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

              /* POST to API for checking pair of blocks using axios.js */
              let result = await axios({
              method: 'post',
              url: `/check?token=${token}`,
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

      let encodedCode = orderValidated.join('')
      let object = JSON.stringify({
        "encoded": encodedCode
      })
      let encodedCheck = await axios({
        method: 'post',
        url: `/check?token=${token}`,
        headers: {'Content-Type': 'application/json'},
        data: object
        });

      console.log(`full encoded string to check: ${object}`)

      expect(encodedCheck.status).to.eql(200)
      expect(encodedCheck.data.message).to.eql(true)
    })
  })
})

let arraySorter = (array, value) => {
  return array.filter((element) => {
    return element !== value;
  });
};