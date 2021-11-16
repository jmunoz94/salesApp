import promiseLibrary from "bluebird";
import pgPromise from "pg-promise";

let options = {
  promiseLib: promiseLibrary,
};

let pgp = pgPromise(options);
let connectionString =
  process.env.DATABASE_URL || "postgres://localhost:5432/sales";
let db = pgp(connectionString);

// Products
export const getAllProducts = (req, res, next) => {
  db.any("select * from product")
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: "Retrieved ALL products",
      });
    })
    .catch((err) => next(err));
};

export const getProductByID = (req, res, next) => {
  const productID = parseInt(req.params.product_id);
  db.one("select * from product where product_id = $1", productID)
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: `Retrieved product ${productID}`,
      });
    })
    .catch((err) => next(err));
};

export const getProductsByDescription = (req, res, next) => {
  const productDescription = req.query.description;
  db.any(
    "select * from product where description ilike $1",
    `%${productDescription}%`
  )
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: `Retrieved products matching ${productDescription}`,
      });
    })
    .catch((err) => next(err));
};

export const getProducts = (req, res, next) => {
  if (req.query.description) {
    return getProductsByDescription(req, res, next);
  }
  return getAllProducts(req, res, next);
};

export const createProduct = (req, res, next) => {
  req.body.product_status_id = parseInt(req.body.product_status_id);
  req.body.price = parseFloat(req.body.price);
  db.one(
    "insert into product(description, price, product_status_id)" +
      " values(${description}, ${price}, ${product_status_id})" +
      " returning *",
    req.body
  )
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: `Created product ${data.product_id}`,
      });
    })
    .catch((err) => next(err));
};

export const updateProduct = (req, res, next) => {
  db.none(
    "update product set description=$1, price=$2, product_status_id=$3 where product_id=$4",
    [
      req.body.description,
      parseFloat(req.body.price),
      parseInt(req.body.product_status_id),
      parseInt(req.body.product_id),
    ]
  )
    .then(() => {
      res.status(200).json({
        status: "success",
        message: `Updated product ${req.body.product_id}`,
      });
    })
    .catch((err) => next(err));
};

// Accounts
export const getAllAccounts = (req, res, next) => {
  db.any("select * from accounts")
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: "Retrieved ALL accounts",
      });
    })
    .catch((err) => next(err));
};

export const getAccountByID = (req, res, next) => {
  let accountID = parseInt(req.params.account_id);
  db.one("select * from account where id = $1", accountID)
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: `Retrieved account ${accountID}`,
      });
    })
    .catch((err) => next(err));
};

export const createAccount = (req, res, next) => {
  req.body.role_id = parseInt(req.body.role_id);
  req.body.account_status_id = parseInt(req.body.account_status_id);
  db.one(
    "insert into account(role_id, account_status_id)" +
      " values(${role_id}, ${account_status_id})" +
      " returning *",
    req.body
  )
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: `Created account ${data.account_id}`,
      });
    })
    .catch((err) => next(err));
};

export const updateAccount = (req, res, next) => {
  db.none(
    "update account set role_id=$1, account_status_id=$2 where account_id=$3",
    [
      parseInt(req.body.role_id),
      parseInt(req.body.account_status_id),
      parseInt(req.body.account_id),
    ]
  )
    .then(() => {
      res.status(200).json({
        status: "success",
        message: `Updated account ${req.body.account_id}`,
      });
    })
    .catch((err) => next(err));
};

// Sale orders
export const getAllSalesOrders = (req, res, next) => {
  db.any(
    "select sales_order_id, orders.sales_order_status_id, sales_order_status_name, created_at," +
      " customer_id, customer_name, account_id, total from sales_order as orders" +
      " join sales_order_status as status" +
      " on status.sales_order_status_id = orders.sales_order_status_id"
  )
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: "Retrieved ALL sales orders",
      });
    })
    .catch((err) => next(err));
};

export const getSalesOrderByID = (req, res, next) => {
  let salesOrderID = parseInt(req.params.sales_order_id);
  db.one(
    "select sales_order_id, orders.sales_order_status_id, sales_order_status_name, created_at," +
      " customer_id, customer_name, account_id, total from sales_order as orders" +
      " join sales_order_status as status" +
      " on status.sales_order_status_id = orders.sales_order_status_id" +
      " where orders.sales_order_id = $1",
    salesOrderID
  )
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: `Retrieved sales order ${salesOrderID}`,
      });
    })
    .catch((err) => next(err));
};

