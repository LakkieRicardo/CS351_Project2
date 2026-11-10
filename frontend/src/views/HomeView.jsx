import { Component } from 'react';

export class HomeView extends Component {
  render() {
    return (
      <div className="mt-4">
        <div
          className="position-relative rounded overflow-hidden bg-secondary-subtle text-white d-flex align-items-center justify-content-center text-center"
          style={{ minHeight: '420px', background: 'linear-gradient(135deg, #2d2d2d 0%, #6c757d 100%)' }}
        >
          <div className="position-relative z-1 p-4 home-title-intro">
            <div className="home-hero-title-block">
              <img
                src={`${import.meta.env.BASE_URL}shop-logo.png`}
                alt="Curiosity Shop"
                className="curiosity-shop-logo"
              />
            </div>
            <p className="lead mb-0 mt-4">Mystic items for fighting, staying alive, and raising your spirits.</p>
          </div>
        </div>
        <div className="home-rem-callout">
          <div className="home-rem-text">
            <p className="home-rem-name fw-bold mb-2">Rem</p>
            <p className="home-rem-placeholder mb-0">
              Click on the shop button to begin looking through our catalog!
            </p>
          </div>
          <img
            src={`${import.meta.env.BASE_URL}rem-profile.png`}
            alt="Rem"
            className="home-rem-image"
          />
        </div>
      </div>
    );
  }
}

export default HomeView;
