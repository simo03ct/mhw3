const cartSidebar = document.querySelector("#cart_sidebar");
const cartButton = document.querySelector(".carrello");
const mobileCart = document.querySelector('.carrello_mobile');
const closeCart = document.querySelector(".close_cart");
const articleNumbers = document.querySelectorAll(".article");
const cartItemsContainer = document.querySelector(".cart_items");
const totalPrice = document.querySelector("#total_price");
const menuSidebar = document.querySelector("#menu_sidebar");
const menuButton = document.querySelector(".mobile_menu");
const closeMenu = document.querySelector(".close_menu");
const banner = document.querySelectorAll(".banner_container img");
const precButton = document.querySelector(".prec");
const succButton = document.querySelector(".succ");

const loginDesktop = document.querySelector(".login_desktop");
const loginMobile = document.querySelector(".login_mobile");

const clientID = "secret";
const clientSecret = "secret";
const redirectUri = "http://127.0.0.1:3000/mhw2.html";
const params = new URLSearchParams(window.location.search); //API che permette di leggere i parametri dell'url e ottenere il code per l'access token
const code = params.get("code"); 

const checkoutButton = document.querySelector(".checkout_button");

if(code) {
    getToken(code);
}
else {
    loginDesktop.addEventListener("click", redirectToSpotifyLogin);
    loginMobile.addEventListener("click", redirectToSpotifyLogin);
}

function redirectToSpotifyLogin() { //Necessaria per effettuare il login su Spotify e avere nome e immagine profilo
    const loginUrl = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = loginUrl;
}

