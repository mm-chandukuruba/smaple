const button = document.querySelector("#product-bundle-bundle")

const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');

button.addEventListener("click" , addToCart)

function addToCart(){
    const productId =  document.querySelectorAll("input[name=bundle-product]:checked")
    const productIds = []
    const mainProduct = document.querySelector(".bundle-products")
    const mainProductQuantity = document.querySelector(".quantity__input")
    productIds.push({
      "id":mainProduct.dataset.id,
      "quantity" : mainProductQuantity.value
    })
    productId.forEach(item => {
        const itemValues = {
            "id" : item.dataset.id,
            "quantity" : item.dataset.qunatity
        }
        productIds.push(itemValues)
    })

    let formData = {
        'items': productIds,
        'sections' : cart.getSectionsToRender().map((section) => section.id),
       };
       
       fetch(window.Shopify.routes.root + 'cart/add.js', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			})
       .then(response => {
         return response.json()
       })
       .then(response => {
        cart.renderContents(response)
			 })
       .catch((error) => {
         console.error('Error:', error);
       });
       
}


