class CustomProductCard extends HTMLElement{
  constructor() {
    super();

    this.productHandle = this.dataset.productHandle;
    this.sectionId = this.dataset.sectionId;
    
    this.variantData = JSON.parse(this.querySelector('script').textContent);
    this.addEventListener('change', this.onOptionChange);
  }

  onOptionChange() {
    this.selectedOptions = Array.from(this.querySelectorAll('input[type="radio"]:checked'), input => input.value);
    this.currentVariant = this.variantData.find(item => JSON.stringify(item.options) == JSON.stringify(this.selectedOptions))
    
    // const url = `/products/${this.productHandle}?variant=${this.currentVariant.id}&section_id=${this.sectionId}`;
    const url = `/products/${this.productHandle}?variant=${this.currentVariant.id}&section_id=product-card`;
    
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, "text/html");
        console.log(html)
        this.innerHTML = html.querySelector(`[data-product-handle="${this.productHandle}"]`).innerHTML;
      });
  }

}

customElements.define("product-card", CustomProductCard)

