$(document).ready(() => {
  // get client token
  $.ajax({
    url: "/client_token",
    success: (result) => {
      let CLIENT_TOKEN_FROM_SERVER = result;

      // create a dropin instance
      braintree.dropin.create({
        container: '#dropin-container',
        authorization: CLIENT_TOKEN_FROM_SERVER
      }, (error, dropinInstance) => {
        // dropinInstance usage
        if (error) console.error(error);

        $("#checkout-btn").on("click", (event) => {
          const form = document.getElementById('payment-form');
          dropinInstance.requestPaymentMethod((error, payload) => {
            if (error) console.error(error);

            // get a payment method nonce for the user's selected payment method, add
            // it a the hidden field before submitting the complete form to a server-side integration  
            $.ajax({
              type: "post",
              url: "/checkout",
              data: {
                payment_method_nonce: payload.nonce,
                amount: getUrlParameter("amount"),
                firstname: $("#firstname").val(),
                lastname: $("#lastname").val(),
                email: $("#email").val(),
                country: $("#country").val(),
                state: $("#state-province").val(),
                addr1: $("#addr1").val(),
                addr2: $("#addr2").val(),
                postal: $("#postal").val()
              }, 
              success: (checkoutResult) => {
                let msgContent = $("#payment-msg");
                msgContent.find("h2").text(checkoutResult.status);
                msgContent.find("div.content").text(checkoutResult.message);
                msgContent.show();
              }
            });
            
          }); // end of req payment method
        });// end of checkout btn click

      }); // end of braintree dropin create

    } // end of success

  }); // end of ajax

}); // end of document rdy