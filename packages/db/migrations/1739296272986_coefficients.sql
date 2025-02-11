-- Up Migration

CREATE TABLE coefficients (
    "id" text not null default typeid_generate_text('coefficient') CHECK (typeid_check_text(id, 'coefficient')),
    "parameter" VARCHAR(50) PRIMARY KEY,
    "value" DECIMAL(12, 6) NOT NULL
);

-- Down Migration

DROP TABLE IF EXISTS coefficients;