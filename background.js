browser.runtime.onInstalled.addListener(function() {
  browser.runtime.openOptionsPage()
})

var env = []

function loadEnv() {

	browser.storage.local.get("environments")
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

loadEnv()

browser.storage.onChanged.addListener(loadEnv)

function matchRule(str, rule) {
  return new RegExp(rule.split("*").join(".*")).test(str);
}

function getColorFromUrl(url) {
  var color = null

  env.forEach(function(env) {
    if (matchRule(url, env.match)) {
      color = env.color 
    }
  })

  return color
}

function setTabColor(tab) {
  var url = tab.url
  var color = getColorFromUrl(url)

  if (color) {
    browser.theme.update(tab.windowId, generateThemeFromColor(color))
  }
  else {
    browser.theme.reset(tab.windowId)
  }
}

function generateThemeFromColor(color) {
  return {
      "images": {
        "headerURL": ""
      },
      "colors": {
        "accentcolor": colorLuminance(color, -0.3),
        "textcolor": invertColor(color, true),
        "toolbar": color
      }
    }
}

function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

function colorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
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


