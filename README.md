Environment setup:
1. Install Node.js and Cypress
2. Initialize and launch the Docker containers as defined in the docker-compose.yml configuration file.
   The Docker Compose configuration has been enhanced with Basic Authentication and RBAC to enforce secure service creation through granular access control.
3. Prepare .env file to store sensitive data(password etc.).
4. Use nodemailer to send report once testing is done.
