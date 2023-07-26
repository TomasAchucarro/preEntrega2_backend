import fs from "fs";
import { __dirname } from "../utils.js";

class ProductManager {
  #path;
  constructor(path) {
    this.#path = path;
  }

  getProducts = async () => {
    try {
      return JSON.parse(await fs.promises.readFile(this.#path, "utf-8"));
    } catch (error) {
      throw new Error("File doesnot exist");
    }
  };

  addProduct = async (
    title,
    description,
    price,
    thumbnails,
    code,
    stock,
    category,
  ) => {
    try {
      const products = await this.getProducts();

      const id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

      const newProduct = {
        id: id,
        title,
        description,
        price,
        thumbnails: thumbnails || [],
        code,
        stock,
        category,
        status: true,
      };

      products.push(newProduct);

      await fs.promises.writeFile(
        this.#path,
        JSON.stringify(products, null, "\t")
      );

      console.log("Product added");
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      return null;
    }
  };

  deleteProduct = async (id) => {
    try {
      let products = await this.getProducts();
      const deletedProduct = products.find((product) => product.id === id);
      products = products.filter((product) => product.id !== id);
      await fs.promises.writeFile(
        this.#path,
        JSON.stringify(products, null, "\t")
      );
      console.log("Product deleted");
      return deletedProduct;
    } catch (error) {
      throw new Error("Error deleting product:");
    }
  };

  updateProduct = async (id, updatedData) => {
    try {
      let products = await this.getProducts();

      const productIndex = products.findIndex((product) => product.id === id);

      if (productIndex !== -1) {
        products[productIndex] = {
          ...products[productIndex],
          ...updatedData,
        };
        await fs.promises.writeFile(
          this.#path,
          JSON.stringify(products, null, "\t")
        );
        console.log("Product updated");
        return true;
      } else {
        console.log("Product not found");
        return false;
      }
    } catch (error) {
      console.error("Error updating product:", error);
      return false;
    }
  };

  getProductById = async (id) => {
    try {
      const products = await this.getProducts();
      const product = products.find((product) => product.id === id);
      return product || null;
    } catch (error) {
      throw new Error("Error retrieving product:");
    }
  };
}

export const productManager = new ProductManager(`${__dirname}/api/products.json`);
