import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import * as supplierController from "./supplier.controller.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("admin"),
  supplierController.getAllSuppliers,
);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  supplierController.getSupplier,
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  supplierController.createSupplier,
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  supplierController.updateSupplier,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  supplierController.deleteSupplier,
);

export default router;
