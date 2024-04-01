if (!customElements.get('quick-add-modal')) {
  customElements.define(
    'quick-add-modal',
    class QuickAddModal extends ModalDialog {
      constructor() {
        super();
        this.modalContent = this.querySelector('[id^="QuickAddInfo-"]');
      }

      hide(preventFocus = false) {
        const cartNotification = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        if (cartNotification) cartNotification.setActiveElement(this.openedBy);
        this.modalContent.innerHTML = '';

        if (preventFocus) this.openedBy = null;
        super.hide();
      }

      show(opener) {
        opener.setAttribute('aria-disabled', true);
        opener.classList.add('loading');
        opener.querySelector('.loading-overlay__spinner').classList.remove('hidden');

        fetch(opener.getAttribute('data-product-url'))
          .then((response) => response.text())
          .then((responseText) => {
            const responseHTML = new DOMParser().parseFromString(responseText, 'text/html');
            this.productElement = responseHTML.querySelector('section[id^="MainProduct-"]');
            this.preventDuplicatedIDs();
            this.removeDOMElements();
            this.setInnerHTML(this.modalContent, this.productElement.innerHTML);

            if (window.Shopify && Shopify.PaymentButton) {
              Shopify.PaymentButton.init();
            }

            if (window.ProductModel) window.ProductModel.loadShopifyXR();

            this.removeGalleryListSemantic();
            this.preventVariantURLSwitching();
            super.show(opener);
          })
          .finally(() => {
            opener.removeAttribute('aria-disabled');
            opener.classList.remove('loading');
            opener.querySelector('.loading-overlay__spinner').classList.add('hidden');
            this.sizeGuide()
          });
      }

      setInnerHTML(element, html) {
        element.innerHTML = html;

        // Reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
        element.querySelectorAll('script').forEach((oldScriptTag) => {
          const newScriptTag = document.createElement('script');
          Array.from(oldScriptTag.attributes).forEach((attribute) => {
            newScriptTag.setAttribute(attribute.name, attribute.value);
          });
          newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
          oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
        });
        this.showAllImages()
      }

      showAllImages(){
        const imagesArray = this.productElement.querySelector(".thumbnail-list").querySelectorAll("img");
        const imagesMainContainer = this.modalContent.querySelector(".product__media");
        imagesMainContainer.classList.remove("media")
        imagesMainContainer.classList.add("quick-shop-img-slider");
        
        // Clear existing content in imagesMainContainer
        imagesMainContainer.innerHTML = "";
        
        
        // Append each image from imagesArray to imagesMainContainer
        imagesArray.forEach((img) => {
          const imgClone = img.cloneNode(true); // Clone the image node
          imgClone.classList.add("quick-shop-slider-item"); // Add class to cloned image
          imagesMainContainer.appendChild(imgClone); // Append cloned image to container
        });
        const carouselButtons = `<div class="carousel-buttons-container">
                                    <button>&lt;</button>
                                    <button>&gt;</button>
                                </div>`;
        imagesMainContainer.innerHTML += carouselButtons;
        this.scrollEvents(imagesMainContainer)

        const product = this.modalContent.querySelector('.product');
        const mediaImages = product.querySelectorAll('.product__media img');
        if (!mediaImages.length) return;

        let mediaImageSizes =
          '(min-width: 1000px) 715px, (min-width: 750px) calc((100vw - 11.5rem) / 2), calc(100vw - 4rem)';

        if (product.classList.contains('product--medium')) {
          mediaImageSizes = mediaImageSizes.replace('715px', '605px');
        } else if (product.classList.contains('product--small')) {
          mediaImageSizes = mediaImageSizes.replace('715px', '495px');
        }

        mediaImages.forEach((img) => img.setAttribute('sizes', mediaImageSizes));
      }

      preventVariantURLSwitching() {
        const variantPicker = this.modalContent.querySelector('variant-radios,variant-selects');
        if (!variantPicker) return;

        variantPicker.setAttribute('data-update-url', 'false');
      }

      removeDOMElements() {
        const pickupAvailability = this.productElement.querySelector('pickup-availability');
        if (pickupAvailability) pickupAvailability.remove();

        const productModal = this.productElement.querySelector('product-modal');
        if (productModal) productModal.remove();

        const modalDialog = this.productElement.querySelectorAll('modal-dialog');
        if (modalDialog) modalDialog.forEach((modal) => modal.remove());
      }

      preventDuplicatedIDs() {
        const sectionId = this.productElement.dataset.section;
        this.productElement.innerHTML = this.productElement.innerHTML.replaceAll(sectionId, `quickadd-${sectionId}`);
        this.productElement.querySelectorAll('variant-selects, variant-radios, product-info').forEach((element) => {
          element.dataset.originalSection = sectionId;
        });
      }

      removeGalleryListSemantic() {
        const galleryList = this.modalContent.querySelector('[id^="Slider-Gallery"]');
        if (!galleryList) return;

        galleryList.setAttribute('role', 'presentation');
        galleryList.querySelectorAll('[id^="Slide-"]').forEach((li) => li.setAttribute('role', 'presentation'));
      }

      updateImageSizes() {
        const product = this.modalContent.querySelector('.product');
        const desktopColumns = product.classList.contains('product--columns');
        if (!desktopColumns) return;

        const mediaImages = product.querySelectorAll('.product__media img');
        if (!mediaImages.length) return;

        let mediaImageSizes =
          '(min-width: 1000px) 715px, (min-width: 750px) calc((100vw - 11.5rem) / 2), calc(100vw - 4rem)';

        if (product.classList.contains('product--medium')) {
          mediaImageSizes = mediaImageSizes.replace('715px', '605px');
        } else if (product.classList.contains('product--small')) {
          mediaImageSizes = mediaImageSizes.replace('715px', '495px');
        }

        mediaImages.forEach((img) => img.setAttribute('sizes', mediaImageSizes));
      }

      //size and measure guide swatch function
      sizeGuide(){
        const sizeGuide = this.modalContent.querySelector(".size-guide")
        sizeGuide?.addEventListener('click', function () {
          popupGuide.style.display = 'block';
          sizeHeading.click();
        });
        
        //size and measure close open popup
        const closeGuidePopup = document.querySelector('.popup-close-btn');
        
        closeGuidePopup?.addEventListener('click', function () {
          popupGuide.style.display = 'none';
        });
      }
      scrollEvents(scrollContainer){
        const buttonsContainer = this.modalContent.querySelector(".carousel-buttons-container");
        const leftButton = buttonsContainer.querySelector("button:nth-child(1)");
        const rightButton = buttonsContainer.querySelector("button:nth-child(2)");
        const childWidth = scrollContainer.querySelector("img").offsetWidth;
    
        rightButton.addEventListener("click", function(event){
            scrollContainer.scrollTo({
                left: scrollContainer.scrollLeft + childWidth,
                behavior: "smooth"
            });
        });
    
        leftButton.addEventListener("click", (event) => {
            scrollContainer.scrollTo({
                left: scrollContainer.scrollLeft - childWidth,
                behavior: "smooth"
            });
        });
      }    
    }
  );
}
