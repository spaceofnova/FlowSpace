import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

var mobile = /iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(
  navigator.userAgent.toLowerCase(),
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
          data.id ? JSON.stringify(data.id) : "notLoggedIn",
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
    return;
  }
  // fetch("/js/apps.json")
  //   .then((response) => response.json())
  //   .then((games) => {
  //     const gamesByCategory = games.reduce((acc, game) => {
  //       if (!acc[game.catg]) {
  //         acc[game.catg] = [];
  //       }
  //       acc[game.catg].push(game);
  //       return acc;
  //     }, {});

  //     Object.keys(gamesByCategory).forEach((catg) => {
  //       let categoryElement = $(`.applist .category-${catg}`);
  //       if (categoryElement.length === 0) {
  //         categoryElement = $(`<fieldset class="category category-${catg}">
  //                                       <legend>${catg}</legend>
  //                                       <div class="games-container"></div>
  //                                   </fieldset>`);
  //         $(".applist").append(categoryElement);
  //       }

  //       const gameElements = gamesByCategory[catg].map((game) => {
  //         return $(`<div class="gameElement">
  //                           <img src="${game.icon}" class="gameIcon">
  //                           <div class="gameOpt">
  //                               <div class="gameName">${game.name}</div>
  //                               <button class="gamePlay" onclick="swup.navigate('/app?id=${game.id}')">Play</button>
  //                           </div>
  //                       </div>`);
  //       });

  //       categoryElement.find(".games-container").empty().append(gameElements);
  //     });
  //   });
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

function jsChangeLogPage() {
  fetch("changelog.md")
    .then((response) => response.text())
    .then((textString) => {
      document.getElementById("content").innerHTML = marked.parse(textString);
    });
}

function init() {
  const installBtn = document.querySelector("#learnmore");

  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can add to home screen
    installBtn.style.display = "inline-block";
  });

  installBtn.addEventListener("click", (e) => {
    // hide our user interface that shows our A2HS button
    installBtn.style.display = "none";
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        console.log("User dismissed the A2HS prompt");
      }
      deferredPrompt = null;
    });
  });
  
  feather.replace();
  if ($("#page-apps").length) jsAppsPage();
  if ($("#page-applaunch").length) appLauncher();
  if ($("#page-settings").length) jsSettingsPage();
  if ($("#page-changes").length) jsChangeLogPage();

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
          "It seems you have GoGuardian installed. Would you like to enter hidden mode?",
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
    "Stay safe online!",
);
