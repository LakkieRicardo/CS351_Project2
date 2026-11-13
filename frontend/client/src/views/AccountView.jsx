import { Component } from 'react';
import { API_BASE_URL } from '../api';

export class AccountView extends Component {
  state = {
    user: null,
    isLoadingAccount: true,
    message: '',
    error: '',
    isSubmitting: false,
    isLoggingOut: false,
  };

  componentDidMount() {
    this.loadAccount();
  }

  loadAccount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/account`, { credentials: 'include' });
      if (response.status === 401) {
        this.setState({ isLoadingAccount: false });
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load account');
      this.setState({ user: data.user, isLoadingAccount: false, error: '' });
    } catch (error) {
      this.setState({ isLoadingAccount: false, error: error.message });
    }
  };

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
      this.setState({
        user: data.user,
        message: 'Logged in successfully.',
        isSubmitting: false,
      });
    } catch (error) {
      this.setState({ error: error.message, isSubmitting: false });
    }
  };

  handleLogout = async () => {
    this.setState({ error: '', isLoggingOut: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to log out');
      this.setState({
        user: null,
        message: data.message || 'Logged out successfully.',
        isLoggingOut: false,
      });
    } catch (error) {
      this.setState({ error: error.message, isLoggingOut: false });
    }
  };

  render() {
    const { onGoToCreateAccount } = this.props;
    const { user, isLoadingAccount, message, error, isSubmitting, isLoggingOut } = this.state;
    const address = user?.shippingAddress || {};

    return (
      <div className="container py-3 account-view-content">
        {isLoadingAccount ? (
          <>
            <h2>Account</h2>
            <p className="text-secondary">Checking sign-in status…</p>
          </>
        ) : user ? (
          <>
            <h2>Account</h2>
            {message && <p className="text-success" role="status">{message}</p>}
            {error && <p className="text-danger" role="alert">{error}</p>}
            <section className="card bg-dark text-white border-secondary p-3" aria-labelledby="account-details-heading">
              <h3 id="account-details-heading" className="h5">You&apos;re logged in as {user.username}</h3>
              <dl className="row mb-3">
                <dt className="col-sm-3">Username</dt>
                <dd className="col-sm-9">{user.username}</dd>
                <dt className="col-sm-3">Email</dt>
                <dd className="col-sm-9">{user.email || 'Not provided'}</dd>
                <dt className="col-sm-3">Phone</dt>
                <dd className="col-sm-9">{user.phone || 'Not provided'}</dd>
                <dt className="col-sm-3">Shipping address</dt>
                <dd className="col-sm-9">
                  {[
                    address.street,
                    address.city,
                    address.state,
                    address.zip,
                  ].filter(Boolean).join(', ') || 'Not provided'}
                </dd>
              </dl>
              <button
                type="button"
                className="btn btn-outline-light align-self-start"
                onClick={this.handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out…' : 'Log Out'}
              </button>
            </section>
          </>
        ) : (
          <>
            <h2>Log In</h2>
            {error && <p className="text-danger" role="alert">{error}</p>}
            <form
              className="card bg-dark text-white border-secondary p-3"
              onSubmit={this.handleSubmit}
            >
              <div className="mb-3">
                <label className="form-label" htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  className="form-control checkout-name-input"
                  name="username"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  className="form-control checkout-name-input"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-light login-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in…' : 'Log In'}
              </button>
              <p className="text-secondary mt-3 mb-0">
                Don&apos;t have an account?{' '}
                <button type="button" className="btn btn-link p-0" onClick={onGoToCreateAccount}>
                  Create Account
                </button>
              </p>
              {message && <p className="text-success mb-0" role="status">{message}</p>}
            </form>
          </>
        )}
      </div>
    );
  }
}

export default AccountView;
