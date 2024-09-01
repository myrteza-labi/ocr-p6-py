document.addEventListener("DOMContentLoaded", async function () {
  await fetchBestMovie();
  await populateCategories();

  document
    .getElementById("categories")
    .addEventListener("change", async function () {
      const selectedCategory = this.value;
      if (selectedCategory) {
        await handleCategoryChange(selectedCategory);
      }
    });

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
        <div class="movies-container md:flex md:flex-wrap md:justify-between" id="${category.containerId}"></div>
        <div
          id="${category.id}-see-more-btn-ctn"
          class="mt-[20px] flex items-center justify-center"
        >
          <button
            id="${category.id}-see-more-btn"
            class="w-[214px] h-[40px] font-oswald bg-[#FA0B0B] text-white rounded-3xl md:mb-[30px]"
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

async function handleCategoryChange(categoryName) {
  const container = document.getElementById("free-category-container");
  container.innerHTML = "";
  await fetchMovies({
    categoryName: categoryName,
    containerId: "free-category-container",
  });

  let seeMoreButtonContainer = document.getElementById(
    "free-category-see-more-btn-ctn"
  );

  if (!seeMoreButtonContainer) {
    seeMoreButtonContainer = document.createElement("div");
    seeMoreButtonContainer.className =
      "mt-[20px] flex items-center justify-center";
    seeMoreButtonContainer.id = "free-category-see-more-btn-ctn";
    container.parentNode.appendChild(seeMoreButtonContainer);
  }

  seeMoreButtonContainer.innerHTML = `
    <button
      id="free-category-see-more-btn"
      class="w-[214px] h-[40px] font-oswald bg-[#FA0B0B] text-white rounded-3xl"
    >
      Voir plus
    </button>
  `;

  const seeMoreButton = document.getElementById("free-category-see-more-btn");
  seeMoreButton.addEventListener("click", () =>
    handleSeeMoreClick({
      categoryName: categoryName,
      containerId: "free-category-container",
    })
  );
}

const handleSeeMoreClick = async (category) => {
  const seeMoreButton =
    document.getElementById(`${category.containerId}-see-more-btn`) ||
    document.getElementById("free-category-see-more-btn");

  if (!seeMoreButton) {
    console.error("Bouton 'Voir plus' introuvable pour:", category.containerId);
    return;
  }

  const showAll = seeMoreButton.innerHTML.includes("Voir plus");

  seeMoreButton.innerHTML = showAll ? "Voir moins" : "Voir plus";

  await fetchMovies({
    categoryName: category.categoryName,
    containerId: category.containerId,
    showAll: showAll,
  });
};

async function fetchCategories() {
  const fetchedCategories = [];
  let url = "http://localhost:8000/api/v1/genres/";

  while (url) {
    try {
      const response = await fetch(url);
      const data = await response.json();

      data.results.forEach((category) => {
        fetchedCategories.push(category.name);
      });

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

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    selectCategoriesCtn.appendChild(option);
  });
}

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
      <div class="relative mb-[50px] md:w-[350px] md:h-[285px]">
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
    <img class="md:w-auto md:h-auto w-full h-[280px]" src="${movie.image_url}" alt="${movie.title}">
    <div class="md:ml-[30px]">
      <h3 class="text-3xl font-semibold my-[8px] mt-[12px] font-oswald">${movie.title}</h3>
      <p class="font-oswald font-extralight">${movie.description}</p>
    </div>
    <div class="mt-[20px] flex items-center justify-center md:items-end">
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
      <h2 class="text-3xl font-oswald font-bold pb-[6px]">
        ${movie.title}
      </h2>
      <div class="mb-[30px]">
        <p class="font-bold">${movie.year} - ${movie.genres.join(", ")}</p>
        <p class="font-bold">IMBD score: ${movie.imdb_score}/10</p>
      </div>

      <p class="font-medium">Réalisé par:</p>
      <p class="mb-[15px] font-extralight">${movie.directors.join(", ")}</p>

      <p class="mb-[25px] font-extralight">${movie.description}</p>

      <img class="w-full" src="${movie.image_url}" alt="${movie.title}">

      <p class="font-medium mt-[20px]">Avec:</p>
      <p class="font-extralight">${movie.actors.join(", ")}</p>

      <button class="absolute top-[30px] right-[30px]" onclick="closeModal()">
        <img width="30px" height="30px" src="src/close.png" alt="Bouton fermer"/>
      </button>
    `;
    document.body.classList.add("overflow-hidden");
    modal.classList.remove("hidden");
  } catch (error) {
    console.error("Error fetching movie details:", error);
  }
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
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
