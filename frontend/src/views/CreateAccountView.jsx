import { Component } from 'react';
import { API_BASE_URL } from '../api';

export class CreateAccountView extends Component {
  state = { message: '', error: '', isSubmitting: false };

  handleSubmit = async (event) => {
    event.preventDefault();
    this.setState({ message: '', error: '', isSubmitting: true });
    const form = event.currentTarget;
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());

    try {
      // send account data to Express for server validation.
      const response = await fetch(`${API_BASE_URL}/api/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to create account');
      form.reset();
      this.setState({ message: data.message, isSubmitting: false });
    } catch (error) {
      this.setState({ error: error.message, isSubmitting: false });
    }
  };

  render() {
    const { message, error, isSubmitting } = this.state;
    return (
      <div className="container py-3 account-view-content">
        <h2>Create Account</h2>
        <form className="card bg-dark text-white border-secondary p-3" onSubmit={this.handleSubmit}>
          <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="create-first-name">First Name</label>
            <input id="create-first-name" className="form-control" name="firstName" autoComplete="given-name" pattern="[A-Za-z .'-]{2,50}" required />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="create-last-name">Last Name</label>
            <input id="create-last-name" className="form-control" name="lastName" autoComplete="family-name" pattern="[A-Za-z .'-]{2,50}" required />
          </div>
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
            <label className="form-label" htmlFor="create-street">Street</label>
            <input
              id="create-street"
              className="form-control"
              name="street"
              autoComplete="address-line1"
              pattern="[A-Za-z0-9 .,'#-]{3,100}"
              title="Enter a street address between 3 and 100 characters."
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="create-city">City</label>
            <input
              id="create-city"
              className="form-control"
              name="city"
              autoComplete="address-level2"
              pattern="[A-Za-z .'-]{2,50}"
              title="Enter a city name between 2 and 50 letters."
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="create-state">State</label>
            <input
              id="create-state"
              className="form-control"
              name="state"
              autoComplete="address-level1"
              pattern="[A-Za-z]{2}"
              title="Enter the two-letter state abbreviation, such as CA."
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="create-zip">ZIP Code</label>
            <input
              id="create-zip"
              className="form-control"
              name="zip"
              autoComplete="postal-code"
              inputMode="numeric"
              pattern="[0-9]{5}(-[0-9]{4})?"
              title="Enter a 5-digit ZIP code, optionally followed by a 4-digit extension."
              required
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
            <label className="form-label" htmlFor="create-phone">Phone</label>
            <input
              id="create-phone"
              className="form-control"
              name="phone"
              type="tel"
              autoComplete="tel"
              pattern="(\+?1[ .-]?)?(\([0-9]{3}\)|[0-9]{3})[ .-]?[0-9]{3}[ .-]?[0-9]{4}"
              title="Enter a 10-digit US phone number, optionally including +1 and common separators."
              required
            />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-light login-button" disabled={isSubmitting}>Create Account</button>
            {message && <p className="text-success mb-0">{message}</p>}
            {error && <p className="text-danger mb-0">{error}</p>}
          </div>
          </div>
        </form>
      </div>
    );
  }
}

export default CreateAccountView;
