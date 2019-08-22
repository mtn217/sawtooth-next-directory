==========================
Running NEXT in Production
==========================

To run the NEXT Identity Platform in a production environment:

1. Copy the .crt and the .key files for your domain and save them in the certs folder. Make sure the names of the .crt and the .pem files have the name of the domain. If you have the domain of example.com, the names of your two files would be example.com.crt and example.com.key
2. Make a copy of the nginx.conf-example file in the root directory and name it nginx.conf. This will be the configuration file for the Nginx Reverse Proxy.
3. In the nginx.conf file, replace "localhost" with your domain name (localhost should be replaced around 7 times).
4. In the root .env file, change the following environment variables to these new values:

        ``CLIENT_HOST=https://<YOUR_DOMAIN_NAME>``

        ``REACT_APP_HTTP_PROTOCOL=https://``

        ``REACT_APP_WS_PROTOCOL=wss://``

5. In the client folder, make a copy of .env.production-example and call the file .env.production. Replace REACT_APP_SERVER_HOST with the domain name. Change any other variables in .env.production as needed.
6. Back in the root directory, run ./bin/build_client to compile the frontend's static files.

        ``./bin/build_client``

7. Execute the ./bin/start command with the prod flag passed in to spin up your instance. SSL/TLS should be enabled.

        ``./bin/start -b -p``

8. NEXT is now available at at https://<YOUR_DOMAIN_NAME>.
9. When you would like to bring down NEXT containers, use ./bin/stop.

        ``./bin/stop``