function getToken(code) {
    if(code) {
        fetch("https://accounts.spotify.com/api/token", {
            method: "post",
            body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`,
            headers: {
                "Content-type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + btoa(clientID + ":" + clientSecret)
            }
        }).then(onTokenResponse).then(onTokenJson);
    }
}

function onTokenResponse(response) {
    return response.json();
}

function onTokenJson(json) {
    console.log(json);

    const token = json.access_token;
    getUserProfile(token);

    window.history.replaceState({}, document.title, redirectUri); //In questo modo se si ricarica la pagina si ritorna all'uri di partenza
}

function getUserProfile(token) { //Funzione per ottenere i dati dell'utente una volta ottenuto il token
    fetch("https://api.spotify.com/v1/me", {
        headers: {
            "Authorization" : "Bearer " + token
        }
    }).then(onProfileResponse).then(onProfileJson);
}

function onProfileResponse(response) {
    return response.json();
}

let currentUser = null;

function onProfileJson(json) { //Nella sezione relativa al login vengono mostrati nome e immagine dell'utente
    currentUser = json.display_name || json.id;

    if(json.display_name && json.images) {
        document.querySelector("#nome_profilo_desktop").textContent = currentUser;
        document.querySelector("#immagine_profilo_desktop").src = json.images[0].url;

        document.querySelector("#nome_profilo_mobile").textContent = currentUser;
        document.querySelector("#immagine_profilo_mobile").src = json.images[0].url;
    }

    loadCart();
}

let bannerIndex = 0;

function initialBanner () { //Viene mostrato il banner con indice 0
    if(banner.length > 0) {
        showBanner(bannerIndex);
    }
}

document.addEventListener("DOMContentLoaded", initialBanner); //Il banner viene caricato una volta caricato il DOM

function showBanner(index) {
    if (index >= banner.length) {
        bannerIndex = 0;
    }
    else if (index < 0) {
        bannerIndex = banner.length - 1;
    }

    for(let i=0; i<banner.length; i++) {
        banner[i].classList.remove("display_banner");
    }

    banner[bannerIndex].classList.add("display_banner");
}

function prevBanner() {
    bannerIndex--;
    showBanner(bannerIndex);
}

function nextBanner() {
    bannerIndex++;
    showBanner(bannerIndex);
}

if (precButton) {
    precButton.addEventListener('click', prevBanner);
}

if (succButton) {
    succButton.addEventListener('click', nextBanner);
}


function apriMenu() {
    menuSidebar.classList.add('open');
    menuSidebar.classList.remove('closed');
}

function chiudiMenu() {
    menuSidebar.classList.remove('open');
    menuSidebar.classList.add('closed');
}

menuButton.addEventListener('click', apriMenu);
closeMenu.addEventListener('click', chiudiMenu);

const cartItemsArray = [];

function apriCarrello() {
    cartSidebar.classList.add('open');
    cartSidebar.classList.remove('closed');
}

function chiudiCarrello() {
    cartSidebar.classList.remove('open');
    cartSidebar.classList.add('closed');
}


cartButton.addEventListener('click', apriCarrello);
mobileCart.addEventListener('click', apriCarrello);
closeCart.addEventListener('click', chiudiCarrello);

const searchBar = document.querySelector("#search_bar");
const searchButton = document.querySelector(".search_container");
const categorie = document.querySelector(".categorie");

function openSearchBar(event) {
    searchBar.classList.remove("hidden");
    searchButton.classList.add("hidden");
    categorie.classList.add("hidden");

    event.stopPropagation();
}

function closeSearchBar(event) { 
    if (!searchBar.contains(event.target)) { //In questo modo se si clicca al di fuori della barra di ricerca questa viene nascosta
        searchBar.classList.add("hidden");
        searchButton.classList.remove("hidden");
        categorie.classList.remove("hidden");
    }
}

searchButton.addEventListener('click', openSearchBar);

document.addEventListener('click', closeSearchBar);

function removeItemCart(event) {
    const cartItem = event.target.closest('.cart_item');
    const id = cartItem.id;
    const index = cartItemsArray.indexOf(id);

    if(index !== -1) {
        cartItemsArray.splice(index, 1);
    }

    cartItem.remove();
    updateTotalPrice();
}

function updateQuantity(id, number) { //Funzione per aggiornare la quantità di un prodotto nel carrello
    const cartItem = document.getElementById(id);

    if(cartItem !== null) {
        const quantityOfItem = cartItem.querySelector('.item_quantity');
        let quantity = parseInt(quantityOfItem.textContent);

        quantity += number;

        if (quantity <= 0) {
            removeItemCart({target: cartItem.querySelector('.remove_button')})
        }
        else {
            quantityOfItem.textContent = quantity;
        }

         const itemPrice = cartItem.querySelector("h1");
         const pricePerUnit = parseFloat(itemPrice.getAttribute('data-price'))
         const totalPriceForItem = pricePerUnit * quantity;
         itemPrice.textContent = totalPriceForItem.toFixed(2) + '€';
    }

    updateTotalPrice();
}

function increaseQuantity(event) {
    const id = event.target.parentElement.id;
    updateQuantity(id, 1);
}

function decreaseQuantity(event) {
    const id = event.target.parentElement.id;
    updateQuantity(id, -1);
}

function handleCart(img, nome, prezzo, id, quantity=1) {
    if(cartItemsArray.includes(id)) {
        updateQuantity(id, quantity);
        return;
    }
    cartItemsArray.push(id);

    const cartItem = document.createElement('div');
    cartItem.classList.add('cart_item');
    cartItem.id = id;
    cartItem.setAttribute('data-id', id);

    const itemImg = document.createElement('img');
    itemImg.src = img;

    const itemName = document.createElement('p');
    itemName.textContent = nome;

    const itemPrice = document.createElement('h1');
    itemPrice.textContent = (prezzo + "€");
    itemPrice.setAttribute('data-price', parseFloat(prezzo));

    const itemQuantity = document.createElement('span');
    itemQuantity.textContent = quantity;
    itemQuantity.classList.add('item_quantity');

    const addQuantity = document.createElement('button');
    addQuantity.textContent = '+';
    addQuantity.addEventListener('click', increaseQuantity);

    const reduceQuantity = document.createElement('button');
    reduceQuantity.textContent = '-';
    reduceQuantity.addEventListener('click', decreaseQuantity);

    const removeButton = document.createElement('button');
    removeButton.textContent ="X";
    removeButton.classList.add('remove_button');
    removeButton.addEventListener('click', removeItemCart);


    cartItem.appendChild(itemImg);
    cartItem.appendChild(itemName);
    cartItem.appendChild(itemPrice);
    cartItem.appendChild(reduceQuantity);
    cartItem.appendChild(itemQuantity);
    cartItem.appendChild(addQuantity);
    cartItem.appendChild(removeButton);

    cartItemsContainer.appendChild(cartItem);

    updateTotalPrice();
}

function handleCartClick(event) {
if (!event.target.classList.contains("add_to_cart")) {
    return;
}

    const img = event.target.getAttribute('data-img');
    const nome = event.target.getAttribute('data-name');
    const prezzo = event.target.getAttribute('data-price');
    const id = event.target.getAttribute('data-id');
    
    handleCart(img, nome, prezzo, id);
}


for (let i=0; i<articleNumbers.length; i++) {
    articleNumbers[i].addEventListener('click', handleCartClick);
}

function updateTotalPrice() {
    let tot = 0;

    for(let i = 0; i < cartItemsArray.length; i++) {
        const cartItem = document.getElementById(cartItemsArray[i]);
        const itemPrice = cartItem.querySelector("h1").textContent;
        const price = parseFloat(itemPrice.replace('€', ''));

        tot += price;
    }

    totalPrice.textContent = tot.toFixed(2) + '€';
}

function saveCart() { //Funzione per salvare gli items salvati dall'utente che ha fatto il login
    if(currentUser) {
        const savedItems = [];

        for(let i=0; i < cartItemsArray.length; i++) {
            const id = cartItemsArray[i];
            const item = document.getElementById(id);
            const img = item.querySelector("img").src;
            const name = item.querySelector("p").textContent;
            const price = item.querySelector("h1").getAttribute("data-price");
            const quantity = parseInt(item.querySelector(".item_quantity").textContent);

            savedItems.push({id, img, name, price, quantity})
        }

        localStorage.setItem(`cart_${currentUser}`, JSON.stringify(savedItems));
    }
}

function loadCart() { //Funzione per caricare gli items salvati dall'utente che ha fatto il login
    if(currentUser) {
        const cartData = localStorage.getItem(`cart_${currentUser}`);
        if (cartData) {
            const items = JSON.parse(cartData);

            for (const item of items) {
                handleCart(item.img, item.name, item.price, item.id, item.quantity);
            }
        }
    }
}

window.addEventListener("beforeunload", saveCart); //In questo modo se si chiude o ricarica la pagina gli items nel carrello vengono salvati

checkoutButton.addEventListener("click", checkout);

function checkout() { //Simulazione dell'acquisto dei prodotti nel carrello
    if (cartItemsArray.length === 0) {
        alert("Il carrello è vuoto!");
        return;
    }

    const products = []; //Prodotti nel carrello

    for(let i=0; i<cartItemsArray.length; i++) {
        const id = cartItemsArray[i];
        const item = document.getElementById(id);
        const quantity = parseInt(item.querySelector(".item_quantity").textContent);

        products.push(
            {
                productID: parseInt(id),
                productQuantity: quantity
            }
        )
    }

    const payload = {
        userID: 1,
        date: new Date().toISOString().split('T')[0],
        products: products
    }

    fetch("https://fakestoreapi.com/carts", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(onPaymentResponse).then(onPaymentJson);
}

function onPaymentResponse(promise) {
    return promise.json();
}

function onPaymentJson(json) {
    console.log("Ordine effettuato: ", json);

    alert("Pagamento completato con successo!");
    cartItemsContainer.innerHTML="";
    cartItemsArray.length=0;
    updateTotalPrice();
    localStorage.removeItem(`cart_${currentUser}`); //Svuoto il carrello dopo il pagamento
}