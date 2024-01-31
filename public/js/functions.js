var mobile = /iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(
  navigator.userAgent.toLowerCase()
);

export function createNav() {
  if (document.querySelectorAll("nav").length) console.log("no");
  var nav = document.createElement("nav");
  var user = `<button id="user"><i data-feather="log-in"></i>Login</button>`;
  var home = `<button onclick="swup.navigate('/');"><i data-feather="home"></i>Home</button>`;
  var apps = `<button onclick="swup.navigate('/apps');"><i data-feather="layers"></i>Apps</button>`;
  var addons = `<button onclick="swup.navigate('/addons');"><i data-feather="box"></i>Add-ons</button>`;
  var help = `<button onclick="swup.navigate('/about');"><i data-feather="help-circle"></i>About</button>`;
  var settings = `<button class="bottom" onclick="swup.navigate('/settings');"><i data-feather="sliders"></i>Settings</button>`;

  if (mobile) {
    nav.innerHTML = user + home + addons + help + settings;
  } else {
    nav.innerHTML = user + home + apps + addons + help + settings;
  }
  document.body.appendChild(nav);
  if (mobile) {
    
    document.querySelectorAll("nav *").forEach((elem) => {
      [...elem.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          child.remove();
        }
      });
    });
  }

  feather.replace();
}
