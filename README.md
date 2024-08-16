# Asset Management System
- This project provides an integrated solution for managing assets in a Roblox game and includes an admin dashboard for administrative tasks.

- The setup includes a Roblox server-side script, a Node.js web server, and an admin dashboard.

# Project Structure
- index.js: Main Node.js server script that handles requests from the Roblox game and manages asset queue processing.

- ServerScriptService/Script.lua: Roblox server-side script that interacts with the Node.js server to whitelist and load assets.

- admin_dashboard.js: Node.js script to serve the admin dashboard and handle requests to manage assets.

- public/admin_dashboard.html: HTML file for the admin dashboard interface.

# Deployment
- Deploy index.js to your preferred hosting service for the main Node.js server.

- Deploy ServerScriptService/Script.lua in Roblox Studio under ServerScriptService.Deploy admin_dashboard.js and public/admin_dashboard.html to your chosen hosting service for the admin dashboard.

- Make sure to replace placeholders in the scripts with actual values (e.g., URLs, secret codes) and configure your hosting environment accordingly.

# Notes
- Ensure all server scripts are properly secured and validate incoming data to prevent misuse.Regularly check the logs for any errors or issues and handle them as needed.
