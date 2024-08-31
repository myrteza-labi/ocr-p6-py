window.addEventListener("resize", getWindowWidth);

document.addEventListener("DOMContentLoaded", async function () {
  try {
    await fetchBestMovie();
    await fetchTopRatedMovies();
    await fetchMoviesByCategory("Horror", "category-1-container");
    await fetchMoviesByCategory("Comedy", "category-2-container");
    document
      .getElementById("categories")
      .addEventListener("change", async function (event) {
        const selectedCategory = event.target.value;
        await fetchMoviesByCategory(
          selectedCategory,
          "free-category-container"
        );
      });
  } catch (error) {
    console.error("Error during DOMContentLoaded event handling:", error);
  }
});

function getWindowWidth() {
  const width = window.innerWidth;
  return width;
}

const getDisplayNumber = () => {
  if (getWindowWidth() < 767) {
    return 2;
  } else if (getWindowWidth() > 767 && getWindowWidth() < 959) {
    return 4;
  } else {
    return 6;
  }
};

async function fetchBestMovie() {
  try {
    const response = await fetch(
      "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score"
    );
    const data = await response.json();
    const bestMovie = data.results[0];
    displayBestMovie(bestMovie);
  } catch (error) {
    console.error("Error fetching best movie:", error);
  }
}
const seeMoreBRMButton = document.getElementById("best-movies-see-more-btn");

const handleBRMClick = () => {
  const showAll = seeMoreBRMButton.innerHTML.includes("Voir plus");

  seeMoreBRMButton.innerHTML = showAll ? "Voir moins" : "Voir plus";

  fetchTopRatedMovies(showAll);
};

seeMoreBRMButton.addEventListener("click", handleBRMClick);

async function fetchTopRatedMovies(showAll = false) {
  try {
    const response = await fetch(
      "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score&page=1"
    );
    const data = await response.json();

    const movies = showAll
      ? data.results
      : data.results.slice(0, getDisplayNumber());

    displayMovies(movies, "top-rated-movies-container");
  } catch (error) {
    console.error("Error fetching top rated movies:", error);
  }
}

async function fetchMoviesByCategory(categoryName, containerId) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/titles/?genre=${categoryName}&sort_by=-imdb_score`
    );
    const data = await response.json();
    const movies = data.results.slice(0, getDisplayNumber());
    displayMovies(movies, containerId);
  } catch (error) {
    console.error(`Error fetching movies for category ${categoryName}:`, error);
  }
}

async function displayBestMovie(movie) {
  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/titles/${movie.id}`
    );
    const detailedMovie = await response.json();

    const bestMovieContainer = document.getElementById("best-movie-details");
    bestMovieContainer.innerHTML = `
      <img class="w-full h-[280px]" src="${detailedMovie.image_url}" alt="${detailedMovie.title}">
      <h3 class="text-3xl font-semibold my-[8px] mt-[12px] font-oswald">${detailedMovie.title}</h3>
      <p class="font-oswald font-extralight">${detailedMovie.description}</p>
      <div class="mt-[20px] flex items-center justify-center">
        <button class="w-[90px] h-[40px] font-oswald bg-[#FA0B0B] text-white rounded-3xl" onclick="showMovieDetails(${detailedMovie.id})">Détails</button>
      </div>
    `;
  } catch (error) {
    console.error("Error fetching detailed movie data:", error);
  }
}

function displayMovies(movies, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  movies.forEach((movie) => {
    const movieElement = document.createElement("div");
    movieElement.className = "movie";
    movieElement.innerHTML = `
          <div class="relative">
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

async function showMovieDetails(movieId) {
  alert(getWindowWidth());
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
