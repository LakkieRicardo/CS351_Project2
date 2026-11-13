import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  // Security requirement: never send passwordHash back to the React client.
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    shippingAddress: user.shippingAddress || {},
  };
}

function validateAccountInput(body, { requirePassword = true } = {}) {
  // validate account data on the server.
  const { username, email, password } = body;

  if (!username || !usernamePattern.test(username)) {
    return 'Username must be 3 to 20 letters, numbers, or underscores';
  }

  if (!email || !emailPattern.test(email)) {
    return 'A valid email address is required';
  }

  if (requirePassword && (!password || password.length < 8)) {
    return 'Password must be at least 8 characters';
  }

  return null;
}

export function createAccountController(usersCollection) {
  async function createAccount(request, response) {
    try {
      const validationError = validateAccountInput(request.body);
      if (validationError) {
        return response.status(400).json({ error: validationError });
      }

      const { username, email, password, phone, street, city, state, zip } = request.body;
      // username and email must be unique in users.
      const existingUser = await usersCollection.findOne({
        $or: [{ username }, { email: email.toLowerCase() }],
      });

      if (existingUser) {
        return response.status(409).json({ error: 'Username or email already exists' });
      }

      // hash passwords before storing them in MongoDB.
      const passwordHash = await bcrypt.hash(password, 12);
      await usersCollection.insertOne({
        username,
        email: email.toLowerCase(),
        passwordHash,
        phone: phone || '',
        shippingAddress: { street: street || '', city: city || '', state: state || '', zip: zip || '' },
        createdAt: new Date(),
      });

      response.status(201).json({ message: 'Account created. Please log in.' });
    } catch (error) {
      console.error('Failed to create account:', error);
      response.status(500).json({ error: 'Failed to create account' });
    }
  }

  async function login(request, response) {
    try {
      const { username, password } = request.body;
      if (!username || !password) {
        return response.status(400).json({ error: 'Username and password are required' });
      }

      const user = await usersCollection.findOne({
        $or: [{ username }, { email: username.toLowerCase() }],
      });
      // compare against the stored password hash.
      const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);

      if (!passwordMatches) {
        return response.status(401).json({ error: 'Invalid username or password' });
      }

      // store the user's MongoDB _id in the session.
      request.session.userId = user._id.toString();
      response.json({ user: publicUser(user) });
    } catch (error) {
      console.error('Failed to log in:', error);
      response.status(500).json({ error: 'Failed to log in' });
    }
  }

  function logout(request, response) {
    // destroy the Express session on logout.
    request.session.destroy((error) => {
      if (error) {
        console.error('Failed to log out:', error);
        return response.status(500).json({ error: 'Failed to log out' });
      }
      response.clearCookie('connect.sid', { httpOnly: true, sameSite: 'lax' });
      response.json({ message: 'Logged out successfully' });
    });
  }

  async function getAccount(request, response) {
    // return data for the currently logged-in user.
    if (!request.session.userId) {
      return response.status(401).json({ error: 'You must be logged in' });
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(request.session.userId) });
    if (!user) {
      return response.status(404).json({ error: 'Account not found' });
    }

    response.json({ user: publicUser(user) });
  }

  async function updateAccount(request, response) {
    // update account fields without changing MongoDB _id.
    if (!request.session.userId) {
      return response.status(401).json({ error: 'You must be logged in' });
    }

    const validationError = validateAccountInput(request.body, { requirePassword: false });
    if (validationError) {
      return response.status(400).json({ error: validationError });
    }

    const { username, email, phone, street, city, state, zip } = request.body;
    const duplicate = await usersCollection.findOne({
      $or: [{ username }, { email: email.toLowerCase() }],
      _id: { $ne: new ObjectId(request.session.userId) },
    });

    if (duplicate) {
      return response.status(409).json({ error: 'Username or email already exists' });
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(request.session.userId) },
      { $set: { username, email: email.toLowerCase(), phone: phone || '', shippingAddress: { street: street || '', city: city || '', state: state || '', zip: zip || '' } } },
    );

    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(request.session.userId) });
    response.json({ user: publicUser(updatedUser) });
  }

  return { createAccount, login, logout, getAccount, updateAccount };
}
