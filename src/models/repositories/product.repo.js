'use strict'

const { Types } = require('mongoose');
const {product, electronic, furniture, clothing} = require('../../models/product.model');

const findProductForShop = async ({query, limit, skip}) => {
    return await product.find(query)
        .populate('product_shop', 'name email -_id')
        .sort({updateAt: -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
}

const publishProductBy = async ({product_shop, product_id, isPublished}) => {
    return await product.findOneAndUpdate({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    }, {
        isDraft: !isPublished,
        isPublished: isPublished
      },
      { new: true }
    );
}

const searchProductsByUser = async ({keySearch}) => {
    const regex = new RegExp(keySearch);
    const results = await product.find(
    {
        isDraft: false,
        $text: { $search: regex },
    }, {
        score: { $meta: 'textScore'}
    })
    .sort({
        score: { $meta: 'textScore'}
    })
    .lean();

    return results;
}

module.exports = {
    findProductForShop,
    publishProductBy,
    searchProductsByUser
}