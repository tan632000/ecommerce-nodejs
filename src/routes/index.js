"use strict";

const express = require("express");
const { apiKey, verifyPermission } = require("../auth/checkAuth");
const router = express.Router();

// check apiKey

router.use(apiKey);

// check permission

router.use(verifyPermission('0000'));

router.use("/v1/api/shop", require("./access"));
router.use("/v1/api/product", require("./product"));

module.exports = router;
