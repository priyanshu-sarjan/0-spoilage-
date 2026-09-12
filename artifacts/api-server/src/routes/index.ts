import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import herbsRouter from "./herbs";
import productsRouter from "./products";
import supplyChainRouter from "./supplyChain";
import ordersRouter from "./orders";
import communityRouter from "./community";
import feedbackRouter from "./feedback";
import dashboardRouter from "./dashboard";
import coldChainTelemetryRouter from "./coldChainTelemetry";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/herbs", herbsRouter);
router.use("/products", productsRouter);
router.use("/supply-chain", supplyChainRouter);
router.use("/orders", ordersRouter);
router.use("/community/posts", communityRouter);
router.use("/feedback", feedbackRouter);
router.use("/dashboard", dashboardRouter);
router.use("/cold-chain-telemetry", coldChainTelemetryRouter);

export default router;