export const getSalesOrdersByCustomerID = (req, res, next) => {
  const customerID = req.query.customer_id;
  db.any(
    "select sales_order_id, orders.sales_order_status_id, sales_order_status_name, created_at," +
      " customer_id, customer_name, account_id, total from sales_order as orders" +
      " join sales_order_status as status" +
      " on status.sales_order_status_id = orders.sales_order_status_id" +
      " where orders.customer_id = $1",
    customerID
  )
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: `Retrieved sales orders for customer ${customerID}`,
      });
    })
    .catch((err) => next(err));
};

export const getSalesOrdersByCustomerName = (req, res, next) => {
  const customerName = req.query.customer_name;
  db.any(
    "select sales_order_id, orders.sales_order_status_id, sales_order_status_name, created_at," +
      " customer_id, customer_name, account_id, total from sales_order as orders" +
      " join sales_order_status as status" +
      " on status.sales_order_status_id = orders.sales_order_status_id" +
      " where orders.customer_name ilike $1",
    `%${customerName}%`
  )
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: `Retrieved sales orders for customers matching ${customerName}`,
      });
    })
    .catch((err) => next(err));
};

export const getSalesOrders = (req, res, next) => {
  if (req.query.customer_id) {
    return getSalesOrdersByCustomerID(req, res, next);
  }
  if (req.query.customer_name) {
    return getSalesOrdersByCustomerName(req, res, next);
  }
  return getAllSalesOrders(req, res, next);
};

export const createSalesOrder = (req, res, next) => {
  req.body.account_id = parseInt(req.body.account_id);
  req.body.sales_order_status_id = parseInt(req.body.sales_order_status_id);
  db.one(
    "insert into sales_order(customer_id, customer_name, account_id, sales_order_status_id)" +
      " values(${customer_id}, ${customer_name}, ${account_id}, ${sales_order_status_id})" +
      " returning *",
    req.body
  )
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: `Created sales order ${data.sales_order_id}`,
      });
    })
    .catch((err) => next(err));
};

export const updateSalesOrder = (req, res, next) => {
  const fieldsToUpdate = [
    parseInt(req.body.customer_id),
    req.body.customer_name,
    parseInt(req.body.account_id),
    parseInt(req.body.sales_order_status_id),
    parseInt(req.body.sales_order_id),
  ];
  db.none(
    "update sales_order set customer_id=$1, customer_name=$2, account_id=$3, sales_order_status_id=$4 where sales_order_id=$5",
    fieldsToUpdate
  )
    .then(() => {
      res.status(200).json({
        status: "success",
        message: `Updated sales order ${req.body.sales_order_id}`,
      });
    })
    .catch((err) => next(err));
};

export const getSoldProductsBySalesOrder = (req, res, next) => {
  const salesOrderID = parseInt(req.params.sales_order_id);
  db.any(
    "select sold_product_id, product.product_id, description, price, quantity, total" +
      " from sold_product" +
      " join product" +
      " on sold_product.product_id = product.product_id" +
      " where sold_product.sales_order_id = $1",
    salesOrderID
  )
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: `Retrieved products for sales order ${req.params.sales_order_id}`,
      });
    })
    .catch((err) => next(err));
};

export const getSoldProductByID = (req, res, next) => {
  const soldProductID = parseInt(req.params.product_id);
  db.one("select * from sold_product where sold_product_id = $1", soldProductID)
    .then((data) => {
      res.status(200).json({
        status: "success",
        data: data,
        message: `Retrieved sales order entry ${soldProductID}`,
      });
    })
    .catch((err) => next(err));
};

export const createSoldProduct = (req, res, next) => {
  req.body.product_id = parseInt(req.body.product_id);
  req.body.sales_order_id = parseInt(req.body.sales_order_id);
  req.body.quantity = parseInt(req.body.quantity);
  db.none(
    "insert into sold_product(product_id, sales_order_id, quantity)" +
      " values(${product_id}, ${sales_order_id}, ${quantity})",
    req.body
  )
    .then(() => {
      res.status(200).json({
        status: "success",
        message: `Created entry for sales order ${req.body.sales_order_id}`,
      });
    })
    .catch((err) => next(err));
};

export const updateSoldProduct = (req, res, next) => {
  const soldProductID = parseInt(req.params.sold_product_id);
  db.none("update sold_product set quantity = $1 where sold_product_id=$2", [
    req.body.quantity,
    soldProductID,
  ])
    .then(() => {
      res.status(200).json({
        status: "success",
        message: "Updated sales order entry",
      });
    })
    .catch((err) => next(err));
};

export const deleteSoldProduct = (req, res, next) => {
  const soldProductID = parseInt(req.params.sold_product_id);
  db.none("delete from sold_product where sold_product_id = $1", soldProductID)
    .then(() => {
      res.status(200).json({
        status: "success",
        message: `Deleted product ${soldProductID} from sales order`,
      });
    })
    .catch((err) => next(err));
};
