

document.querySelectorAll(".custom-collections-tab").forEach(element=>{
    element.addEventListener("click",function(e){
        document.querySelectorAll(".custom-collections-tab").forEach(tab=> tab.classList.remove("active"))
        document.querySelectorAll(".collections-tab__content").forEach(container => {
            if (element.dataset.id === container.dataset.index ){
                container.classList.add("active")
            }else{
                container.classList.remove("active")
            }
            this.classList.add("active")
        })
    })
})