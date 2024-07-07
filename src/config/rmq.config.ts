import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
dotenv.config();

export const RMQ_CONFIG: ClientProviderOptions = {
  name: 'RMQ_SERVICE',
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RMQ_URI],
    queue: process.env.RMQ_QUEUE,
    queueOptions: {
      durable: true,
    },
  },
};
