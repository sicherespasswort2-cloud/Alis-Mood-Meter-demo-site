const productDialog = document.getElementById("product-dialog");
const preorderButton = document.getElementById("preorder-button");
const dialogClose = document.getElementById("dialog-close");
const dialogConfirm = document.getElementById("dialog-confirm");

preorderButton.addEventListener("click", () => productDialog.showModal());
dialogClose.addEventListener("click", () => productDialog.close());
dialogConfirm.addEventListener("click", () => productDialog.close());
