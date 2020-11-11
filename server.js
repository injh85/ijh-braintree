const express = require("express");
const app = express();
const ejs = require("ejs");
const braintree = require("braintree");
const bodyParser = require('body-parser');

// creates a gateway instance
// https://developers.braintreepayments.com/start/hello-server/node
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.MERCHANT_ID,
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY
});

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(express.json());

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// set the view engine to ejs
app.set('view engine', 'ejs');

// ------------------------ PAGE ------------------------------

// PAGE: Home
// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.render(__dirname + '/views/index');
});

// PAGE: Home
app.get("/index.html", (request, response) => {
  response.render(__dirname + '/views/index');
});

// PAGE: Checkout
app.get("/checkout.html", async (request, response) => {
  response.render(__dirname + '/views/checkout');
});

// ------------------------ REST ------------------------------

// REST: GET Client Token
app.get("/client_token", (req, res) => {
  let custObj = {
    customerId: ""
  }
  
  // check for customer id in request
  if (req.query.cid && req.query.cid.length > 0) {
    custObj.customerId = req.query.cid;
  } else {
    custObj = {};
  }
  
  gateway.clientToken.generate(custObj, (err, response) => {
    // pass client token back
    res.send(response.clientToken);
  });
});

// REST: Checkout
app.post("/checkout", (req, res) => {
  const nonceFromTheClient = req.body.payment_method_nonce;
  let amount = req.body.amount;
  let firstname = req.body.firstname;
  let lastname = req.body.lastname;
  let email = req.body.email;
  let country = req.body.country;
  let state = req.body.state;
  let addr1 = req.body.addr1;
  let addr2 = req.body.addr2;
  let postal = req.body.postal;
  
  console.log(req.body);
  
  // create transaction
  // https://developers.braintreepayments.com/reference/request/transaction/sale/node
  gateway.transaction.sale({
    amount: amount,
    paymentMethodNonce: nonceFromTheClient,
    
    customer: {
      firstName: firstname,
      lastName: lastname,
      email: email
    }, 
    
    billing: {
      countryCodeAlpha2: country,
      region: state,
      streetAddress: addr1,
      extendedAddress: addr2,
      postalCode: postal
    },
    
    // TODO: deviceData: deviceDataFromTheClient,
    options: {
      submitForSettlement: true
    }
  }, (err, result) => {
    res.setHeader('Content-Type', 'application/json');
    console.log(err);
    console.log(result);
    
    if (err) {
      res.end(JSON.stringify({
        "status": "unsuccessful",
        "message": "Error Occured. Please try again later."
      }));
    } else {
      res.end(JSON.stringify({
        "status": result.success === true ? "success" : "unsuccessful",
        "message": result.message
      }));
    }
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});