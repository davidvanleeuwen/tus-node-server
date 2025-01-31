import {BaseHandler} from './BaseHandler'
import {ERRORS, EVENTS} from '../constants'
import {CancellationContext} from '../models'

import type http from 'node:http'

export class DeleteHandler extends BaseHandler {
  async send(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    context: CancellationContext
  ) {
    const id = this.getFileIdFromRequest(req)
    if (!id) {
      throw ERRORS.FILE_NOT_FOUND
    }

    if (this.options.onIncomingRequest) {
      await this.options.onIncomingRequest(req, res, id)
    }

    const lock = await this.acquireLock(req, id, context)
    try {
      await this.store.remove(id)
    } finally {
      await lock.unlock()
    }
    const writtenRes = this.write(res, 204, {})
    this.emit(EVENTS.POST_TERMINATE, req, writtenRes, id)
    return writtenRes
  }
}
