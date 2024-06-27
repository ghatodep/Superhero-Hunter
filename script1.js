/* 
App Name  : Superhero Hunter Web App
Developer : Pushpak Ghatode
Date      : 20 June 2024
*/

// global variables and constants
// to store data
let allHeroData = {};
let myFavHeroes = {};
let gData;

// HTML elements from DOM
const bodyElement = document.querySelector("body");
const allHeroesHomePage = document.getElementById("all-heroes");
const searchResultsHomePage = document.getElementById("search-result");
const myFavSuperheroPage = document.getElementById("my-fav-superhero-page");
const myFavSuperheroPageBtn = document.getElementById(
  "my-fav-superhero-page-btn"
);
const superheroPageElement = document.getElementById("superhero-page");
const pageNameHeaderElement = document.querySelector("#page-name h2");

// function to generate proper URL using API credentials and timestamps
function generateURL(offset = 0, nameStartsWith = "") {
  let myTs = Date.now().toString();
  let myHashValue = CryptoJS.MD5(
    `${
      myTs +
      "e0fa170760397f283ea170d3cef02d8cefea4776" +
      "30637a5f27bc581512b827605b5102d1"
    }`
  ).toString();

  let url;
  if (nameStartsWith)
    url = `https://gateway.marvel.com:443/v1/public/characters?limit=50&ts=${myTs}&apikey=30637a5f27bc581512b827605b5102d1&hash=${myHashValue}&offset=${offset}&nameStartsWith=${nameStartsWith}`;
  else
    url = `https://gateway.marvel.com:443/v1/public/characters?limit=50&ts=${myTs}&apikey=30637a5f27bc581512b827605b5102d1&hash=${myHashValue}&offset=${offset}`;
  return url;
}

// function to fetch data from API links given by url
async function getData(url) {
  try {
    const req = await fetch(url);
    if (!req.ok) {
      throw new Error(`Data not received - ${req.url}`);
    }
    const data = await req.json();
    return data;
  } catch (err) {
    console.log(err);
  }
}

// to create a list item for the list of heroes or search result section.
function generateHeroTile(heroData, containerNode = allHeroesHomePage) {
  let myHtml = `
  <div class="list-tl" id="${"tile-" + containerNode.id + heroData["id"]}">
	  <img src="${
      heroData["thumbnail"]["path"] + "." + heroData["thumbnail"]["extension"]
    }"/>
	  <span class="tl-hero-name">${heroData["name"]}</span>
	  <span class="tl-fav-btn">
	    <input type="checkbox" id="${containerNode.id + heroData["id"]}" ${
    heroData["id"] in myFavHeroes ? "checked" : ""
  }/>
	    <label for="${
        containerNode.id + heroData["id"]
      }"><i class="fa-solid fa-heart"></i></label>
	  </span>
  </div>
  `;

  containerNode.insertAdjacentHTML("beforeend", myHtml);

  // event listener on heart icon of the hero tile to add hero as favorite hero
  const toggleFavBtn = document.getElementById(
    `${containerNode.id + heroData["id"]}`
  );
  toggleFavBtn.addEventListener("change", (event) => {
    if (toggleFavBtn.checked) {
      if (!(heroData["id"] in myFavHeroes)) {
        myFavHeroes[heroData["id"]] = heroData;
      }
    } else {
      delete myFavHeroes[heroData["id"]];
      // to remove hero from favorite page
      if (containerNode == myFavSuperheroPage) {
        document
          .getElementById(`tile-${containerNode.id + heroData["id"]}`)
          .remove();
        document.getElementById(`fav-heroes-count`).textContent = `${
          Object.values(myFavHeroes).length
        } Heroes marked as favorite !`;
      }
      document.getElementById(
        `${allHeroesHomePage.id + heroData["id"]}`
      ).checked = false;
    }
    console.log("Add to fav ?", toggleFavBtn.checked, heroData["id"]);
  });

  // event listener on image and name of the hero to open a individual superhero page
  const superHeroPage = function (event) {
    console.log(
      `Open a individual super hero page for : ${heroData["id"]}_${heroData["name"]}`
    );
    updatePageName(superheroPageElement);
    superheroPageElement.style.display = "flex";
    myFavSuperheroPage.style.display = "none";
    allHeroesHomePage.style.display = "none";
    searchResultsHomePage.style.display = "none";

    // hero image is added
    document.querySelector("#hero-image-container img").src =
      heroData["thumbnail"]["path"] + "." + heroData["thumbnail"]["extension"];

    // adding hero name on the page
    document.getElementById("hero-name").textContent = heroData["name"];

    // adding hero description on the page
    if (heroData["description"])
      document.getElementById("hero-desc").textContent =
        heroData["description"];
    else
      document.getElementById("hero-desc").textContent =
        "No description available for this hero.";

    // close button functionality
    document.getElementById("close-info").addEventListener("click", () => {
      console.log(
        `closing the individual superhero page and taking you to previous page -> ${containerNode.id}`
      );
      superheroPageElement.style.display = "none";
      myFavSuperheroPage.style.display = "none";
      allHeroesHomePage.style.display = "none";
      searchResultsHomePage.style.display = "none";
      containerNode.style.display = "flex";
      updatePageName(containerNode);
    });

    // updating comics details
    const displayTheseDetails = function (tag, parentElement) {
      for (let com of heroData[tag]["items"]) {
        let liElement = document.createElement("li");
        liElement.textContent = com["name"];
        parentElement.append(liElement);
      }
    };

    displayTheseDetails("comics", document.getElementById("comic-names"));
    displayTheseDetails("series", document.getElementById("series-names"));
    displayTheseDetails("stories", document.getElementById("stories-names"));
  };

  document
    .querySelector(`#tile-${containerNode.id + heroData["id"]} img`)
    .addEventListener("click", superHeroPage);

  document
    .querySelector(`#tile-${containerNode.id + heroData["id"]} .tl-hero-name`)
    .addEventListener("click", superHeroPage);
}

