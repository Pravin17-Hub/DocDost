"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const recordController_1 = require("../controllers/recordController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.post('/upload', recordController_1.uploadRecord);
router.get('/mine', recordController_1.getMyRecords);
router.get('/patient/:patientId', recordController_1.getPatientRecords);
exports.default = router;
//# sourceMappingURL=record.js.map