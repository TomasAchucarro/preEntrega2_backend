import fs from "fs";
import { __dirname } from "../utils.js";
import { productManager } from "./productManager.js";

class CartManager {
  #path;
  constructor(path) {
    this.#path = path;
    this.carts = [];
  }

  getCarts = async () => {
    try {
      return JSON.parse(await fs.promises.readFile(this.#path, "utf-8"));
    } catch (error) {
      throw new Error("File doesnot exist");
    }
  };

  getCartById = async (id) => {
    try {
      const carts = await this.getCarts();
      const cart = carts.find((cart) => cart.id === id);
      return cart || null;
    } catch (error) {
      throw new Error("Error retrieving cart");
    }
  };

  addCart = async (product = []) => {
    try {
      const carts = await this.getCarts();
      const id = carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
      const newCart = {
        id: id,
        product: product,
      };
      carts.push(newCart);
      await fs.promises.writeFile(
        this.#path,
        JSON.stringify(carts, null, "\t")
      );
      this.carts = carts;
      return newCart;
    } catch (error) {
      throw new Error("Error adding cart: ");
    }
  };

  addProductsToCart = async (cartId, productId) => {
    const products = productManager.getProductsById(productId);

    if (!products) {
      return `Error el producto con el id:${productId} no existe`;
    }

    let carts = await this.getCarts();

    const cart = await this.getCartsById(cartId);

    if (!cart) {
      return null;
    }

    const existingProduct = cart.products.find(
      (item) => item.product === productId
    );
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      const product = {
        product: productId,
        quantity: 1,
      };
      cart.products.push(product);
    }

    const cartIndex = carts.findIndex((item) => item.id === cartId);
    if (cartIndex !== -1) {
      carts[cartIndex] = cart;
    }

    await fs.promises.writeFile(this.#path, JSON.stringify(carts, null, "\t"));

    return cart;
  };
}

export const cartManager = new CartManager(`${__dirname}/api/cart.json`);
