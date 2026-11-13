import { Component } from 'react';

export class HomeView extends Component {
  render() {
    return (
      <div className="mt-4">
        <div
          className="home-hero-card position-relative rounded overflow-hidden bg-secondary-subtle text-white d-flex align-items-center justify-content-center text-center"
          style={{ background: 'linear-gradient(135deg, #3F5D4D 0%, #2F4442 100%)' }}
        >
          <div className="position-relative z-1 p-4 home-title-intro">
            <div className="home-hero-title-block">
              <img
                src={`${import.meta.env.BASE_URL}shop-logo.png`}
                alt="Curiosity Shop"
                className="curiosity-shop-logo"
              />
            </div>
            <div className="home-hero-invitation">
              <img
                src={`${import.meta.env.BASE_URL}arrow-sign.png`}
                alt="Come on in"
                className="home-hero-arrow-sign"
              />
              <h1 className="home-hero-invitation-text mb-0">
                The curiosity shop awaits! Don't be caught in the Maelstrom unprepared: buy mystic goods today!
              </h1>
            </div>
          </div>
        </div>
        <article className="home-shopkeeper-testimony">
          <div className="home-broker-text">
            <p className="home-broker-name fw-bold mb-2">Shopkeeper</p>
            <blockquote className="home-broker-testimony-text mb-0">
              "You want hexes? We got hexes! You need bullets? We got bullets! You need a Reuben? Find a deli, because in the Curiosity Shop, we deal in power and tchotchkes!"
            </blockquote>
          </div>
          <img
            src={`${import.meta.env.BASE_URL}broker.png`}
            alt="Shopkeeper"
            className="home-broker-image"
          />
        </article>
      </div>
    );
  }
}

export default HomeView;
