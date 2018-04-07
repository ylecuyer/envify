let listEnvironments = document.querySelector(".list-environments")
let btnAddEnv = document.getElementById("btn-add-env");

let addEnvironment = function(url, color){
	let environmentStr =`<input type="color" value="${ color || randomDefaultColor() }"><input type="text" placeholder="*.dev.example.com" value="${ url || ''}"><button class="btn-remove">Remove</button>`;
	let environmentNode =  document.createElement("section");
	environmentNode.classList.add("environment");
	environmentNode.innerHTML = environmentStr;
	environmentNode.querySelector(".btn-remove").addEventListener("click", removeEnvironment.bind(environmentNode), false);
	environmentNode.querySelector('input[type="color"]').addEventListener("change", updateEnvironments, false);
	environmentNode.querySelector("input").addEventListener("input", updateEnvironments, false);

	listEnvironments.appendChild(environmentNode);
}

let randomDefaultColor = function(){
	let flatColors = [ "#0a84ff", "#00feff", "#ff1ad9", "#30e60b", "#ffe900", "#ff0039", "#9400ff", "#ff9400", "#363959", "#737373"];
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
		environments[url] = el.querySelector("input[type=color]").value;
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