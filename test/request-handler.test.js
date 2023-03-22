/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-env mocha */
/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */

import assert from 'assert';
import dotenv from 'dotenv';
import { stub } from 'sinon';
import { RequestHandler } from '../src/index.js';

dotenv.config();

const MOCK_REQUEST = new Request('http://localhost', { method: 'POST' });
function mockContext(event) {
  return {
    invocation: {
      event: event || {},
    },
    env: process.env,
  };
}

function mockSqsRecord(action) {
  return {
    messageId: 'af88e691-c3a6-4b46-b4d2-1c897b41b600',
    receiptHandle:
      'AQEBJCLTpWgDm+oaeBAlSKWumzIoFRHeJglHCwWEfJANgc7GSWQBcYTiLPfbO1IuxAIkJagUIEkqgmszqnj2a7hLZjoIcv0AWCQfL0tmje/hhnDWYKdQmrUmfITdPDIg49XI+n+Ub/gKjXEy3VvunLsp0bxuF33OCsR8+N0Skff+U+zan+42GcHtn8lacm6ZQIF9msoFxszourA+zpJ/DJ1DTMlEpr9cSPxa6nsbg7JHOOwBzWknn7d3Zkimuo/J3shMyb+4fBYFRNpzXt9o9l8rfQpi9JZDwGIFRqDYFvpI0Emqv9ke1V2uBAJPiiGS0h1MIKO6dZZ/ejfWAR0Rug3zMEH9SEa6N+hT4gF5Pu2IN6WmcRhE4sh0jW/ImAAunuIo/OZ1FhNjqp+keK3AvBiPiQ==',
    body: `{"action":"${action}"}`,
    attributes: {
      ApproximateReceiveCount: '1',
      SentTimestamp: '1678764328689',
      SenderId: 'AIDAXXYBVS2FJDJXJ56HK',
      ApproximateFirstReceiveTimestamp: '1678764328690',
    },
    messageAttributes: {},
    md5OfBody: 'd7e5fb40d1b43e304158449c3ecd6e5c',
    eventSource: 'aws:sqs',
    eventSourceARN: 'arn:aws:sqs:us-east-1:532042585738:content-lake-it',
    awsRegion: 'us-east-1',
  };
}

describe('Request Handler Tests', () => {
  describe('main', () => {
    it('can get main', () => {
      const requestHandler = new RequestHandler();
      const main = requestHandler.getMain();
      assert.ok(main);
    });

    it('main requires context / request', async () => {
      const requestHandler = new RequestHandler();
      const main = requestHandler.getMain();
      let caught;
      try {
        await main(undefined, undefined);
      } catch (err) {
        caught = err;
      }
      assert.ok(caught);
    });

    it('main handles unexpected exceptions', async () => {
      const requestHandler = new RequestHandler().withHandler('throw', () => {
        throw new Error('Surprise!');
      });
      const main = requestHandler.getMain();
      const res = await main(MOCK_REQUEST, mockContext({ action: 'throw' }));
      assert.strictEqual(res.status, 500);
    });
  });

  describe('handler', () => {
    it('will throw on undefined action', async () => {
      const requestHandler = new RequestHandler().withHandler(
        'test',
        () => new Response(),
      );
      let caught;
      try {
        await requestHandler.handleEvent(
          {
            payload: 'Hello World',
          },
          mockContext(),
        );
      } catch (err) {
        caught = err;
      }
      assert.ok(caught);
      assert.strictEqual(caught.status, 400);
    });

    it('will throw on unknown action', async () => {
      const requestHandler = new RequestHandler().withHandler(
        'test',
        () => new Response(),
      );
      let caught;
      try {
        await requestHandler.handleEvent({ action: 'test2' }, mockContext());
      } catch (err) {
        caught = err;
      }
      assert.ok(caught);
      assert.strictEqual(caught.status, 400);
    });

    it('will not fail to destructure on undefined event', async () => {
      const requestHandler = new RequestHandler().withHandler(
        'test',
        () => new Response(),
      );
      let caught;
      try {
        await requestHandler.handleEvent(undefined, mockContext());
      } catch (err) {
        caught = err;
      }
      assert.ok(caught);
      assert.strictEqual(caught.status, 400);
    });

    it('can add/invoke actions', async () => {
      let event;
      const requestHandler = new RequestHandler().withHandler('test', (evt) => {
        event = evt;
        return new Response();
      });
      const main = requestHandler.getMain();
      const res = await main(
        MOCK_REQUEST,
        mockContext({ action: 'test', message: 'Hello World' }),
      );
      assert.ok(event);
      assert.strictEqual(event.message, 'Hello World');
      assert.ok(res.ok);
    });

    it('can handle SQS record(s)', async () => {
      const events = [];
      const requestHandler = new RequestHandler()
        .withHandler('test', (evt) => {
          events.push(evt);
          return new Response();
        })
        .withHandler('fail', (evt) => {
          events.push(evt);
          return new Response('bad request', { status: 400 });
        })
        .withHandler('throw', (evt) => {
          events.push(evt);
          throw new Error('bad news');
        });

      const removed = [];
      stub(requestHandler, 'getQueueClient').returns({
        removeMessage: (handle) => removed.push(handle),
      });
      const main = requestHandler.getMain();
      const res = await main(
        MOCK_REQUEST,
        mockContext({
          Records: [
            mockSqsRecord('test'),
            mockSqsRecord('fail'),
            mockSqsRecord('throw'),
          ],
        }),
      );
      assert.ok(res.ok);
      assert.strictEqual(events.length, 3);
      assert.strictEqual(removed.length, 1);
    });
  });

  describe('getQueueClient', () => {
    it('can get queue client', async () => {
      const requestHandler = new RequestHandler();
      const queueClient = requestHandler.getQueueClient(mockContext());
      assert.ok(queueClient);
    });

    it('getQueueClient requires queue url', async () => {
      const requestHandler = new RequestHandler();
      let caught;
      try {
        requestHandler.getQueueClient({ env: {} });
      } catch (err) {
        caught = err;
      }
      assert.ok(caught);
    });
  });
});
