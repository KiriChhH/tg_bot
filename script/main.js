// site sripts //
function toNum(str) {
  const num = Number(str.replace(/ /g, ""));
  return num;
}

function toCurrency(num) {
  const format = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(num);
  return format;
}

const cardAddArr = Array.from(document.querySelectorAll(".card__add"));
const cartNum = document.querySelector("#cart_num");
const cart = document.querySelector("#cart");

class Cart {
  products;
  constructor() {
    this.products = [];
  }
  get count() {
    return this.products.length;
  }
  addProduct(product) {
    this.products.push(product);
  }
  removeProduct(index) {
    this.products.splice(index, 1);
  }

  get cost() {
    const prices = this.products.map((product) => {
      return toNum(product.price);
    });
    const sum = prices.reduce((acc, num) => {
      return acc + num;
    }, 0);
    return sum;
  }
}

class Product {
  imageSrc;
  name;
  price;
  constructor(card) {
    this.imageSrc = card.querySelector(".card__img").children[0].src;
    this.name = card.querySelector(".card__title").innerText;
    this.price = card.querySelector(".card__price").innerText;
  }
}

const myCart = new Cart();

if (localStorage.getItem("cart") == null) {
  localStorage.setItem("cart", JSON.stringify(myCart));
}

const savedCart = JSON.parse(localStorage.getItem("cart"));
myCart.products = savedCart.products;
cartNum.textContent = myCart.count;

myCart.products = cardAddArr.forEach((cardAdd) => {
  cardAdd.addEventListener("click", (e) => {
    e.preventDefault();
    const card = e.target.closest(".card");
    const product = new Product(card);
    const savedCart = JSON.parse(localStorage.getItem("cart"));
    myCart.products = savedCart.products;
    myCart.addProduct(product);
    localStorage.setItem("cart", JSON.stringify(myCart));
    cartNum.textContent = myCart.count;
  });
});

const popup = document.querySelector(".popup");
const popupClose = document.querySelector("#popup_close");
const body = document.body;
const popupContainer = document.querySelector("#popup_container");
const popupProductList = document.querySelector("#popup_product_list");
const popupCost = document.querySelector("#popup_cost");



cart.addEventListener("click", (e) => {
  e.preventDefault();
  popup.classList.add("popup--open");
  body.classList.add("lock");
  order = popupContainerFill();
});


function popupContainerFill() {
  popupProductList.innerHTML = null;
  const savedCart = JSON.parse(localStorage.getItem("cart"));
  myCart.products = savedCart.products;
  const productsHTML = myCart.products.map((product) => {
    const productItem = document.createElement("div");
    productItem.classList.add("popup__product");

    const productWrap1 = document.createElement("div");
    productWrap1.classList.add("popup__product-wrap");
    const productWrap2 = document.createElement("div");
    productWrap2.classList.add("popup__product-wrap");

    const productImage = document.createElement("img");
    productImage.classList.add("popup__product-image");
    productImage.setAttribute("src", product.imageSrc);

    const productTitle = document.createElement("h2");
    productTitle.classList.add("popup__product-title");
    productTitle.innerHTML = product.name;

    const productPrice = document.createElement("div");
    productPrice.classList.add("popup__product-price");

    productPrice.innerHTML = toCurrency(toNum(product.price));;

    const productDelete = document.createElement("button");
    productDelete.classList.add("popup__product-delete");
    productDelete.innerHTML = "✖";

    productDelete.addEventListener("click", () => {
      myCart.removeProduct(product);
      localStorage.setItem("cart", JSON.stringify(myCart));
      popupContainerFill();
      cartNum.textContent = cartNum.textContent - 1;
    });

    productWrap1.appendChild(productImage);
    productWrap1.appendChild(productTitle);
    productWrap2.appendChild(productPrice);
    productWrap2.appendChild(productDelete);
    productItem.appendChild(productWrap1);
    productItem.appendChild(productWrap2);

    return productItem;
  });

  productsHTML.forEach((productHTML) => {
    popupProductList.appendChild(productHTML);
  });

  popupCost.value = myCart.cost;
  return popupCost.value
}

// tg_script //
let tg = window.Telegram.WebApp;
tg.expand();

tg.MainButton.setText = "Оформить заказ";

let btn_open = document.getElementById("order");
let btn_close = document.getElementById("popup_close")

btn_open.addEventListener('click', function(){ 
  tg.MainButton.show()
});

btn_close.addEventListener('click', function(){ 
  tg.MainButton.hide()
});

Telegram.WebApp.onEvent('mainButtonClicked', function(){
  tg.sendData(popupCost.value); 
});

