var env = []

async function start() {
  loadEnv()
  setupListeners();
}

start();

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

function setupListeners() {
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
}

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
	var theme = {
		"images": { 
			"theme_frame": ""
		},
		"colors": {
			"toolbar": color,
			"frame": colorLuminance(color, -0.3),
			"tab_background_text": invertColor(color, true)
		},
		"properties": {
			"color_scheme": "system"
		}
	};

  return theme;
}
