"use strict";
const ShopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { ConflictRequestError, BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {

  static handleRefreshToken = async (refreshToken) => {
    // check token da duoc su dung chua
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
    // neu co
    if (foundToken) {
      // decode user 
      const {userId, email} = await verifyJWT(refreshToken, foundToken.privateKey);
      // xoa tat ca token trong keyStore
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError('Something wrong happened! Please re-login');
    }
    // Neu khong
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    console.log('holderToken===', holderToken);
    if(!holderToken) throw new AuthFailureError('Shop not registered 1!');

    // verifyToken
    const {userId, email} = await verifyJWT(refreshToken, holderToken.privateKey);
    // check user 
    const foundShop = await findByEmail({email});
    if(!foundShop) throw new AuthFailureError('Shop not registered 2!');

    // create 1 cap token moi 
    const tokens = await createTokenPair(
      {
        userId,
        email,
      },
      holderToken.publicKey,
      holderToken.privateKey
    );

    // update token 
    await KeyTokenService.findByIdAndUpdateKeyStore(userId, tokens, refreshToken)

    return {
      user: {userId, email},
      tokens
    }
  }

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  }

  /**
   * 1 - Check email in db
   * 2 - Match password
   * 3 - Create AT and RT and save 
   * 4 - Generate tokens 
   * 5 - Get data return login 
   */

  static login = async ({email, password, refreshToken}) => {
    const foundShop = await findByEmail({email});
    if (!foundShop) throw new BadRequestError('Shop not registered');
    const userId = foundShop._id;
    
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError('Authentication error');

    // create publicKey, privateKey
    const publicKey = crypto.randomBytes(64).toString('hex');
    const privateKey = crypto.randomBytes(64).toString('hex');

    // create token pair
    const tokens = await createTokenPair(
      {
        userId,
        email,
      },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      userId,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken
    })

    return {
      shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop}),
      tokens,
    };
  }

  static signUp = async ({ name, email, password }) => {
    // step 1: Check email exist
    // lean() return nhanh hon, tra ve 1 object js thuan tuy
    const existedShop = await ShopModel.findOne({ email }).lean();
    if (existedShop) {
      throw new ConflictRequestError('Error: Shop already registered');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await ShopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // create publicKey, privateKey
      const publicKey = crypto.randomBytes(64).toString('hex');
      const privateKey = crypto.randomBytes(64).toString('hex');
      const userId = newShop._id;
      // create token pair
      const tokens = await createTokenPair(
        {
          userId,
          email,
        },
        publicKey,
        privateKey
      );

      // save collection KeyStore
      const keyStore = await KeyTokenService.createKeyToken({
        userId,
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken
      });

      if (!keyStore) {
        return BadRequestError('Error: Key store not found');
      }

      return {
        code: 201,
        metadata: {
          shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop}),
          tokens,
        },
      };
    }
    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
