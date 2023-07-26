const socket = io();

const table = document.getElementById("ProductTable");

document.getElementById("Btn").addEventListener("click", () => {
  const body = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    price: document.getElementById("price").value,
    code: document.getElementById("code").value,
    stock: document.getElementById("stock").value,
    category: document.getElementById("category").value,
  };
  fetch("/api/products", {
    method: "post",
    body: JSON.stringify(body),
    headers: {
      "Content-type": "application/json",
    },
  })
    .then((result) => result.json())
    .then((result) => {
      if (result.status === "error") throw new Error(result.error);
    })
    .then(() => fetch("/api/products"))
    .then((result) => result.json())
    .then((result) => {
      if (result.status === "error") throw new Error(result.error);
      socket.emit("productList", result.payload);
      alert("Producto Agregado con éxito!");
      document.getElementById("title").value = "";
      document.getElementById("description").value = "";
      document.getElementById("price").value = "";
      document.getElementById("code").value = "";
      document.getElementById("stock").value = "";
      document.getElementById("category").value = "";
    })
    .catch((err) => alert(`Ocurrió un error :(\n${err}`));
});

deleteProduct = (id) => {
  console.log(id)
  fetch(`/api/products/${id}`, {
    method: "delete",
  })
    .then((result) => result.json())
    .then((result) => {
      if (result.status === "error") throw new Error(result.error);
      socket.emit("productList", result.payload);
      alert("Producto Eliminado con éxito!");
    })
    .catch((err) => alert(`Ocurrió un error :(\n${err}`));
};

socket.on("updatedProducts", data => {
    table.innerHTML =
    `<tr>
            <td></td>
            <td><strong>Producto</strong></td>
            <td><strong></strong></td>
            <td><strong></strong></td>
            <td><strong></strong></td>
            <td><strong></strong></td>
            <td><strong></strong></td>
    </tr>`

})
