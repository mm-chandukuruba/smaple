function debounce(functionToExecute, time){
  let timerId
  return (...args)=>{
    clearTimeout(timerId)
    timerId = setTimeout(()=>functionToExecute.apply(this, args), time)
  }
}

class CollectionFilters extends HTMLElement{
  constructor(){
    super()

    this.debounceOnSubmit = debounce((event) => {this.onSubmitHandler(event)}, 500);
  

    this.sectionId = this.dataset.sectionId
    
    this.filtersForm = this.querySelector("form")
    this.filtersForm.addEventListener("input", this.debounceOnSubmit.bind(this))
  }

  onSubmitHandler(){
    let formData = new FormData(this.filtersForm)
    const querySearchString = new URLSearchParams(formData).toString()
    console.log(querySearchString)

    history.pushState({ querySearchString }, '', `${location.pathname}${querySearchString && '?'.concat(querySearchString)}`);
    let url = `${location.pathname}?${querySearchString}&section_id=${this.sectionId}`

    this.fetchUpdatedCollections(url)
  }
  fetchUpdatedCollections(url){
    fetch(url)
    .then(response=>response.text())
    .then(textData=>{
      let htmlData = new DOMParser().parseFromString(textData, "text/html")
      document.getElementById("ProductGridContainer").innerHTML = htmlData.getElementById("ProductGridContainer").innerHTML
      document.querySelector(".collection-filter-bar-desktop").innerHTML = htmlData.querySelector(".collection-filter-bar-desktop").innerHTML
    })
  }
}

customElements.define("collection-filters", CollectionFilters)

class FilterDrawer extends HTMLElement{
  constructor(){
    super()
    let filterDrawerContainer = document.querySelector("#filterDrawerContainer")
    const headerContainer = document.querySelector(".header")
    
    let drawerCloseButton = document.querySelector("#filterDrawerCloseButon")
    let filterOpenButton = document.querySelector("#filterDrawerOpenButton")
    
    drawerCloseButton.addEventListener("click", this.closeFilterDrawer.bind(this))
    filterOpenButton.addEventListener("click", this.openFilterDrawer.bind(this))
  }
  closeFilterDrawer(){
    filterDrawerContainer.style.display = "none"
    headerContainer.style.display = "block"
  }
  openFilterDrawer(){
    filterDrawerContainer.style.display = "block"
    headerContainer.style.display = "none"
    
  }
}

customElements.define("filter-drawer", FilterDrawer)