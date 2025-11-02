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

Sanity - in July 24, upgraded to the latest google auth. it returns access_token instead of tokenId. API wasn't updated but most of app was. access_token and tokenId (w/ access_token value) are passed w/ every call.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
