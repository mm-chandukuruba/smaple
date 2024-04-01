const submitButton = document.querySelector("#submitButton")
submitButton.addEventListener("click" , viewlist)

async function fetchData() {
	const sheetKey = '1vFS_RgmPVFkO3UzY7GCmQ7wESGNJVks_liR1bbEQVCI';
	const apiKey = 'AIzaSyA7fX6kxMYXysA0RKLgVmMzi2Y_uT2mTJA';
	const sheetUrl = "https://sheets.googleapis.com/v4/spreadsheets/" + sheetKey + "/values/Orient%20Store%20locator?key=" + apiKey;
	const categorySelectValues = []
	try {
			const response = await fetch(sheetUrl);
			const data = await response.json();
		  const categories = data.values;
			localStorage.setItem("dealersDetails" , JSON.stringify(categories))
			for (let i = 0; i < categories.length; i++) {
				if (categorySelectValues.includes(categories[i][1])) continue;
				categorySelectValues.push(categories[i][1]);
			}
	} catch (error) {
			console.error('Error fetching data:', error);
	}
return categorySelectValues
}


document.addEventListener("DOMContentLoaded", async()=>{
	const loader = document.querySelector("#loader")
	loader.style.display = "block"
  const categorySelectValues =await fetchData()
	console.log(categorySelectValues)
	const categorySelect = document.querySelector("#slcatid")
	const categories = JSON.parse(localStorage.getItem("dealersDetails"))
	
	categorySelectValues.forEach(values => {
		categorySelect.innerHTML += `<option value=${values}>${values}</option>`
	})
	loader.style.display = "none"
})


async function viewlist(){
	const slcatid = document.querySelector('#slcatid');
	const slstate = document.querySelector('#slstate');
	const slcity = document.querySelector('#slcity');
	if (!slcatid.value) {
		alert("Please select Type");
		return;
	}
	const loader = document.querySelector("#loader")
	loader.style.display = "block"

	const categories = await JSON.parse(localStorage.getItem("dealersDetails")) || []
	
	const addressList = document.querySelector(".address-list")
	console.log(addressList)

	const categoryValue = slcatid.value
	const stateValue = slstate.value
	const cityValue = slcity.value

	let addressListValues = []
	
	for ( i = 0 ; i < categories.length ; i++){
		if (categories[i][1] === categoryValue && categories[i][3] === stateValue && categories[i][4] === cityValue){
			addressListValues.push(i)
		}
	}

	console.log(addressList)

	addressListValues.forEach(address => {
		address.forEach(list => {
			addressList.innerHTML += 
				`<div class="list">
					<div class="box">
						<h3>${list[2]}</h3>
						<div class="info">
							<p class="address">${list[8]}</p>
							<p>
								<span>${list[4]}</span>
								Phone: <strong>${list[10]}</strong>
							</p>
						</div>
					</div>
				</div>`
		})
		})

	loader.style.display = "none"
}


async function findstatelist(){
	const loader = document.querySelector("#loader")
	loader.style.display = "block"
	const slcatid = document.querySelector('#slcatid'); 
	const categories = JSON.parse(localStorage.getItem("dealersDetails"))
	let states=[]
	const stateSelector = document.querySelector("#slstate")
	for (i = 0 ; i < categories.length ; i++){
		if (categories[i][1] === slcatid.value){
			if (states.includes(categories[i][3])) continue
			states.push(categories[i][3])
		}
	}
	states.forEach(stateValues => {
		stateSelector.innerHTML += `<option value=${stateValues}>${stateValues}</option>`
	})
	console.log(states)
	loader.style.display = "none"
}

async function findcitylist(){
	const loader = document.querySelector("#loader")
	loader.style.display = "block"
	const slcatid = document.querySelector('#slstate'); 
	const categories = JSON.parse(localStorage.getItem("dealersDetails"))
	let cities=[]
	const citySelector = document.querySelector("#slcity")
	for (i = 0 ; i < categories.length ; i++){
		if (categories[i][3] === slcatid.value){
			if (cities.includes(categories[i][4])) continue
			cities.push(categories[i][4])
		}
	}
	cities.forEach(stateValues => {
		citySelector.innerHTML += `<option value=${stateValues}>${stateValues}</option>`
	})
	console.log(cities)
	loader.style.display = "none"
}