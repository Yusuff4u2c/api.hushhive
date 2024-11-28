const net = require("net");

/**
 * Checks if a port is open on the server using async/await.
 * @param {string} host - The host address (e.g., '127.0.0.1' or 'localhost').
 * @param {number} port - The port to check.
 * @returns {Promise<boolean>} - Resolves to true if the port is open, otherwise false.
 */
async function isPortOpen(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    // Set timeout for the connection
    socket.setTimeout(2000);

    // Handle successful connection
    socket.connect(port, host, () => {
      socket.destroy(); // Close the socket
      resolve(true); // Port is open
    });

    // Handle errors or timeouts
    socket.on("error", () => {
      socket.destroy(); // Close the socket
      resolve(false); // Port is closed
    });

    socket.on("timeout", () => {
      socket.destroy(); // Close the socket
      resolve(false); // Port is closed due to timeout
    });
  });
}

// Main function to check port status
(async () => {
  try {
    const host = "127.0.0.1"; // Replace with your server's address
    const port = 8080; // Replace with the port you want to check

    const isOpen = await isPortOpen(host, port);
    if (isOpen) {
      console.log(`Port ${port} on ${host} is OPEN.`);
    } else {
      console.log(`Port ${port} on ${host} is CLOSED.`);
    }
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
})();
