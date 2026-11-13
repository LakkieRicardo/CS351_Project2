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
        <div className="home-broker-callout">
          <div className="home-broker-text">
            <p className="home-broker-name fw-bold mb-2">Shopkeeper</p>
            <p className="home-broker-placeholder mb-0">
              Click on the shop button to begin looking through our catalog!
            </p>
          </div>
          <img
            src={`${import.meta.env.BASE_URL}broker.png`}
            alt="broker"
            className="home-broker-image"
          />
        </div>
      </div>
    );
  }
}

export default HomeView;
