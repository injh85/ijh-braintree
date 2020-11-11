# Braintree POC

To add payment capability to a free templated e-commerce site with cabilities to:
1. Add to cart
2. Check out using Braintree DropIn UI
3. Empty cart

*Cart implementation uses browser local storage*

## To Operate
1. Navigate to [Homepage](https://jh-paypal-braintree.glitch.me/index.html)
2. Add item(s) to cart in the "Trending Item" section by hovering mouse on each product image
<img src="https://cdn.glitch.com/944a86a0-5dd9-430b-a03a-6a189cf0f69d%2FScreenshot%202020-04-26%20at%207.14.37%20PM.png?v=1587899709694" width="300px" />
3. Hover on shopping cart icon on the top right corner to view the cart, check out or empty shopping cart
<img src="https://cdn.glitch.com/944a86a0-5dd9-430b-a03a-6a189cf0f69d%2FScreenshot%202020-04-26%20at%207.16.54%20PM.png?v=1587899842731" width="300px" />
4. Click on "CHECKOUT" button to navigate to the checkout page
5. Enter details and click on "PROCEED TO CHECKOUT" button
- list of test credit cards can be found [here](https://developers.braintreepayments.com/reference/general/testing/node)
- personal particulars e.g. name, emails are capbured as well
6. If payment is successful:
<img src="https://cdn.glitch.com/0c02bb32-db8c-4cda-95fa-b9e412478a62%2FScreenshot%202020-11-11%20at%209.30.13%20AM.png?v=1605058245715" width="300px" />

## How it works [^1]
<img src="https://cdn.glitch.com/0c02bb32-db8c-4cda-95fa-b9e412478a62%2FScreenshot%202020-11-11%20at%209.32.40%20AM.png?v=1605058387495" />


### Step 1
Your front-end requests a client token from your server and initializes the client SDK
1. Add client SDK to all pages (views/*.ejs)

```
<script src="https://js.braintreegateway.com/web/dropin/1.25.0/js/dropin.min.js"></script>

```

2. Add Drop-in UI widget to checkout page (views/checkout.ejs)

```
<div id="dropin-container" class="single-widget"></div>
```

3. Init Drop-in UI widget (public/payment.js)

```
braintree.dropin.create({
    container: '#dropin-container',
    authorization: CLIENT_TOKEN_FROM_SERVER
  }, (error, dropinInstance) => {
  }
});
```

4. Invoke request to get client token from page (public/payment.js)

```
$.ajax({
  url: "/client_token",
  ...
});
```

Reference

[Setup](https://developers.braintreepayments.com/start/hello-client/javascript/v3)


### Step 2
Your server generates and sends a client token back to your client using the server SDK.
1. Server side setup (server.js) 

```
const braintree = require("braintree");

// creates a gateway instance
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.MERCHANT_ID,
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY
});
```

Reference

[Install and configure](https://developers.braintreepayments.com/start/hello-server/node)

2. Implement server side to handle get client token (server.js)

```
app.get("/client_token", (req, res) => {
  ...
  gateway.clientToken.generate(custObj, (err, response) => {
    // pass client token back
    res.send(response.clientToken);
  });
});
```

Reference

[Send a client token to your client](https://developers.braintreepayments.com/start/hello-server/node)

### Step 3
The customer submits payment information, the client SDK communicates that information to Braintree and returns a payment method nonce.
1. Invoke from page (public/payment.js)

```
braintree.dropin.create({
    container: '#dropin-container',
    authorization: CLIENT_TOKEN_FROM_SERVER
  }, (error, dropinInstance) => {
    ...
    dropinInstance.requestPaymentMethod((error, payload) => {
      ...
    });
    ...
  }
});
```

Reference

[Send payment method nonce to server](https://developers.braintreepayments.com/start/hello-client/javascript/v3)


### Step 4
Your front-end sends the payment method nonce to your server.
1. Invoke from page (public/payment.js)

```
$.ajax({
    type: "post",
    url: "/checkout",
    ...
});
```

### Step 5
Your server code receives the payment method nonce and then uses the server SDK to create a transaction.
1. Implement server side to handle request to check out (server.js)

```
app.post("/checkout", (req, res) => {
  ...
  
  // create transaction
  gateway.transaction.sale({
    ...
  });
});
```

Reference

[Receive a payment method nonce from your client & Create a transaction](https://developers.braintreepayments.com/start/hello-server/node)


[^1]: https://developers.braintreepayments.com/start/overview