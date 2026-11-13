export function getMongoConnectionString(uri, port) {
  if (!uri) {
    throw new Error('MONGODB_URI is required.');
  }
  if (!port) {
    return uri;
  }

  const parsedPort = Number(port);
  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error('MONGODB_PORT must be an integer between 1 and 65535.');
  }

  const connectionUrl = new URL(uri);
  if (connectionUrl.protocol !== 'mongodb:') {
    throw new Error('MONGODB_PORT can only be used with a mongodb:// URI.');
  }
  if (connectionUrl.hostname.includes(',')) {
    throw new Error('MONGODB_PORT requires a single-host MongoDB URI.');
  }
  if (connectionUrl.port) {
    throw new Error('Remove the port from MONGODB_URI when setting MONGODB_PORT.');
  }

  connectionUrl.port = String(parsedPort);
  return connectionUrl.toString();
}
