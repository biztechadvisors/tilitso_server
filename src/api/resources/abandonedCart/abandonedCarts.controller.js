const { db } = require('../../../models');
const mailer = require('../../../mailer');
const { keys } = require('joi/lib/types/object');
// const types = require('mysql2').constants.types;
const { response } = require('express');
const { Op } = require("sequelize");
const cron = require('node-cron');

// ----------------------------------------------------
async function abandonedCartInsert(req, res, next) {
  try {
    // Extract the relevant data from the request body using destructuring
    const { customer_id, email, phone, cart } = req.body;

    // Check if email is null or undefined
    if (email === null || email === undefined) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const cartItems = Object.values(cart);
    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Check if the email already exists in the carts table
    if (!db || !db.carts || typeof db.carts.findOne !== 'function') {
      return res.status(500).json({ message: 'Internal server error' });
    }

    const existingCart = await db.carts.findOne({ where: { email } });

    if (existingCart) {
      // If the email already exists, get the existing cart data and merge it with the new cart data
      const existingCartData = JSON.parse(existingCart.cart_data);
      const mergedCartData = mergeCarts(existingCartData, cart);

      // Update the existing cart with the merged cart data
      await db.carts.update(
        {
          cart_data: JSON.stringify(mergedCartData),
          cart_quantity: existingCart.cart_quantity + totalQuantity,
        },
        { where: { email } }
      );
    } else {
      // If the email doesn't exist, create a new abandoned cart record
      await db.carts.create({
        customer_id,
        email,
        phone,
        cart_data: JSON.stringify(cart),
        cart_quantity: totalQuantity,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper function to merge two carts
function mergeCarts(existingCart, newCart) {
  const mergedCart = { ...existingCart };
  Object.entries(newCart).forEach(([productId, productData]) => {
    if (!mergedCart[productId]) {
      mergedCart[productId] = productData;
    } else {
      mergedCart[productId].quantity += productData.quantity;
    }
  });
  return mergedCart;
}


// -----------------------------------------------

async function getAbandonedCartCount(req, res, next) {
  try {
    // Extract the relevant data from the request parameters and query using destructuring
    const { email } = req.query;

    // Check if the email already exists in the carts table
    if (!db || !db.carts || typeof db.carts.findOne !== 'function') {
      return res.status(500).json({ message: 'Internal server error' });
    }

    const existingCart = await db.carts.findOne({ where: { email } });

    if (existingCart) {
      // If the email already exists, get the existing cart data and return the products with their count
      let existingCartData = {};

      try {
        existingCartData = JSON.parse(existingCart.cart_data);
      } catch (err) {
        console.error(`Error parsing cart data: ${err.message}`);
        return res.status(500).json({ message: 'Internal server error' });
      }

      let products = [];
      let totalCount = 0;

      for (const key in existingCartData) {
        const product = existingCartData[key];
        products.push(product);
        totalCount += product.quantity;
      }

      return res.status(200).json({ success: true, products, totalCount });
    } else {
      // If the email doesn't exist, return an error message
      return res.status(400).json({ message: 'Cart not found for the given email' });
    }
  } catch (error) {
    console.error(error);
    next(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


// ----------------------------------------------------
async function removeProductFromCart(req, res, next) {
  try {
    const { itemId } = req.params;
    const { email, quantity } = req.query;
    // console.log("Ram", itemId, email, quantity)

    if (!db || !db.carts || typeof db.carts.findOne !== 'function') {
      return res.status(500).json({ message: 'Internal server error' });
    }

    const existingCart = await db.carts.findOne({ where: { email } });

    if (!existingCart) {
      return res.status(400).json({ message: 'Cart not found for the given email' });
    }

    let existingCartData = {};
    try {
      existingCartData = JSON.parse(existingCart.cart_data);
    } catch (err) {
      console.error(`Error parsing cart data: ${err.message}`);
      return res.status(500).json({ message: 'Internal server error' });
    }

    let itemRemoved = false;
    let cartQuantity = existingCart.cart_quantity;

    if (quantity) {
      for (let i = 0; i < quantity; i++) {
        if (existingCartData[itemId]) {
          if (existingCartData[itemId].quantity > 1) {
            existingCartData[itemId].quantity -= 1;
            cartQuantity -= 1;
            // console.log("Quantity", quantity)
          } else {
            delete existingCartData[itemId];
            cartQuantity -= 1;
          }
          itemRemoved = true;
        }
      }
    }

    if (!quantity) {
      if (existingCartData[itemId]) {
        if (existingCartData[itemId].quantity > 1) {
          existingCartData[itemId].quantity -= 1;
          cartQuantity -= 1;
          // console.log("Quantity", quantity)
        } else {
          delete existingCartData[itemId];
          cartQuantity -= 1;
        }
        itemRemoved = true;
      }
    }

    // console.log(cartQuantity, "cartQuantity")

    if (!itemRemoved) {
      return res.status(400).json({ message: 'Item not found in cart' });
    }

    await db.carts.update(
      {
        cart_data: JSON.stringify(existingCartData),
        cart_quantity: cartQuantity,
      },
      { where: { email } }
    );

    // console.log("Sita")
    return res.status(200).json({ success: true, existingCartData });
  } catch (error) {
    console.error(error);
    next(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// -------------------------------------------------------
async function sendAbandonedCartReminder() {
  try {
    // retrieve abandoned cart data from database
    const abandonedCartData = await db.carts.findAll({
      where: {
        updated_at: {
          [Op.lte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // cart updated more than 24 hours ago
        }
      }
    });
    // loop through abandoned cart data and send email for each cart
    for (const cart of abandonedCartData) {
      const products = JSON.parse(cart.cart_data);
      const email = cart.email;
      // console.log("=============", products)
      const res = mailer.sendAbandonedCartEmail(email, products);
    }
    console.log('Abandoned cart reminder emails sent successfully');
  } catch (error) {
    console.error(error);
    console.log('Failed to send abandoned cart reminder emails');
  }
}
cron.schedule('0 16 * * *', sendAbandonedCartReminder);

// ********************* WishList *******************//

async function abandonedWishListInsert(req, res, next) {
  try {
    // Extract the relevant data from the request body using destructuring
    const { customer_id, email, phone, cart } = req.body;
    // Check if email is null or undefined
    if (email === null || email === undefined) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const cartItems = Object.values(cart);
    const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    // Check if the email already exists in the carts table
    if (!db || !db.carts || typeof db.carts.findOne !== 'function') {
      return res.status(500).json({ message: 'Internal server error' });
    }
    const existingCart = await db.wishlist.findOne({ where: { email } });
    if (existingCart) {
      // If the email already exists, get the existing cart data and merge it with the new cart data
      const existingCartData = JSON.parse(existingCart.cart_data);
      const mergedCartData = mergeCarts(existingCartData, cart);
      // Update the existing cart with the merged cart data
      await db.wishlist.update(
        {
          cart_data: JSON.stringify(mergedCartData),
          cart_quantity: existingCart.cart_quantity + totalQuantity,
        },
        { where: { email } }
      );
    } else {
      // If the email doesn't exist, create a new abandoned cart record
      await db.wishlist.create({
        customer_id,
        email,
        phone,
        cart_data: JSON.stringify(cart),
        cart_quantity: totalQuantity,
      });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    next(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
// ------------WishListCount---------

async function getAbandonedWishListCount(req, res, next) {
  try {
    // Extract the relevant data from the request parameters and query using destructuring
    const { email } = req.query;

    // Check if the email already exists in the carts table
    if (!db || !db.carts || typeof db.wishlist.findOne !== 'function') {
      return res.status(500).json({ message: 'Internal server error' });
    }

    const existingCart = await db.wishlist.findOne({ where: { email } });

    if (existingCart) {
      // If the email already exists, get the existing cart data and return the products with their count
      let existingCartData = {};

      try {
        existingCartData = JSON.parse(existingCart.cart_data);
      } catch (err) {
        console.error(`Error parsing cart data: ${err.message}`);
        return res.status(500).json({ message: 'Internal server error' });
      }

      let products = [];
      let totalCount = 0;

      for (const key in existingCartData) {
        const product = existingCartData[key];
        products.push(product);
        totalCount += product.quantity;
      }

      return res.status(200).json({ success: true, products, totalCount });
    } else {
      // If the email doesn't exist, return an error message
      return res.status(400).json({ message: 'Cart not found for the given email' });
    }
  } catch (error) {
    console.error(error);
    next(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// ----------------------------------------------------
async function removeProductFromWishList(req, res, next) {
  try {
    // Extract the relevant data from the request parameters and query using destructuring
    const { itemId } = req.params;
    const { email } = req.query;
    // Check if the email already exists in the carts table
    if (!db || !db.carts || typeof db.wishlist.findOne !== 'function') {
      return res.status(500).json({ message: 'Internal server error' });
    }
    const existingCart = await db.wishlist.findOne({ where: { email } });
    if (existingCart) {
      // If the email already exists, get the existing cart data and remove the products by their itemIds
      let existingCartData = {};
      try {
        existingCartData = JSON.parse(existingCart.cart_data);
        // console.log("ram", existingCartData)
      } catch (err) {
        console.error(`Error parsing cart data: ${err.message}`);
        return res.status(500).json({ message: 'Internal server error' });
      }
      // const cart = existingCartData.cart || {}; // Define cart outside of the block
      let itemRemoved = false;
      let cartQuantity = existingCart.cart_quantity;

      for (const key in existingCartData) {
        if (key === itemId) {
          if (existingCartData[key].quantity > 1) {
            // console.log("key", key)
            existingCartData[key].quantity -= 1;
            cartQuantity -= 1;
          } else {
            delete existingCartData[key];
            cartQuantity -= 1;
          }
          itemRemoved = true;
          break; // Exit the loop after finding and processing the item
        }
      }

      if (!itemRemoved) {
        return res.status(400).json({ message: 'Item not found in cart' });
      }
      // Update the existing cart with the updated cart data
      await db.wishlist.update(
        {
          cart_data: JSON.stringify(existingCartData),
          cart_quantity: cartQuantity,
        },
        { where: { email } }
      );
      return res.status(200).json({ success: true, existingCartData }); // return the updated cart data in the response
    } else {
      // If the email doesn't exist, return an error message
      return res.status(400).json({ message: 'Cart not found for the given email' });
    }
  } catch (error) {
    console.error(error);
    next(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
// -----Abonedoned-WishList------ //
async function sendAbandonedWishListReminder() {
  try {
    // retrieve abandoned cart data from database
    const abandonedCartData = await db.wishlist.findAll({
      where: {
        updated_at: {
          [Op.lte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // cart updated more than 24 hours ago
        }
      }
    });
    // loop through abandoned cart data and send email for each cart
    for (const cart of abandonedCartData) {
      const products = JSON.parse(cart.cart_data);
      const email = cart.email;
      // console.log("=============", products)
      const res = mailer.sendAbandonedCartEmail(email, products);
    }
    console.log('Abandoned wishlist reminder emails sent successfully');
  } catch (error) {
    console.error(error);
    console.log('Failed to send abandoned wishlist reminder emails');
  }
}

cron.schedule('0 16 * * *', sendAbandonedWishListReminder);


async function clearCart(req, res, next) {
  try {
    const updatedRows = await db.carts.update(
      { cart_data: "{}", cart_quantity: null },
      { where: { email: req.query.email } }
    );

    if (updatedRows > 0) {
      return res.status(200).json({ success: true, message: 'Cart cleared successfully' });
    } else {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
  } catch (error) {
    console.error(error);  // Log the error for debugging purposes
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function clearWishlist(req, res, next) {
  try {
    const updatedRows = await db.wishlist.update(
      { cart_data: "{}", cart_quantity: null },
      { where: { email: req.query.email } }
    );

    if (updatedRows > 0) {
      return res.status(200).json({ success: true, message: 'WishList cleared successfully' });
    } else {
      return res.status(404).json({ success: false, message: 'WishList not found' });
    }
  } catch (error) {
    console.error(error);  // Log the error for debugging purposes
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}


module.exports = {
  abandonedCartInsert,
  getAbandonedCartCount,
  sendAbandonedCartReminder,
  removeProductFromCart,
  clearCart,

  abandonedWishListInsert,
  getAbandonedWishListCount,
  removeProductFromWishList,
  sendAbandonedWishListReminder,
  clearWishlist
};

