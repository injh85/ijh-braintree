/*
* Custom Actions
*/

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

var ShoppingCart = (function() {
  // Initialize session storage to store cart information
  let _initCart = function() {
    if (!sessionStorage.getItem("cart")) {
      _resetCart();
    }  
  };
  
  let _resetCart = function() {
    sessionStorage.setItem("cart", JSON.stringify({"list":[]}));
  }
  
  // Retrieve and compute the shopping cart information
  let _retrieveCart = function() {
    let shoppingCart = {
      "list": [],
      "total": 0
    };
    
    // compute total
    let session = JSON.parse(sessionStorage.getItem("cart"));
    for(let i = 0; i < session.list.length; i++) {
      let unitPrice = session.list[i].price; 
      let qty = session.list[i].qty;
      let subTotal = qty * unitPrice;
      
      shoppingCart.list.push({
        "sku": session.list[i].sku,
        "qty": qty,
        "displayName": session.list[i].displayName,
        "displayImg": session.list[i].displayImg,
        "unitPrice": unitPrice,
        "subtotal": subTotal
      });
      
      shoppingCart.total += subTotal;
    }
    
    return shoppingCart;
  };
  
  // Add to cart
  let _addCart = function(product) {
    let cart = JSON.parse(sessionStorage.getItem("cart"));
    
    let isAdded = false;
    
    for(let i = 0; i < cart.list.length; i++) {
      if (cart.list[i].sku === product.sku) {
        cart.list[i].qty += product.qty
        isAdded = true;
        break;
      }
    }
    
    if (!isAdded) {
      cart.list.push(product);
    }
    
    sessionStorage.setItem("cart", JSON.stringify(cart));
      
    console.log(cart.list);  
  };
  
  // UI: Refresh Shopping Cart UI
  let _refreshCartUI = function() {
    let shoppingCart = _retrieveCart();
    
    if(shoppingCart.list.length > 0) {
      // There is something in the cart
      
      // Update Icon/badge
      $(".total-count").text(shoppingCart.list.length);
      $(".total-count").show();
      
      // Update Shopping List
      $(".total-items").text(shoppingCart.list.length + " Items");
      $(".total-amount").text("$" + shoppingCart.total);
      $(".shopping-list").empty(); // reset
      for(let i = 0; i < shoppingCart.list.length; i++) {
        $(".shopping-list").append('<li>' + 
                                   '<a href="#" class="remove" title="Remove this item"><i class="fa fa-remove"></i></a>' + 
                                   '<a class="cart-img" href="#"><img src="https://via.placeholder.com/70x70" alt="#"></a>' +
                                   '<h4><a href="#">' + shoppingCart.list[i].displayName + '</a></h4>' + 
                                   '<p class="quantity">' + shoppingCart.list[i].qty + 'x - <span class="amount">$' + shoppingCart.list[i].subtotal + '</span></p>' + 
                                  '</li>');
      }
      $(".shopping-item").show();
    } else {
      $(".total-count").hide();
      $(".shopping-item").hide();
    }
  };
  
  // UI: Display items in checkout page
  let _displayCartCheckoutUI = () => {
    let displayContainer = $("#checkout-cart-content");
    
    // do not show in a non checkout page
    if (!(displayContainer && displayContainer.length > 0))
      return;
    
    let shoppingCart = _retrieveCart();
    
    if(shoppingCart.list.length > 0) {
      for(let i = 0; i < shoppingCart.list.length; i++) {
        displayContainer.prepend('<li>' + shoppingCart.list[i].displayName + 
                                 ' x ' + shoppingCart.list[i].qty + 
                                 '<span>$' + shoppingCart.list[i].subtotal + '</span>' + 
                                 '</li>');
      }
    }
  };
  
  return {
    initCart: _initCart,
    resetCart: _resetCart,
    retrieveCart: _retrieveCart,
    addCart: _addCart,
    refreshCartUI: _refreshCartUI,
    displayCartCheckoutUI: _displayCartCheckoutUI
  };
})();

$(document).ready(function() {
  ShoppingCart.initCart();
  
  // UI: Display cart
  ShoppingCart.refreshCartUI();
  
  // UI: Display Shopping Cart Checkout
  ShoppingCart.displayCartCheckoutUI();
  
  // UI: Add to cart
  $('.product-action-2').off().on('click', function(event) {
    event.preventDefault;
      
    // get product details
    let product = {
      "sku": "", 
      "qty": 1, 
      "price": "",
      "displayName": "",
      "displayImg": ""
    };
    
    // .single-product
    let productNode = $(this).parent().parent().parent();
    product.sku = productNode.find(".product-price").data("sku");
    product.price = productNode.find(".product-price > span").text().replace("$", "");
    product.displayName = productNode.find(".product-content > h3 > a").text();
    product.displayImg = productNode.find(".default-img").attr("src");
    
    console.log(product);
    
    ShoppingCart.addCart(product);
    ShoppingCart.refreshCartUI();
  });
  
  // UI: Reset/Empty Cart
  $(".reset-cart").off().on("click", function(event) {
    event.preventDefault;
    ShoppingCart.resetCart();
    ShoppingCart.refreshCartUI();
  });
  
  // UI: Checkout Cart Btn
  $(".checkout-cart").off().on("click", function(event) {
    event.preventDefault;
    let shoppingCart = ShoppingCart.retrieveCart();
    location.href = 'checkout.html?amount=' + shoppingCart.total + '&currency=sgd';
  });
  
  // UI: Checkout page Cart total
  let shoppingCart = ShoppingCart.retrieveCart();
  $(".last > .total").text("$" + shoppingCart.total);
});