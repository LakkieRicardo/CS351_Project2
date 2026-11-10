import { Component } from 'react';

export class CreateAccountView extends Component {
  render() {
    return (
      <div className="container py-3">
        <h2>Create Account</h2>
        <form className="card bg-dark text-white border-secondary p-3">
          <div className="row g-3">
          <div className="col-12">
            <label className="form-label" htmlFor="create-username">Username</label>
            <input
              id="create-username"
              className="form-control"
              name="username"
              autoComplete="username"
              pattern="[A-Za-z0-9_]{3,20}"
              title="Use 3 to 20 letters, numbers, or underscores."
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="create-password">Password</label>
            <input
              id="create-password"
              className="form-control"
              name="password"
              type="password"
              autoComplete="new-password"
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}"
              title="Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number."
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="create-street">Street (optional)</label>
            <input
              id="create-street"
              className="form-control"
              name="street"
              autoComplete="address-line1"
              pattern="[A-Za-z0-9 .,'#-]{3,100}"
              title="Enter a street address between 3 and 100 characters."
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="create-city">City (optional)</label>
            <input
              id="create-city"
              className="form-control"
              name="city"
              autoComplete="address-level2"
              pattern="[A-Za-z .'-]{2,50}"
              title="Enter a city name between 2 and 50 letters."
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="create-state">State (optional)</label>
            <input
              id="create-state"
              className="form-control"
              name="state"
              autoComplete="address-level1"
              pattern="[A-Za-z]{2}"
              title="Enter the two-letter state abbreviation, such as CA."
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="create-zip">ZIP Code (optional)</label>
            <input
              id="create-zip"
              className="form-control"
              name="zip"
              autoComplete="postal-code"
              inputMode="numeric"
              pattern="[0-9]{5}(-[0-9]{4})?"
              title="Enter a 5-digit ZIP code, optionally followed by a 4-digit extension."
            />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="create-email">Email</label>
            <input
              id="create-email"
              className="form-control"
              name="email"
              type="email"
              autoComplete="email"
              pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}"
              title="Enter a valid email address, such as name@example.com."
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="create-phone">Phone (optional)</label>
            <input
              id="create-phone"
              className="form-control"
              name="phone"
              type="tel"
              autoComplete="tel"
              pattern="(\+?1[ .-]?)?(\([0-9]{3}\)|[0-9]{3})[ .-]?[0-9]{3}[ .-]?[0-9]{4}"
              title="Enter a 10-digit US phone number, optionally including +1 and common separators."
            />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-light">Create Account</button>
          </div>
          </div>
        </form>
      </div>
    );
  }
}

export default CreateAccountView;
