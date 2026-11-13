import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const namePattern = /^[A-Za-z .'-]{2,50}$/;
const phonePattern = /^(\+?1[ .-]?)?(\([0-9]{3}\)|[0-9]{3})[ .-]?[0-9]{3}[ .-]?[0-9]{4}$/;
const statePattern = /^[A-Za-z]{2}$/;
const zipPattern = /^[0-9]{5}(-[0-9]{4})?$/;

function publicUser(user) {
  // Security requirement: never send passwordHash back to the React client.
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    shippingAddress: user.shippingAddress || {},
  };
}

function validateAccountInput(body, { requirePassword = true } = {}) {
  //validate account data on the server.
  const { username, email, password, firstName, lastName, phone, street, city, state, zip } = body;

  if (!firstName || !namePattern.test(firstName.trim())) return 'A valid first name is required';
  if (!lastName || !namePattern.test(lastName.trim())) return 'A valid last name is required';

  if (!username || !usernamePattern.test(username)) {
    return 'Username must be 3 to 20 letters, numbers, or underscores';
  }

  if (!email || !emailPattern.test(email)) {
    return 'A valid email address is required';
  }

  if (requirePassword && (!password || password.length < 8)) {
    return 'Password must be at least 8 characters';
  }

  if (!phone || !phonePattern.test(phone.trim())) return 'A valid phone number is required';
  if (!street || street.trim().length < 3) return 'Street address is required';
  if (!city || !namePattern.test(city.trim())) return 'A valid city is required';
  if (!state || !statePattern.test(state.trim())) return 'A two-letter state is required';
  if (!zip || !zipPattern.test(zip.trim())) return 'A valid ZIP code is required';

  return null;
}

export function createAccountController(usersCollection) {
  async function createAccount(request, response) {
    try {
      const validationError = validateAccountInput(request.body);
      if (validationError) {
        return response.status(400).json({ error: validationError });
      }

      const { username, email, password, firstName, lastName, phone, street, city, state, zip } = request.body;
      // username and email must be unique in users.
      const normalizedEmail = email.trim().toLowerCase();
      const existingUsername = await usersCollection.findOne({ username: username.trim() });
      const existingEmail = await usersCollection.findOne({ email: normalizedEmail });

      if (existingUsername || existingEmail) {
        return response.status(409).json({ error: existingUsername ? 'Username is already taken' : 'Email is already registered' });
      }

      // hash passwords before storing them in MongoDB.
      const passwordHash = await bcrypt.hash(password, 12);
      await usersCollection.insertOne({
        username: username.trim(),
        email: normalizedEmail,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        shippingAddress: { street: street.trim(), city: city.trim(), state: state.trim().toUpperCase(), zip: zip.trim() },
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

    const { username, email, firstName, lastName, phone, street, city, state, zip } = request.body;
    const normalizedEmail = email.trim().toLowerCase();
    const duplicate = await usersCollection.findOne({
      $or: [{ username: username.trim() }, { email: normalizedEmail }],
      _id: { $ne: new ObjectId(request.session.userId) },
    });

    if (duplicate) {
      return response.status(409).json({ error: 'Username or email already exists' });
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(request.session.userId) },
      { $set: { username: username.trim(), email: normalizedEmail, firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), shippingAddress: { street: street.trim(), city: city.trim(), state: state.trim().toUpperCase(), zip: zip.trim() } } },
    );

    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(request.session.userId) });
    response.json({ user: publicUser(updatedUser) });
  }

  return { createAccount, login, logout, getAccount, updateAccount };
}
