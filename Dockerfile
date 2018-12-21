### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:8-alpine as builder

COPY package.json package-lock.json ./

RUN npm config set proxy "http://and-fgt-linux-01.akka.eu:9090"
RUN npm config set http-proxy "http://and-fgt-linux-01.akka.eu:9090"
RUN npm config set https-proxy "http://and-fgt-linux-01.akka.eu:9090"
RUN npm config set strict-ssl false
ENV http_proxy "http://and-fgt-linux-01.akka.eu:9090"
ENV https_proxy "http://and-fgt-linux-01.akka.eu:9090"


RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm i && mkdir /ng-app && cp -R ./node_modules ./ng-app

WORKDIR /ng-app

COPY . .

## Build the angular app in production mode and store the artifacts in dist folder (max_old_space_size is to avoid "JavaScript heap out of memory" in CI build)
RUN node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --prod --build-optimizer --prod --aot --configuration=production
#RUN $(npm bin)/ng build --prod --build-optimizer --prod --aot --environment=prod


### STAGE 2: Setup ###

FROM httpd:alpine

# Redirect unknown urls to the index.html (needed to be able to refresh web page) 
RUN sed -i '/ rewrite_module /s/^#//' /usr/local/apache2/conf/httpd.conf
RUN sed -i 's/AllowOverride None/AllowOverride All/' /usr/local/apache2/conf/httpd.conf
ADD  ./.htaccess /usr/local/apache2/htdocs/.htaccess

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/local/apache2/htdocs/

