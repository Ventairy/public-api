import 'express';

import type { Actor } from '@shared/types/actor.type';

declare module 'express' {
  interface Request {
    user?: Actor;
  }
}