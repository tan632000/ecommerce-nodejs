"use strict";

const keyTokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
      // level 0
      // const tokens = await keyTokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey
      // });
      // return tokens ? tokens.publicKey : null;

      // level 1
      const filter = { user: userId };
      const update = { publicKey, privateKey, refreshTokensUsed: [], refreshToken };
      const options = {
        upset: true,
        new: true
      }
      const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options);
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static findByUserId = async (userId) => {
    return await keyTokenModel.findOne({user: userId}).lean();
  }

  static removeKeyById = async (id) => {
    return await keyTokenModel.findByIdAndRemove({_id: id});
  }

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keyTokenModel.findOne({refreshTokensUsed: refreshToken}).lean();
  }

  static findByRefreshToken = async (refreshToken) => {
    return await keyTokenModel.findOne({refreshToken});
  }

  static deleteKeyById = async (userId) => {
    return await keyTokenModel.findOneAndDelete({user: userId})
  }

  static findByIdAndUpdateKeyStore = async (userId, tokens, refreshToken) => {
    return await keyTokenModel.findOneAndUpdate(
      { user: userId },
      {
        refreshToken: tokens.refreshToken,
        $push: { refreshTokensUsed: refreshToken }
      },
      { new: true }
    );
  }
}

module.exports = KeyTokenService;