// function to process API raw data
function processAPIData(rawData, containerNode) {
  for (let hero of rawData) {
    if (!(hero["id"] in allHeroData)) {
      allHeroData[hero["id"]] = hero;
    }
    generateHeroTile(hero, containerNode);
  }
}

// function to update the page name to which user is navigating to.
function updatePageName(containerPage) {
  if (containerPage == allHeroesHomePage) {
    pageNameHeaderElement.firstChild.textContent = "All Heroes List";
  } else if (containerPage == searchResultsHomePage) {
    pageNameHeaderElement.firstChild.textContent = "Search Results";
  } else if (containerPage == myFavSuperheroPage) {
    pageNameHeaderElement.firstChild.textContent = "My Favorite Superheroes";
  } else if (containerPage == superheroPageElement) {
    pageNameHeaderElement.firstChild.textContent = "Superhero Detailed";
  }
}

// function to start the execution
function startup() {
  console.log("Let us start !");

  // querying the API for initial hero list
  getData(generateURL())
    .then((data) => {
      processAPIData(data["data"]["results"]);
      return data["data"];
    })
    .then((data) => {
      // functionality to add a button so that we can load more data from API as we click on it.
      gData = data;
      let remaining = data["total"] - data["offset"];
      console.log(
        `Displaying ${data["offset"] + data["count"]} of total ${data["total"]}`
      );
      if (remaining >= data["count"]) {
        const loadMoreBtn = document.createElement("button");
        loadMoreBtn.id = "load-more-btn";
        loadMoreBtn.innerHTML = `Displaying <span>${
          data["offset"] + data["count"]
        }</span>, <span class="blue">Click Here</span> to load next <span>${
          remaining >= 50 ? 50 : remaining
        }</span> of <span>${data["total"]}</span>`;
        loadMoreBtn.addEventListener("click", () => {
          loadMoreBtn.remove();
          bodyElement.style.pointerEvents = "none";
          console.log(`Loading more data...`);
          getData(generateURL(gData["offset"] + gData["count"])).then(
            (data) => {
              processAPIData(data["data"]["results"]);
              gData = data["data"];
              console.log(gData);
              let rem = gData["total"] - gData["offset"];
              loadMoreBtn.innerHTML = `Displaying <span>${
                gData["offset"] + gData["count"]
              }</span>, <span class="blue">Click Here</span> to load next <span>${
                rem >= 50 ? 50 : rem
              }</span> of <span>${gData["total"]}</span>`;
              console.log(
                `Displaying ${gData["offset"] + gData["count"]} of total ${
                  gData["total"]
                }`
              );
              allHeroesHomePage.append(loadMoreBtn);
              bodyElement.style.pointerEvents = "auto";
            }
          );
        });
        allHeroesHomePage.append(loadMoreBtn);
      }
    });

  // navigation button - home page button functionality
  const homeBtn = document.getElementById("home-btn");
  homeBtn.addEventListener("click", () => {
    allHeroesHomePage.style.display = "flex";
    superheroPageElement.style.display = "none";
    searchResultsHomePage.style.display = "none";
    myFavSuperheroPage.style.display = "none";
    searchResultsHomePage.innerHTML = "";
    updatePageName(allHeroesHomePage);
  });

  // navigation button - my favorite super hero page button functionality
  myFavSuperheroPageBtn.addEventListener("click", () => {
    updatePageName(myFavSuperheroPage);
    superheroPageElement.style.display = "none";
    allHeroesHomePage.style.display = "none";
    searchResultsHomePage.style.display = "none";
    myFavSuperheroPage.style.display = "flex";
    myFavSuperheroPage.innerHTML = "";
    let resultsFound = document.createElement("h3");
    resultsFound.id = "fav-heroes-count";
    resultsFound.className = "count-display";
    resultsFound.innerHTML = `<span>${
      Object.values(myFavHeroes).length
    }</span> Heroes marked as favorite !`;
    myFavSuperheroPage.appendChild(resultsFound);
    for (let heroId in myFavHeroes) {
      generateHeroTile(myFavHeroes[heroId], myFavSuperheroPage);
    }
  });

  // search button functionality
  const searchBtn = document.getElementById("search-submit");
  const searchInput = document.getElementById("search-text");

  searchBtn.addEventListener("click", () => {
    let searchText = searchInput.value;
    if (searchText) {
      updatePageName(searchResultsHomePage);
      console.log(`To be searched - [${searchText}]`);
      searchInput.value = "";
      // querying the API for results
      getData(generateURL(0, searchText)).then((data) => {
        allHeroesHomePage.style.display = "none";
        myFavSuperheroPage.style.display = "none";
        superheroPageElement.style.display = "none";
        searchResultsHomePage.innerHTML = "";
        searchResultsHomePage.style.display = "flex";
        console.log(
          "search results -> ",
          data["data"]["count"],
          data["data"]["results"]
        );
        let resultsFound = document.createElement("h3");
        resultsFound.className = "count-display";
        if (data["data"]["count"]) {
          processAPIData(data["data"]["results"], searchResultsHomePage);
          resultsFound.innerHTML = `<span>${data["data"]["count"]}</span> results found for "<span>${searchText}</span>".`;
        } else {
          resultsFound.innerHTML = `No Matching Results Found for "<span>${searchText}</span>"!`;
        }
        searchResultsHomePage.insertBefore(
          resultsFound,
          searchResultsHomePage.firstChild
        );
      });
    } else {
      alert("Enter a name of the hero to search!");
    }
  });
}

// execution of script
startup();
