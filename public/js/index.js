var mobile = /iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(
  navigator.userAgent.toLowerCase()
);
function refreshPageTheme() {
  const theme = window.localStorage.getItem("theme");
  document.documentElement.setAttribute("data-theme", theme);
}

refreshPageTheme();

$(document).ready(function () {
  const getInfo = () => {
    $.ajax({
      url: "/user/getinfo",
      type: "GET",
      dataType: "json",
      success: function (data) {
        $("#user").html(`<img src="${data.picture}"><p>${data.name}</p>`);
        window.localStorage.setItem(
          "userid",
          data.id ? JSON.stringify(data.id) : "notLoggedIn"
        );
      },
      error: function () {
        $("#user")
          .off("click")
          .on("click", () => (window.location.href = "/login"));
        window.localStorage.setItem("userid", "notLoggedIn");
      },
    });
  };

  getInfo();
});

function jsSettingsPage() {
  const userid = window.localStorage.getItem("userid");
  let errorHtml = "";

  if (userid === "none") {
    errorHtml =
      "Account info only available with accounts through auth0. To learn more, visit the <a href='https://flowspace.app/about/#FAQ'>FAQ</a>";
  } else if (userid === "notLoggedIn") {
    errorHtml =
      "To change account settings, you have to be logged in. <a href='/login'>Log in</a>";
  }

  if (errorHtml) {
    $("#accountError").html(errorHtml);
    $("#accountSettings").remove();
  }
}

function jsAppsPage() {
  if (mobile) {
    $(".applist").empty().append("Apps are cuurent only supported Desktop.");
    return
  }
  fetch("/js/apps.json")
    .then((response) => response.json())
    .then((games) => {
      const gameElements = games.map((game) => {
        return $(`<div class="gameElement">
                    <img src="${game.icon}" class="gameIcon">
                    <div class="gameOpt">
                      <div class="gameName">${game.name}</div>
                      <button class="gamePlay" onclick="swup.navigate('/app?id=${game.id}')">Play</button>
                    </div>
                  </div>`);
      });
      $(".applist").empty().append(gameElements);
    });
}

function appLauncher() {
  const gameId = new URLSearchParams(window.location.search).get("id");
  fetch("/js/apps.json")
    .then((response) => response.json())
    .then((games) => {
      const selectedGame = games.find((game) => game.id === gameId);
      if (selectedGame) {
        $("#appTitle").text(selectedGame.name);
        $("#appFrame").attr("src", selectedGame.url);
      }
    });
}

function init() {
  feather.replace();
  if ($("#page-apps").length) jsAppsPage();
  if ($("#page-applaunch").length) appLauncher();
  if ($("#page-settings").length) jsSettingsPage();

  if (mobile) {
    $("nav *")
      .contents()
      .filter(function () {
        return this.nodeType === Node.TEXT_NODE;
      })
      .remove();
  }
}

document.addEventListener("DOMContentLoaded", init);
swup.hooks.on("page:view", init);

function checkForGoGuardian() {
  if (window.location.href === "about:blank") {
    return false;
  }
  return !!document.getElementById("gg-privacy-banner");
}

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    if (checkForGoGuardian()) {
      if (
        confirm(
          "It seems you have GoGuardian installed. Would you like to enter hidden mode?"
        )
      ) {
        var win = window.open("", "_blank");
        win.document.write(`
          <body style="margin:0; height:100vh;">
            <iframe src="http://localhost:3000" style="border:none; width:100%; height:100%; margin:0;"></iframe>
          </body>
        `);
      }
    }
  }, 1000);
});

console.warn(
  "⚠️  Important Safety Reminder ⚠️\n" +
    "To protect your security and privacy, please do not paste any code into the console unless you are absolutely certain it is safe to do so.\n" +
    "Pasting untrusted code can have serious consequences, including:\n" +
    "- Unauthorized access to your personal information\n" +
    "- Damage to your computer or device\n" +
    "- Loss of data\n" +
    "- Exposure to harmful content\n" +
    "Stay safe online!"
);
