"use strict";

const AccessService = require("../services/access.service");

const { OK, CREATED, SuccessResponse } = require("../core/success.response");

class AccessController {
  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body)
    }).send(res)
  }

  signUp = async (req, res, next) => {
    // return res.status(201).json(await AccessService.signUp(req.body));
    new CREATED({
      message: 'Registered OK',
      metadata: await AccessService.signUp(req.body)
    }).send(res)
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: 'Logout successfully',
      metadata: await AccessService.logout(req.keyStore)
    }).send(res)
  }

  refreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: 'Get token successfully',
      metadata: await AccessService.handleRefreshToken(req.body.refreshToken)
    }).send(res)
  }
}

module.exports = new AccessController();
