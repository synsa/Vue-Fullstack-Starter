import { readFileSync } from 'fs';
import { join } from 'path';
import { URL, format } from 'url';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import { graphqlExpress } from 'apollo-server-express';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
// import Raven from 'raven';

import routes from './api';
import schema from './api/graphql';

// const isLocalhost = new URL(process.env.FUNC_URL).hostname === 'localhost'

admin.initializeApp();

// if (!isLocalhost) {
//   Raven.config(SENTRY_DSN).install();
// }

const vm = express();

// if (!isLocalhost) {
//   vm.use(Raven.requestHandler());
// }

vm.use(compression());
vm.use(cors({ origin: true }));
vm.use(morgan('tiny'));
vm.use(bodyParser.json());
vm.use(bodyParser.urlencoded({ extended: false }));

vm.use('/', routes);
vm.use('/graphql', graphqlExpress({ schema }));

// if (!isLocalhost) {
//   vm.use(Raven.errorHandler());
// }

export const api = functions.https.onRequest(vm);

// -

const shell = express();

shell.get('*', (req, res) => {
  const botUserAgents = [
    'W3C_Validator',
    'baiduspider',
    'bingbot',
    'embedly',
    'facebookexternalhit',
    'linkedinbot',
    'outbrain',
    'pinterest',
    'quora link preview',
    'rogerbot',
    'showyoubot',
    'slackbot',
    'twitterbot',
    'vkShare',
  ];

  const rendertronUrl = 'https://render-tron.appspot.com';
  const targetUrl = format({
    protocol: req.protocol,
    hostname: new URL(process.env.SITE_URL).origin,
    pathname: req.originalUrl,
  });

  const template = readFileSync(join(__dirname, 'index.html'), 'utf-8');

  if (new RegExp(botUserAgents.join('|'), 'i').test(req.headers['user-agent'])) {
    fetch(`${rendertronUrl}/render/${targetUrl}`)
      .then(({ text }) => text())
      .then((body) => {
        res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        res.set('Vary', 'User-Agent');

        res.send(body.toString());
      });
  } else {
    res.send(template);
  }
});

export const app = functions.https.onRequest(shell);
