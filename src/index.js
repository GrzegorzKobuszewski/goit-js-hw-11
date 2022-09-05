import './css/styles.css';
import axios from 'axios';
import Notiflix from 'notiflix';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

//axios.defaults.baseURL = 'https://pixabay.com/api/';

// Zmienne DOM
const form = document.querySelector('form#search-form');
const gallery = document.querySelector('div.gallery');
const searchButton = document.querySelector(`button[type="submit"]`);
//const searchButton = document.querySelector(".search-button");
const loadMoreButton = document.querySelector('button.load-more');
//const loadMoreButton = document.querySelector('.load-more');

form.addEventListener('submit', searchImage);
loadMoreButton.addEventListener('click', loadMoreImages);

// Zmienne
const API_KEY = '29707791-ff65a0300987a99cb660f7261';
const per_page = 40;
let page = 1;
let query = '';
let lightbox = new simpleLightbox('.gallery a');

// const URL = 'https://pixabay.com/api/'


const fetchPixabay = async (query, page) => {
    const response = await axios.get(`https://pixabay.com/api/?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&per_page=${per_page}&page=${page}`)
    return response;
};


function renderItems(images) {
    let markup = images
        .map(image => {
            const { id, largeImageURL, webformatURL, tags, likes, views, comments, downloads } = image
      
    return `<a class="img_card" href='${largeImageURL}'> 
              <div class="photo-card" id= "${id}"> 
                <img class="image" src="${webformatURL}" alt="${tags}" loading="lazy" /> 
              <div class="info">
                <p class="info-item">
                  <b>likes</b>${likes}
                </p>
                <p class="info-item">
                  <b>views</b>${views}
                </p>
                <p class="info-item">
                  <b>comments</b>${comments}
                </p>
                <p class="info-item">
                  <b>downloads</b>${downloads}
                </p>
              </div>
            </div>
          </a>`
})
    .join("");
    gallery.insertAdjacentHTML('beforeend', markup);
}

loadMoreButton.addEventListener('click', onloadMoreButton)
form.addEventListener('submit', searchForm)


async function searchForm(e) {
  try { 
    e.preventDefault();
    page = 1;
    query = e.currentTarget.searchQuery.value.trim();
    
    if (query === '') {
      Notiflix.Notify.failure(`Oops, the search input cannot be empty`)
    return;
    }
    gallery.innerHTML = '';
    loadMoreButton.classList.add('is-hidden');

    const images = await fetchPixabay(query, page);
    const data = images.data;

    if (data.totalHits === 0) {
      Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.")
    } else {
      renderItems(data.hits);
      lightbox.refresh();
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      onSearchNotification(data);
  }
} 
  catch (error) {
    gallery.innerHTML = '';
    console.log(error);
  }
}


async function onloadMoreButton() {
  page++;
  try {
    const images = await fetchPixabay(query, page);
    const data = images.data;
    renderItems(data.hits);
    lightbox.refresh();
    onSearchNotification(data)
    loadMoreButton.classList.add('is-hidden');
  }
  catch(error) {
    console.log(error)
  }
}


function onSearchNotification(data) {

  const totalPages = Math.ceil(data.totalHits / per_page);

  if (page >= totalPages) {
    loadMoreButton.classList.add('is-hidden');
    Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.")
    return
  }
  
  if (data.totalHits === 0) {
    Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.')
  }

  window.onscroll = function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      // you're at the bottom of the page
      console.log('end of page')
      loadMoreButton.classList.remove('is-hidden')
    } else {
      loadMoreButton.classList.add('is-hidden')
    }
  }
}

