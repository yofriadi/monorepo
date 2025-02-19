-- Up Migration

CREATE TABLE lookup_prices (
    "id" TEXT NOT NULL DEFAULT typeid_generate_text('lookupprice') CHECK (typeid_check_text(id, 'lookupprice')),
    "type" VARCHAR(16) CHECK (type IN ('brand', 'coefficient', 'dial', 'bracelet', 'swu type', 'condition', 'reference number')) NOT NULL,
    "parameter" VARCHAR(50),
    "value" DECIMAL(12, 6) NOT NULL,
    "created_at" timestamptz NOT NULL default now(),
    "updated_at" timestamptz,
    PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX lookup_prices_type_idx ON lookup_prices ("type");
CREATE INDEX lookup_prices_type_parameter_idx ON lookup_prices ("type", "parameter");
CREATE INDEX lookup_prices_updated_at_idx ON lookup_prices ("updated_at");

-- Down Migration

DROP INDEX IF EXISTS lookup_prices_type_idx;
DROP INDEX IF EXISTS lookup_prices_type_parameter_idx;
DROP INDEX IF EXISTS lookup_prices_updated_at_idx;
DROP TABLE IF EXISTS lookup_prices;