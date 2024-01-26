function refreshPageTheme() {
  document.documentElement.setAttribute(
    "data-theme",
    window.localStorage.getItem("theme")
  );
}

refreshPageTheme();
$(document).ready(function () {
  function getInfo() {
    $.ajax({
      url: "/user/getinfo",
      type: "GET",
      dataType: "json",
      success: function (data) {
        $("#user").html(
          "<img src=" + data.picture + "></img><p>" + data.name + "</p>"
        );
        if (data.id == "") {
          window.localStorage("userid", "notLoggedIn");
        } else {
          window.localStorage.setItem("userid", JSON.stringify(data.id));
        }
      },
      error: function () {
        $("#user")
          .off("click")
          .on("click", function () {
            window.location.href = "/login";
          });
        window.localStorage.setItem("userid", "notLoggedIn");
      },
    });
  }

  getInfo();

  console.warn(
    "⚠️  Important Safety Reminder ⚠️\n" +
      "To protect your security and privacy, please do not paste any code into the console unless you are absolutely certain it is safe to do so.\n" +
      "Pasting untrusted code can have serious consequences, including:\n" +
      "- Unauthorized access to your personal information\n" +
      "- Damage to your computer or device\n" +
      "- Loss of data\n" +
      "- Exposure to harmful content\n" +
      "Stay safe online! "
  );
});

function jsSettingsPage() {
  // $(".themeBtn").on("click", function () {
  //   window.localStorage.setItem("theme", $(this).attr("id"));
  //   document.documentElement.setAttribute("data-theme", $(this).attr("id"));
  // });
  var userid = window.localStorage.getItem("userid");
  if (userid == "none") {
    $("#accountError").html(
      "Account info only available with accounts through auth0. to learn more, visit the<a href='https://flowspace.app/about/#FAQ'>FAQ</a>"
    );
    $("#accountSettings").remove();
  } else if ((userid = "notLoggedIn")) {
    $("#accountError").html(
      "To change account settings, You have to be logged in. <a href='/login'>Log in</a>"
    );
    $("#accountSettings").remove();
  } else {
  }
}

function jsAppsPage() {
  fetch("/js/apps.json")
    .then((response) => response.json())
    .then((games) => {
      games.forEach((game) => {
        console.log(game);
        var gameElement = $("<div></div>").addClass("gameElement");
        var gameIcon = $("<img>").attr("src", game.icon).addClass("gameIcon");
        gameElement.append(gameIcon);
        var gameOpt = $("<div></div>").addClass("gameOpt");
        var gameName = $("<div></div>").addClass("gameName").text(game.name);
        var gamePlay = $("<button>Play</button>").addClass("gamePlay");
        $(gamePlay).on("click", function () {
          swup.navigate(`/app?id=${game.id}`);
        });
        gameOpt.append(gameName).append(gamePlay);
        gameElement.append(gameOpt);
        $(".applist").append(gameElement);
      });
    });
}

function appLauncher() {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("id");
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
  if (document.querySelector("#page-apps")) {
    jsAppsPage();
  }
  if (document.querySelector("#page-applaunch")) {
    appLauncher();
  }
  if (document.querySelector("#page-settings")) {
    jsSettingsPage();
  }
}

// Run once when page loads
if (document.readyState === "complete") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", () => init());
}

// Run after every additional navigation by swup
swup.hooks.on("page:view", () => init());

function checkForGoGuardian() {
  var privacyBanner = document.getElementById("gg-privacy-banner");
  if (privacyBanner) {
    return true; // GoGuardian is likely present
  } else {
    return false; // GoGuardian is likely not present
  }
}

// MAKE ALERT FOR ABOUT:BLANK REDIRECT ON FLOWSPACE.APP JUST IN CASE

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    if (checkForGoGuardian()) {
      var ask = confirm(
        "It seems you have goguardian installed. \n Would you like to enter hidden mode?"
      );
      if (ask) {
        var url = "http://localhost:3000";
        var win = window.open();
        win.document.body.style.margin = "0";
        win.document.body.style.height = "100vh";
        var iframe = win.document.createElement("iframe");
        iframe.style.border = "none";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.margin = "0";
        iframe.src = url;
        win.document.body.appendChild(iframe);
      }
    }
  });
});
