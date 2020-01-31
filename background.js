var ff_version = parseInt(window.navigator.userAgent.split('/').pop().split('.')[0], 10);

function loadEnv() {

	browser.storage.sync.get("environments")
	.then(function(results){
		env = []
		let { environments } = results;

		if (environments == undefined) {
			return
		}

		Object.keys(environments).map(function(value){
			env.push( { match: value, color: environments[value] });
		});

		env.sort(function(a, b) {
			return a.match.length - b.match.length
		})
	})

}

browser.storage.onChanged.addListener(loadEnv)

browser.runtime.onInstalled.addListener(function(details) {
	browser.storage.sync.get("environments")
		.then(function(results) {
			if (!("environments" in results)) {
				browser.storage.sync.set({"environments": { "": ""} })
				browser.runtime.openOptionsPage()
			}
		})
})

var env = []
loadEnv()

function setTabColor(tab) {
	var url = tab.url
	var color = getColorFromUrl(env, url)

	if (color) {
		browser.theme.update(tab.windowId, generateThemeFromColor(color))
	}
	else {
		browser.theme.reset(tab.windowId)
	}
}

function generateThemeFromColor(color) {
  // "theme_frame" // >= 70
  // "frame": colorLuminance(color, -0.3), // >= 70
  // "tab_background_ext": invertColor(color, true), // >= 70
	var theme = {
		"images": { },
		"colors": {
			"toolbar": color
		}
	};

  var headerURL = "headerURL";
  var accentcolor = "accentcolor";
  var textcolor = "textcolor";

  if (ff_version >= 70) {
    headerURL = "theme_frame";
    accentcolor = "frame";
    textcolor = "tab_background_ext";
  }

  theme["images"][headerURL] = "";
  theme["colors"][accentcolor] = colorLuminance(color, -0.3);
  theme["colors"][textcolor] = invertColor(color, true);

  return theme;
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (tab.active) {
		setTabColor(tab)
	}
})

browser.tabs.onActivated.addListener(function(activeInfo) {
	browser.tabs.get(activeInfo.tabId).then(function(tab) {
		setTabColor(tab)
	})
})


