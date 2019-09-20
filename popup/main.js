let listEnvironments = document.querySelector(".list-environments")
let btnAddEnv = document.getElementById("btn-add-env");
let btnSaveEnv = document.getElementById("btn-save-env");
let preview = document.querySelector("#preview-bar input")

env = [];

var debounce = function (func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

let tab_selected = document.querySelector('#selected path');
let tab = document.querySelector('#tab');
let header = document.querySelector('#header');

preview.addEventListener('keyup', debounce(function() {
  url = preview.value;

  color = getColorFromUrl(env, url)

  if (color) {
    tab_selected.style.fill = color;
    tab.style.fill = colorLuminance(color, -0.22);
    header.style.fill = colorLuminance(color, -0.3);
  }
  else {
    tab_selected.style.fill = "#ffffff";
    tab.style.fill = "#e0e0e0";
    header.style.fill = "#eaeaea";
  }

}, 500));

let buildEnv = function() {
  elts = document.getElementsByClassName('environment');
  env = [];
    
  for(i = 0; i < elts.length; i++) {
    elt = elts[i];
    color = elt.getElementsByClassName('color')[0].value;
    match = elt.getElementsByClassName('match')[0].value;
    env.push({ match, color });
  };
}

let addEnvironment = function(url, color){
	let environmentNode =  document.createElement("section");
	environmentNode.classList.add("environment");

	let envColor = document.createElement("input");
  envColor.classList.add("form-input");
  envColor.classList.add("color");
	envColor.type = "color";
	envColor.value = color || randomDefaultColor();
  envColor.addEventListener('change', buildEnv);
	environmentNode.appendChild(envColor);
	
	let envDomain = document.createElement("input");
	envDomain.type = "text";
  envDomain.classList.add("form-input");
  envDomain.classList.add("match");
	envDomain.placeholder = "*.dev.example.com";
	envDomain.value = url || "";
  envDomain.addEventListener('change', buildEnv);
	environmentNode.appendChild(envDomain);

	let envRemove = document.createElement("button");
	envRemove.className = "btn-remove";
  envRemove.classList.add("btn");
	envRemove.innerHTML = '<i class="far fa-trash-alt"></i>';
	envRemove.addEventListener("click", () => removeEnvironment(environmentNode), false);
	environmentNode.appendChild(envRemove);

	listEnvironments.appendChild(environmentNode);
  buildEnv();
}

let randomDefaultColor = function(){
	let flatColors = [ "#0a84ff", "#00feff", "#ff1ad9", "#30e60b", "#ffe900", "#ff0039", "#9400ff", "#ff9400", "#363959", "#737373"];
	return flatColors[ Math.floor(Math.random() * flatColors.length)];
}

let removeEnvironment = function(section){
	section.remove();
  buildEnv();
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
    listEnvironments.innerHTML = ''; // remove loading spinner
		Object.keys(environments).map(function(value){
			addEnvironment(value, environments[value]);
		});
	})
	.catch(function(err){
    console.error(err)
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
