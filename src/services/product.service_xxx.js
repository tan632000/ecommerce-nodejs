'use strict'

const { BadRequestError } = require('../core/error.response');
const {
    findProductForShop,
    publishProductBy,
    searchProductsByUser,
} = require('../models/repositories/product.repo');
const {product, electronic, clothing, furniture} = require('../models/product.model');

// define factory class to create product 
class ProductFactory {
    /**
     *  type: 'Clothing', 'Electronic'
     *  payload
     */
    static productRegistry = {} // key - class 

    static registerProductType (type, classRef) {
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) throw new BadRequestError(`Invalid Product Types ${type}`)
        return new productClass(payload).createProduct();
    }

    static async findAllDraftForShop({product_shop, limit=50, skip=0}) {
        const query = {product_shop, isDraft: true};
        return await findProductForShop({query, limit, skip})
    }

    static async publishProductByShop ({product_shop, product_id, isPublished}) {
        return await publishProductBy({product_shop, product_id, isPublished});
    }

    static async findAllPublishedForShop({product_shop, limit=50, skip=0}) {
        const query = {product_shop, isPublished: true};
        return await findProductForShop({query, limit, skip})
    }

    static async searchProducts({keySearch}) {
        return await searchProductsByUser({keySearch})
    }
}

// define base product class 
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    async createProduct(product_id) {
        return await product.create({...this, _id: product_id})
    }
}

// define sub-class for different product type Clothing 
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newClothing) throw new BadRequestError('Create new Clothing error');

        const newProduct = await super.createProduct(newClothing._id);
        if (!newProduct) throw new BadRequestError('Create new Product error');

        return newProduct;
    }
}

// define sub-class for different product type Electronic 
class Electronic extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newElectronic) throw new BadRequestError('Create new Electronic error');

        const newProduct = await super.createProduct(newElectronic._id);
        if (!newProduct) throw new BadRequestError('Create new Product error');

        return newProduct;
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if (!newFurniture) throw new BadRequestError('Create new Furniture error');

        const newProduct = await super.createProduct(newFurniture._id);
        if (!newProduct) throw new BadRequestError('Create new Product error');

        return newProduct;
    }
}

// Register Product types 
ProductFactory.registerProductType('Electronics', Electronic);
ProductFactory.registerProductType('Clothing', Clothing);
ProductFactory.registerProductType('Furniture', Furniture);


module.exports = ProductFactory