FROM node:18

WORKDIR /usr/src/app

RUN corepack enable
RUN corepack prepare yarn@stable --activate

COPY . .

RUN yarn

EXPOSE 8080

CMD ["yarn", "start"]