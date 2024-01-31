import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { createNav } from "./functions.js";


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
        var gamePlay = $("<button>Play Game</button>").addClass("gamePlay");
        $(gamePlay).on("click", function () {
          swup.navigate(`/app?id=${game.id}`);
        });

        gameOpt.append(gameName).append(gamePlay);
        gameElement.append(gameOpt);
        if (game.display != "none") $(".gamelist").append(gameElement);
      });
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
        $(".app").css({ "aspect-ratio": selectedGame.ratio });
        $(".app").focus();
        $("#appFrame").focus();
      }
    });
}

function jsChangeLogPage() {
  fetch("changelog.md")
    .then((response) => response.text())
    .then((textString) => {
      document.getElementById("content").innerHTML = marked.parse(textString);
    });
}

function jsHomePage() {
  $.getJSON("https://kdata.flowspace.app/flowspace.json", function (data) {
    if (data.header && data.header.title && data.header.desc) {
      $("#title").text(data.header.title);
      $("#desc").text(data.header.desc);
    } else {
      console.error("Invalid data structure in JSON");
    }
  }).fail(function () {
    console.error("Error fetching or parsing JSON");
  });
  let deferredPrompt;

  const installBtn = document.querySelector("#installBtn");

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  installBtn.addEventListener("click", (e) => {
    installBtn.style.display = "none";
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
    });
  });
}

function init() {
  if ($("#page-apps").length) jsAppsPage();
  if ($("#page-applaunch").length) appLauncher();
  if ($("#page-settings").length) jsSettingsPage();
  if ($("#page-changes").length) jsChangeLogPage();
  if ($("#page-home").length) jsHomePage();
  feather.replace();
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

createNav();
