import { Component } from 'react';

export class AccountView extends Component {
  render() {
    const { onGoToCreateAccount } = this.props;

    return (
      <div className="container py-3">
        <h2>Log In</h2>
        <form
          className="card bg-dark text-white border-secondary p-3"
          onSubmit={(event) => event.preventDefault()}
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
          >
            Log In
          </button>
          <p className="text-secondary mt-3 mb-0">
            Don&apos;t have an account?{' '}
            <button type="button" className="btn btn-link p-0" onClick={onGoToCreateAccount}>
              Create Account
            </button>
          </p>
        </form>
      </div>
    );
  }
}

export default AccountView;
