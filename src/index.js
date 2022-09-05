import Notiflix from 'notiflix';
import axios from 'axios';
//import debounce from 'lodash';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const gallery = document.querySelector('.gallery');
const input = document.querySelector('.search_input');
const inputButton = document.querySelector('.search_btn');
const loadMoreButton = document.querySelector('.load-more');

// Właściwości zdjęć i galerii
const API = '29707791-ff65a0300987a99cb660f7261';
const imageType = 'photo';
const orientation = 'horizontal';
const safeSearch = true;

const perPage = 40;
let page = 1;

const lightbox = new SimpleLightbox('.gallery a');


loadMoreButton.setAttribute('hidden', 'hidden');


const fetchImages = async (input, pageNumber) => {
  const URL = `https://pixabay.com/api/?key=${API}&q=${input}&image_type=${imageType}&orientation=${orientation}&safesearch=${safeSearch}&page=${pageNumber}&per_page=${perPage}`;

  const response = await fetch(`${URL}`);
  const responseObject = await response.json();

  loadMoreButton.removeAttribute('hidden');
  return responseObject;
};


const renderImages = images => {
  const markup = images
    .map(image => `
      <div class="photo-card">
        <a href='${image.largeImageURL}'>
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b> ${image.likes}
          </p>
          <p class="info-item">
            <b>Views</b> ${image.views}
          </p>
          <p class="info-item">
            <b>Comments</b> ${image.comments}
          </p>
          <p class="info-item">
            <b>Downloads</b> ${image.downloads}
          </p>
        </div>
      </div>`
    )
    .join('');

  if (page === 1) {
    gallery.innerHTML = markup;
  } else {
    gallery.insertAdjacentHTML('beforeend', markup);
  }
  return page++;
};


inputButton.addEventListener('submit', async event => {
  event.preventDefault();

  page = 1;
  const inputValue = input.value.trim();

  try {
    const array = await fetchImages(inputValue, page);
    const arrayImages = [];

    array.hits.forEach(async image => {
      arrayImages.push(image);
    });

    const total = await array.totalHits;

    if (total > 0) {
      Notiflix.Notify.success(`Hooray! We found ${total} images.`);
    }

    if (total === 0) {
      throw new Error();
    }
    renderImages(arrayImages);
    lightbox.refresh();
  } catch (error) {
    gallery.innerHTML = '';
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
});

loadMoreButton.addEventListener('click', async () => {
  const inputValue = input.value.trim();
  try {
    const array = await fetchImages(inputValue, page);
    const arrayImages = [];

    array.hits.forEach(async image => {
      arrayImages.push(image);
    });
    renderImages(arrayImages);
    lightbox.refresh();
  } catch (error) {
    console.log(error.message);
  }
});