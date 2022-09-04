import './sass/index.scss';
import Notiflix from 'notiflix';
import simpleLightbox from 'simplelightbox';
import axios from 'axios';
axios.defaults.baseURL = 'https://pixabay.com/api/';

const form = document.querySelector('form#search-form');
const gallery = document.querySelector('div.gallery');
const loadMoreButton = document.querySelector('button.load-more');

form.addEventListener('submit', searchImage);
loadMoreButton.addEventListener('click', loadMoreImages);

// Zmienne

let API_Pixabay = '29707791-ff65a0300987a99cb660f7261';
let page = 1;
const perPage = 40;
let lightbox = new simpleLightbox('.gallery a')

// Funkcje

async function getImages(search, page, perPage) {
    const response = await axios.get(`?key=${API_Pixabay}&q=${search}&image_type=photo&orientation=horizontal&safeSearch=true&page=${page}&per_page=${perPage}`);
    return response;
}

function clear() {
    gallery.innerHTML = '';
}

function searchImage(event) {
    event.preventDefault();
    query = event.currentTarget.searchQuery.value.trim();
    loadMoreButton.classList.add('is-hidden');
    clear();
    if (!query) {
        Notiflix.Notify.info('');
        return;
    }

    getImages(query, page, perPage)
        .then(({ data }) => {
        if (!data.totalHits) {
            Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again');
        }
        else {
            renderGallery(data.hits);
            ligthbox.refresh();
            Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
            if (data.totalHits > perPage) {
                loadMoreButton.classList.remove('is-hidden');
            }
        }
        })
        .catch(error => console.log(error))
};

function loadMoreImages() {
    page++;
    getImages(query, page, perPage)
        .then(({ data }) => {
            renderGallery(data.hits);
                lightbox.refresh();
            const allPages = Math.ceil(data.hits / perPage);

                if (page > allPages) {
                    loadMoreButton.classList.add('is-hidden');
                    Notiflix.Notify.failure(`We're sorry, but you've reached the end of search results.`);
                }
    })
    .catch(error => console.log(error));
}

//

function renderGallery(data) {
    const markup = data
        .map(
            ({
                webformatURL,
                largeImageURL,
                tags,
                likes,
                views,
                comments,
                downloads,
            }) => {return `
                    <div class="photo-card">
                        <a href="${largeImageURL}"> <img src="${webformatURL}" alt="${tags}" loading="lazy" title=""/></a>
                        <div class="info">
                            <p class="info-item">
                                <b>Likes</b>${likes}</p>
                            <p class="info-item">
                                <b>Views</b>${views}</p>
                            <p class="info-item">
                                <b>Comments</b>${comments}</p>
                            <p class="info-item">
                                <b>Downloads</b>${downloads}</p>
                        </div>
                    </div>`;
            }
        )
    .join('');

    gallery.insertAdjacentHTML('beforeend', markup);
}