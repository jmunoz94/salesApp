DROP DATABASE IF EXISTS sales;
CREATE DATABASE sales;

\c sales;

CREATE TABLE product_status (
    product_status_id SERIAL PRIMARY KEY,
    product_status_name TEXT NOT NULL
);

INSERT INTO product_status (product_status_name)
VALUES
    ('available'),
    ('unavailable');

CREATE TABLE sales_order_status (
    sales_order_status_id SERIAL PRIMARY KEY,
    sales_order_status_name TEXT NOT NULL
);

INSERT INTO sales_order_status (sales_order_status_name)
VALUES
    ('processing'),
    ('canceled'),
    ('shipped');

CREATE TABLE account_status (
    account_status_id SERIAL PRIMARY KEY,
    account_status_name TEXT NOT NULL
);

INSERT INTO account_status (account_status_name)
VALUES
    ('pending'),
    ('authorized'),
    ('unauthorized');

CREATE TABLE account_role (
    account_rol_id SERIAL PRIMARY KEY,
    account_role_name TEXT
);

INSERT INTO account_role (account_role_name)
VALUES
    ('admin'),
    ('salesperson');

CREATE TABLE account (
    account_id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES account_role,
    account_status_id INT NOT NULL REFERENCES account_status
);

CREATE TABLE sales_order (
    sales_order_id SERIAL PRIMARY KEY,
    total NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    account_id INT NOT NULL REFERENCES account,
    sales_order_status_id INT NOT NULL REFERENCES sales_order_status
);

CREATE TABLE product (
    product_id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    product_status_id INT NOT NULL REFERENCES product_status
);

CREATE TABLE sold_product (
    sold_product_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES product,
    sales_order_id INT NOT NULL REFERENCES sales_order,
    quantity INT NOT NULL,
    total NUMERIC NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION calculate_product_total() RETURNS TRIGGER AS $$
BEGIN

    IF TG_OP <> 'DELETE' THEN
        WITH per_item_total AS (
            UPDATE sold_product
            SET total = NEW.quantity * product.price
            FROM product
            WHERE product.product_id = NEW.product_id AND sold_product.sold_product_id = NEW.sold_product_id
            RETURNING total
        )
        UPDATE sales_order
        SET total = sales_order.total + per_item_total.total
        FROM per_item_total
        WHERE sales_order.sales_order_id = NEW.sales_order_id;
    END IF;
    
    IF TG_OP <> 'INSERT' THEN
        UPDATE sales_order
        SET total = sales_order.total - OLD.total
        WHERE sales_order.sales_order_id = OLD.sales_order_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE PLPGSQL;

CREATE TRIGGER update_product_total
AFTER INSERT OR UPDATE OR DELETE ON sold_product
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE PROCEDURE calculate_product_total();