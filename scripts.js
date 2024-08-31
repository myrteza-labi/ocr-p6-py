document.addEventListener("DOMContentLoaded", async function () {
  await fetchBestMovie();

  async function fetchCategories() {
    const fetchedCategories = [];
    let url = "http://localhost:8000/api/v1/genres/";

    while (url) {
      try {
        const response = await fetch(url);
        const data = await response.json();

        // Ajouter les catégories récupérées à notre tableau
        data.results.forEach((category) => {
          fetchedCategories.push(category.name);
        });

        // Mettre à jour l'URL pour la prochaine page
        url = data.next;
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
        break;
      }
    }

    return fetchedCategories;
  }

  async function populateCategories() {
    const selectCategoriesCtn = document.getElementById("categories");
    const categories = await fetchCategories();

    // Ajouter les catégories récupérées dans le <select>
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      selectCategoriesCtn.appendChild(option);
    });
  }

  // Appeler la fonction pour peupler les catégories
  populateCategories();

  const categories = [
    {
      id: "top-rated-movies",
      title: "Films les Mieux Notés",
      containerId: "top-rated-movies-container",
      isTopRated: true,
    },
    {
      id: "category-1",
      title: "Horror",
      containerId: "category-1-container",
      categoryName: "Horror",
    },
    {
      id: "category-2",
      title: "Comedy",
      containerId: "category-2-container",
      categoryName: "Comedy",
    },
  ];

  const sectionsContainer = document.getElementById("sections-container");

  categories.forEach(async (category) => {
    const sectionHTML = `
      <section id="${category.id}">
        <h2 class="text-center text-3xl font-oswald font-bold pb-[13px]">
          ${category.title}
        </h2>
        <div class="movies-container" id="${category.containerId}"></div>
        <div
          id="${category.id}-see-more-btn-ctn"
          class="mt-[20px] flex items-center justify-center"
        >
          <button
            id="${category.id}-see-more-btn"
            class="w-[214px] h-[40px] font-oswald bg-[#FA0B0B] text-white rounded-3xl"
          >
            Voir plus
          </button>
        </div>
      </section>
    `;
    sectionsContainer.insertAdjacentHTML("beforeend", sectionHTML);

    const seeMoreButton = document.getElementById(
      `${category.id}-see-more-btn`
    );
    seeMoreButton.addEventListener("click", () => handleSeeMoreClick(category));

    await fetchMovies({
      categoryName: category.categoryName,
      containerId: category.containerId,
      isTopRated: category.isTopRated,
    });
  });
});

const handleSeeMoreClick = (category) => {
  const seeMoreButton = document.getElementById(`${category.id}-see-more-btn`);
  const showAll = seeMoreButton.innerHTML.includes("Voir plus");

  seeMoreButton.innerHTML = showAll ? "Voir moins" : "Voir plus";

  fetchMovies({
    categoryName: category.categoryName,
    containerId: category.containerId,
    showAll: showAll,
    isTopRated: category.isTopRated,
  });
};

async function fetchMovies({
  categoryName = "",
  containerId,
  showAll = false,
  isTopRated = false,
} = {}) {
  try {
    let url = `http://localhost:8000/api/v1/titles/?sort_by=-imdb_score`;
    if (categoryName) {
      url += `&genre=${categoryName}`;
    }
    if (isTopRated) {
      url += `&page=1`;
    }

    const response = await fetch(url);
    const data = await response.json();

    const movies = showAll
      ? data.results
      : data.results.slice(0, getDisplayNumber());
    displayMovies(movies, containerId);
  } catch (error) {
    console.error(`Error fetching movies:`, error);
  }
}

async function fetchBestMovie() {
  try {
    const response = await fetch(
      "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score"
    );
    const data = await response.json();
    const bestMovie = data.results[0];
    const detailsResponse = await fetch(
      `http://localhost:8000/api/v1/titles/${bestMovie.id}`
    );
    const detailedMovie = await detailsResponse.json();

    displayBestMovie(detailedMovie);
  } catch (error) {
    console.error("Error fetching best movie:", error);
  }
}

function displayMovies(movies, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  movies.forEach((movie) => {
    const movieElement = document.createElement("div");
    movieElement.className = "movie";
    movieElement.innerHTML = `
      <div class="relative mb-[50px]">
        <div class="w-full absolute h-[130px] bg-black bg-opacity-50 mt-[42px]">
          <p class="text-white font-oswald font-semibold text-2xl mt-[25px] ml-[30px]">${movie.title}</p>
          <div class="flex items-right justify-end pr-[20px] mt-[20px]">
            <button class="bg-[#2D2C2C] font-light h-[32px] min-h-[32px] text-sm w-[105px] min-w-[105px] rounded-3xl text-white font-oswald">Détails</button>
          </div>
        </div>
        <img class="w-full max-h-[318px]" src="${movie.image_url}" alt="${movie.title}">
      </div>
    `;
    movieElement.addEventListener("click", () => showMovieDetails(movie.id));
    container.appendChild(movieElement);
  });
}

async function displayBestMovie(movie) {
  const bestMovieContainer = document.getElementById("best-movie-details");
  bestMovieContainer.innerHTML = `
    <img class="w-full h-[280px]" src="${movie.image_url}" alt="${movie.title}">
    <h3 class="text-3xl font-semibold my-[8px] mt-[12px] font-oswald">${movie.title}</h3>
    <p class="font-oswald font-extralight">${movie.description}</p>
    <div class="mt-[20px] flex items-center justify-center">
      <button class="w-[90px] h-[40px] font-oswald bg-[#FA0B0B] text-white rounded-3xl" onclick="showMovieDetails(${movie.id})">Détails</button>
    </div>
  `;
}

async function showMovieDetails(movieId) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/titles/${movieId}`
    );
    const movie = await response.json();
    const modal = document.getElementById("modal");
    modal.innerHTML = `
      <img src="${movie.image_url}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>Genre: ${movie.genres.join(", ")}</p>
      <p>Date de sortie: ${movie.year}</p>
      <p>IMDB Score: ${movie.imdb_score}</p>
      <p>Réalisateur: ${movie.directors.join(", ")}</p>
      <p>Acteurs: ${movie.actors.join(", ")}</p>
      <p>Durée: ${movie.duration} minutes</p>
      <p>Pays: ${movie.country}</p>
      <p>Recettes: ${movie.worldwide_gross_income}</p>
      <p>${movie.description}</p>
      <button onclick="closeModal()">Fermer</button>
    `;
    modal.style.display = "block";
  } catch (error) {
    console.error("Error fetching movie details:", error);
  }
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

function getDisplayNumber() {
  const width = window.innerWidth;
  if (width < 767) {
    return 2;
  } else if (width > 767 && width < 959) {
    return 4;
  } else {
    return 6;
  }
}

window.addEventListener("resize", getDisplayNumber);
