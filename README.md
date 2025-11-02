# Stracker

## Local development

1. Install docker
2. Start docker
3. Run `docker-compose up` in your terminal
4. Visit http://localhost:5173 in your browser to access the React app

The Docker setup automatically starts:
- MySQL database
- PHP/Apache server (port 80/443)
- React/Vite dev server (port 5173)
- Adminer database admin tool (port 8000)

All services communicate through Docker's internal network, eliminating CORS issues. The Vite dev server proxies API requests to the PHP service automatically.

## Links

- React app is available at: http://localhost:5173
- PHP/Apache is available at: http://localhost
- Adminer (database admin) is available at: http://localhost:8000

If the API is pointed at the production endpoint, toggle the root and rootb values in endpoints.json

## Painful deploy process

- Make sure that in endpoints.json, root is set to the relative API path.
- Run `pnpm build`
- log in to the hosting service and go to the FTP section.
- Upload the PHP files.
- Test the APIs via Postman. (get accessToken from session storage)
- upload the JS from the assets folder into the corresponding folder on the server.
- upload the CSS from the assets folder into the corresponding folder on the server.
- update the index.html file on the service. There are some changes there.

## TokenId

You can grab this from your debug tool in session storage - localhost - tokenId (handy for postman)
