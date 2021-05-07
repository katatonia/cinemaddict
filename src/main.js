import User from './view/user.js';
import MenuTemplate from './view/menu.js';
import Sort from './view/sort.js';
import MoviesList from './view/movies-list.js';
import MoviesListExtra from './view/movies-list-extra.js';
import { generateFilmCard } from './mock/generate-card.js';
import Popup from './view/popup.js';
import ShowMore from './view/show-more-button.js';
import FooterStatistic from './view/footer-statistic.js';
import { render, RenderPosition, HeadersExtra } from './view/utils/render.js';
import MovieCard from './view/movie-card.js';
import CommentsSection from './view/comment.js';
import ListEmpty from './view/list-empty.js';

const cards = new Array(25).fill().map(generateFilmCard);

const watchedMovies = cards.filter((card) => card.isWatched);
const watchedMoviesCount = watchedMovies.length;
const watchlistMovies = cards.filter((card) => card.isWatchlist);
const watchlistMoviesCount = watchlistMovies.length;
const favoriteMovies = cards.filter((card) => card.isFavorite);
const favoriteMoviesCount = favoriteMovies.length;

const header = document.querySelector('.header');
render(header, RenderPosition.BEFOREEND, new User(watchedMoviesCount));

const main = document.querySelector('.main');
render(main, RenderPosition.BEFOREEND, new MenuTemplate(watchedMoviesCount, watchlistMoviesCount, favoriteMoviesCount));

render(main, RenderPosition.BEFOREEND, new Sort());
render(main, RenderPosition.BEFOREEND, new MoviesList().getElement());

const moviesContainer = document.querySelector('.films');
const moviesListContainer = document.querySelector('.films-list__container');

if (cards.length === 0) {
  render(moviesListContainer, RenderPosition.BEFOREEND, new ListEmpty());
} else {
  const createPopup = (card, element) => {
    const commentsElement = new CommentsSection(card.comments).getElement();
    const popup = new Popup(card);
    const popupElement = popup.getElement(commentsElement);
    const ESC_BUTTON = 'Escape';

    const closePopup = () => {
      element.removeChild(popupElement);
      popup.removeElement();
      document.querySelector('body').classList.remove('hide-overflow');
    };

    popup.setClosePopupClickHandler(() => {
      closePopup();
    });

    const handlerOnEscape = (evt) => {
      if (evt.code === ESC_BUTTON) {
        evt.preventDefault();
        closePopup();
        document.removeEventListener('keydown', handlerOnEscape);
      }
    };

    document.addEventListener('keydown', handlerOnEscape);

    return popupElement;
  };

  const createMovieCardElement = (card) => {
    const movieCard = new MovieCard(card);
    const movieCardElement = movieCard.getElement();

    const body = document.querySelector('body');

    const handleCloseEvent = () => {
      const popupElement = createPopup(card, movieCardElement);
      body.classList.add('hide-overflow');
      movieCardElement.appendChild(popupElement);
    };

    movieCard.setClickHandler(() => {
      handleCloseEvent();
    });

    return movieCard;
  };

  let shownMovieAmount = 0;
  for (let i = 0; i < 5; i++) {
    const movieCardElement = createMovieCardElement(cards[i]);

    render(moviesListContainer, RenderPosition.BEFOREEND, movieCardElement);
    shownMovieAmount++;
  }

  const showMoreButton = new ShowMore();
  render(moviesContainer, RenderPosition.BEFOREEND, showMoreButton);

  showMoreButton.setClickHandler(() => {
    let addedMovies = 0;
    cards
      .slice(shownMovieAmount, shownMovieAmount + 5)
      .forEach((card) => render(moviesListContainer, RenderPosition.BEFOREEND, createMovieCardElement(card)));

    addedMovies++;
    shownMovieAmount += addedMovies;

    if (shownMovieAmount >= cards.length) {
      showMoreButton.remove();
    }
  });

  const extraTopRatedElement = new MoviesListExtra(HeadersExtra.TOP_RATED).getElement();
  render(moviesContainer, RenderPosition.BEFOREEND, extraTopRatedElement);
  const extraMostCommentedElement = new MoviesListExtra(HeadersExtra.MOST_COMMENTED).getElement();
  render(moviesContainer, RenderPosition.BEFOREEND, extraMostCommentedElement);

  const sortedByRate = cards.slice().sort((a, b) => (b.rate - a.rate));
  const sortedByComments = cards.slice().sort((a, b) => (b.comments.length - a.comments.length));
  const fillExtraWithCards = (extraElement, sortedCards) => {
    const container = extraElement.querySelector('.films-list__container');
    for (let j = 0; j < 2; j++) {
      render(container, RenderPosition.BEFOREEND, createMovieCardElement(sortedCards[j]));
    }
  };

  fillExtraWithCards(extraTopRatedElement, sortedByRate);
  fillExtraWithCards(extraMostCommentedElement, sortedByComments);

  const footerStatisticCount = cards.length;
  const footer = document.querySelector('.footer');
  render(footer, RenderPosition.BEFOREEND, new FooterStatistic(footerStatisticCount));
}
