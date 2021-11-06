import { Router } from 'express';
var router = Router();

import { 
    getProducts,
    getProductByID,
    createProduct,
    updateProduct,
    getAllAccounts,
    getAccountByID,
    createAccount,
    updateAccount,
    getSalesOrders,
    getSalesOrderByID,
    createSalesOrder,
    updateSalesOrder,
    getSoldProductByID,
    getSoldProductsBySalesOrder,
    createSoldProduct,
    updateSoldProduct,
    deleteSoldProduct
 } from './queries.js';


router.get('/api/products', getProducts);
router.get('/api/products/:product_id', getProductByID);
router.post('/api/products', createProduct);
router.put('/api/products/:product_id', updateProduct);
router.get('/api/accounts', getAllAccounts);
router.get('/api/accounts/:account_id', getAccountByID);
router.post('/api/accounts', createAccount);
router.put('/api/accounts/:account_id', updateAccount);
router.get('/api/sales-orders', getSalesOrders);
router.get('/api/sales-orders/:sales_order_id', getSalesOrderByID);
router.post('/api/sales-orders', createSalesOrder);
router.put('/api/sales-orders/:sales_order_id', updateSalesOrder);
router.get('/api/sales-orders/:sales_order_id/sold-products', getSoldProductsBySalesOrder);
router.post('/api/sold-products', createSoldProduct);
router.get('/api/sold-products/:product_id', getSoldProductByID);
router.put('/api/sold-products/:sold_product_id', updateSoldProduct);
router.delete('/api/sold-products/:sold_product_id', deleteSoldProduct);


export default router;
