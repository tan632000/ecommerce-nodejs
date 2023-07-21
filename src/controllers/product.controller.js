"use strict";

const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service_xxx");

const { OK, CREATED, SuccessResponse } = require("../core/success.response");

class ProductController {
    createProduct = async (req, res, next) => {
        // new SuccessResponse({
        //     message: 'Create new Product successfully',
        //     metadata: await ProductService.createProduct(req.body.product_type, {
        //         ...req.body,
        //         product_shop: req.user.userId
        //     })
        // }).send(res)
        new SuccessResponse({
            message: 'Create new Product successfully',
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Draft successfully',
            metadata: await ProductServiceV2.findAllDraftForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getAllPublishedForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list All Published successfully',
            metadata: await ProductServiceV2.findAllPublishedForShop({
                product_shop: req.user.userId,
            })
        }).send(res)
    }

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Publish Product By Shop successfully",
            metadata: await ProductServiceV2.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id,
                isPublished: true
            })
        }).send(res)
    }

    unpublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "UnPublish Product By Shop successfully",
            metadata: await ProductServiceV2.publishProductByShop({
                product_shop: req.user.userId,
                product_id: req.params.id,
                isPublished: false
            })
        }).send(res)
    }

    getListsearchProductByUser = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list Search successfully",
            metadata: await ProductServiceV2.searchProducts(req.params)
        }).send(res)
    }
}

module.exports = new ProductController();
