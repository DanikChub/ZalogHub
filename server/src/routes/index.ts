import { Router } from 'express';
import { healthRouter } from './health.js';
import { parserRouter } from './parser.js';
import { dealsRouter } from './deals.js';
import {citiesRouter} from "./city";
import {devRouter} from "./dev";
import {devAuthMiddleware} from "../middlewares/devAuthMiddleware";

const router = Router();

router.use('/health', healthRouter);
router.use('/parser', parserRouter);
router.use('/deals', dealsRouter);
router.use('/cities', citiesRouter);

router.use('/dev', devAuthMiddleware, devRouter);

export { router };