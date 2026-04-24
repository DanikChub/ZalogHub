import { Router } from 'express';
import multer from 'multer';
import { createDealFromParserController } from '../modules/deals/deal.controller.js';
import { getParserSourcesController } from '../modules/sources/source.controller.js';

const upload = multer({ dest: 'tmp/' });

const parserRouter = Router();

parserRouter.get('/sources', getParserSourcesController);
parserRouter.post('/raw', upload.array('images'), createDealFromParserController);

export {parserRouter};