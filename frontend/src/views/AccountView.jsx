import { Component } from 'react';
import { API_BASE_URL } from '../api';

export class AccountView extends Component {
  state = { message: '', error: '', isSubmitting: false };

  handleSubmit = async (event) => {
    event.preventDefault();
    this.setState({ message: '', error: '', isSubmitting: true });

    const formData = new FormData(event.currentTarget);
    try {
      //login uses the Express API and session cookie.
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.get('username'),
          password: formData.get('password'),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to log in');
      this.setState({ message: 'Logged in successfully.', isSubmitting: false });
    } catch (error) {
      this.setState({ error: error.message, isSubmitting: false });
    }
  };

  render() {
    const { onGoToCreateAccount } = this.props;
    const { message, error, isSubmitting } = this.state;

    return (
      <div className="container py-3">
        <h2>Log In</h2>
        <form
          className="card bg-dark text-white border-secondary p-3"
          onSubmit={this.handleSubmit}
        >
          <div className="mb-3">
            <label className="form-label" htmlFor="login-username">Username</label>
            <input
              id="login-username"
              className="form-control"
              name="username"
              autoComplete="username"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="form-control"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-light"
            disabled={isSubmitting}
          >
            Log In
          </button>
          <p className="text-secondary mt-3 mb-0">
            Don&apos;t have an account?{' '}
            <button type="button" className="btn btn-link p-0" onClick={onGoToCreateAccount}>
              Create Account
            </button>
          </p>
          {message && <p className="text-success mb-0">{message}</p>}
          {error && <p className="text-danger mb-0">{error}</p>}
        </form>
      </div>
    );
  }
}

export default AccountView;
