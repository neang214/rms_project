import express from "express";
import { authorize } from "../../middleware/authorize.js";
import { authenticate } from "../../middleware/authenticate.js";
import * as tableController from "./table.controller.js";

const router = express.Router();

// Tightened: this is a fully internal staff tool now that guest ordering
// is gone, so there's no more legitimate public/unauthenticated caller —
// any logged-in staff role can list/view tables.
router.get("/", authenticate, tableController.getAllTables);
router.get("/:id", authenticate, tableController.getTable);

router.get(
    "/admin/all",
    authenticate,
    authorize("admin"),
    tableController.getAllTablesAdmin,
);

router.post("/", authenticate, authorize("admin"), tableController.createTable);
router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    tableController.updateTable,
);
router.patch(
    "/:id/toggle",
    authenticate,
    authorize("cashier"),
    tableController.updateTableStatus,
);

router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    tableController.deleteTable,
);

export default router;
