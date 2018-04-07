let listEnvironments = document.querySelector(".list-environments")
let btnAddEnv = document.getElementById("btn-add-env");

let addEnvironment = function(url, color){
	let environmentStr =`<input type="text" placeholder="*.dev.example.com" value="${ url || ''}"><input type="text" class="color" value="${ color || randomDefaultColor() }"><button class="btn-remove">Remove</button>`;
	let environmentNode =  document.createElement("section");
	environmentNode.classList.add("environment");
	environmentNode.innerHTML = environmentStr;
	environmentNode.querySelector(".btn-remove").addEventListener("click", removeEnvironment.bind(environmentNode), false);
	environmentNode.querySelector("input").addEventListener("input", updateEnvironments, false);

	listEnvironments.appendChild(environmentNode);
}

let randomDefaultColor = function(){
	let flatColors = [ "#1abc9c","#2ecc71","#3498db","#9b59b6","#34495e","#16a085","#27ae60","#2980b9","#8e44ad","#2c3e50","#f1c40f","#e67e22","#e74c3c","#ecf0f1","#95a5a6","#f39c12","#d35400","#c0392b","#bdc3c7","#7f8c8d"];
	return flatColors[ Math.floor(Math.random() * flatColors.length)]
}

let removeEnvironment = function(){
	let section = this;
	section.parentElement.removeChild(section);
	updateEnvironments()
}

let updateEnvironments = function(){
	let environments = {};
	for (let el of listEnvironments.children){
		let url = el.querySelector("input[type=text]").value;
		if(!url){
			continue;
		}
		environments[url] = el.querySelector(".color").value;
	}
	browser.storage.local.set({"environments": environments}).catch(function(err){
		btnAddEnv.setCustomValidity("Could not save your environments");
		btnAddEnv.reportValidity();
	});
}

btnAddEnv.addEventListener("click", function(){ addEnvironment(); updateEnvironments()}, false)

document.addEventListener("DOMContentLoaded", function(){
	browser.storage.local.get("environments")
	.then(function(results){
		let { environments } = results;
		Object.keys(environments).map(function(value){
			addEnvironment(value, environments[value]);
		});
	})
	.catch(function(err){
		btnAddEnv.setCustomValidity("Could not load your environments");
		btnAddEnv.reportValidity();
	})
}, false)
