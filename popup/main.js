let listEnvironments = document.querySelector(".list-environments")
let btnAddEnv = document.getElementById("btn-add-env");
let btnSaveEnv = document.getElementById("btn-save-env");

let addEnvironment = function(url, color){
	let environmentNode =  document.createElement("section");
	environmentNode.classList.add("environment");

	let envColor = document.createElement("input");
	envColor.type = "color";
	envColor.value = color || randomDefaultColor();
	environmentNode.appendChild(envColor);
	
	let envDomain = document.createElement("input");
	envDomain.type = "text";
	envDomain.placeholder = "*.dev.example.com";
	envDomain.value = url || "";
	environmentNode.appendChild(envDomain);

	let envRemove = document.createElement("button");
	envRemove.className = "btn-remove";
	envRemove.textContent = "Remove";
	envRemove.addEventListener("click", () => removeEnvironment(environmentNode), false);
	environmentNode.appendChild(envRemove);

	listEnvironments.appendChild(environmentNode);
}

let randomDefaultColor = function(){
	let flatColors = [ "#0a84ff", "#00feff", "#ff1ad9", "#30e60b", "#ffe900", "#ff0039", "#9400ff", "#ff9400", "#363959", "#737373"];
	return flatColors[ Math.floor(Math.random() * flatColors.length)];
}

let removeEnvironment = function(section){
	section.remove();
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
	browser.storage.sync.set({"environments": environments}).catch(function(err){
		btnAddEnv.setCustomValidity("Could not save your environments");
		btnAddEnv.reportValidity();
	});
}

btnAddEnv.addEventListener("click", function() { addEnvironment() }, false)
btnSaveEnv.addEventListener("click", updateEnvironments, false)

document.addEventListener("DOMContentLoaded", function(){
	browser.storage.sync.get("environments")
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

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

document.getElementById('export').addEventListener('click', function() {
  browser.storage.sync.get("environments")
	.then(function(env) {
    download('envify.json', JSON.stringify(env))
  })
});

document.getElementById('import').addEventListener('click', function() {
  input = document.getElementById('import_file')
  file = input.files[0]
  input.value = ""

  reader = new FileReader();

  reader.onloadend = function(evt) {
    if (evt.target.readyState == FileReader.DONE) {
      env = JSON.parse(evt.target.result)
      browser.storage.sync.set(env);
      document.location.reload();
    }
  }

  reader.readAsText(file);
});
