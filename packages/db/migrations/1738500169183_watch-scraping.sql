-- Up Migration

-- Create Update updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create schema watch scraping
CREATE SCHEMA watch_scraping;

-- Create Brand table
CREATE TABLE IF NOT EXISTS watch_scraping.brands (
  "id" text not null default typeid_generate_text('brand') CHECK (typeid_check_text(id, 'brand')),
  name varchar(50) NOT NULL UNIQUE,
  alt_name text,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone,
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS brands_name_idx ON watch_scraping.brands (name);
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON watch_scraping.brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create Model table
CREATE TABLE IF NOT EXISTS watch_scraping.models (
  "id" text not null default typeid_generate_text('model') CHECK (typeid_check_text(id, 'model')),
  brand_id text NOT NULL,
  name varchar(50) NOT NULL,
  alt_name text,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone,
  UNIQUE(brand_id, name),
  PRIMARY KEY (id),
  FOREIGN KEY (brand_id) REFERENCES watch_scraping.brands (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS models_brand_id_idx ON watch_scraping.models (brand_id);
CREATE INDEX IF NOT EXISTS models_name_idx ON watch_scraping.models (name);
CREATE TRIGGER update_models_updated_at
  BEFORE UPDATE ON watch_scraping.models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create Product table
CREATE TABLE IF NOT EXISTS watch_scraping.products (
  "id" text not null default typeid_generate_text('product') CHECK (typeid_check_text(id, 'product')),
  model_id text NOT NULL,
  reference_number varchar(50) NOT NULL,
  turnover_category CHECK (turnover_category IN ('fast', 'moderate', 'slow')),
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone,
  UNIQUE(model_id, reference_number),
  PRIMARY KEY (id),
  CONSTRAINT reference_number_not_empty CHECK (length(trim(reference_number)) > 0),
  FOREIGN KEY (model_id) REFERENCES watch_scraping.models (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS products_model_id_idx ON watch_scraping.products (model_id);
CREATE INDEX IF NOT EXISTS products_reference_number_idx ON watch_scraping.products (reference_number);
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON watch_scraping.products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create Source table
CREATE TABLE IF NOT EXISTS watch_scraping.sources (
  "id" text not null default typeid_generate_text('source') CHECK (typeid_check_text(id, 'source')),
  product_id text NOT NULL,
  platform varchar(50) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone,
  PRIMARY KEY (id),
  FOREIGN KEY (product_id) REFERENCES watch_scraping.products (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS sources_product_id_idx ON watch_scraping.sources (product_id);
CREATE INDEX IF NOT EXISTS sources_platform_idx ON watch_scraping.sources (platform);
CREATE TRIGGER update_sources_updated_at
  BEFORE UPDATE ON watch_scraping.sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE watch_scraping.sources IS 'Stores source of scraping jobs.';

-- Create Snapshot table
CREATE TABLE IF NOT EXISTS watch_scraping.snapshots (
  "id" text not null default typeid_generate_text('snapshot') CHECK (typeid_check_text(id, 'snapshot')),
  source_id text CHECK (typeid_check_text(source_id, 'source')),
  parent_id text CHECK (typeid_check_text(parent_id, 'snapshot')),
  url text NOT NULL UNIQUE,
  extracted_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone,
  PRIMARY KEY (id),
  FOREIGN KEY (source_id) REFERENCES watch_scraping.sources (id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES watch_scraping.snapshots (id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS snapshots_source_id_idx ON watch_scraping.snapshots (source_id);
CREATE INDEX IF NOT EXISTS snapshots_parent_id_idx ON watch_scraping.snapshots (parent_id);
CREATE INDEX IF NOT EXISTS snapshots_url_idx ON watch_scraping.snapshots (url);
CREATE INDEX IF NOT EXISTS snapshots_updated_at_idx ON watch_scraping.snapshots (updated_at);
CREATE TRIGGER update_snapshots_updated_at
  BEFORE UPDATE ON watch_scraping.snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
COMMENT ON TABLE watch_scraping.snapshots IS 'Stores snapshot of scraping jobs. If scraping_source_id is null, then this is a snapshot of a product detail scraped from a product listing';

CREATE TABLE message_queues (
  "id" text not null default typeid_generate_text('messagequeue') CHECK (typeid_check_text(id, 'messagequeue')),
  topic VARCHAR(255) NOT NULL,
  payload jsonb NOT NULL,
  status varchar(10) CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending' NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  retries integer DEFAULT 0,
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS topic_status_idx ON message_queues (topic, status);

-- Down Migration
-- Drop the triggers
DROP TRIGGER IF EXISTS update_brands_updated_at ON watch_scraping.brands;

-- Drop the tables
DROP TABLE IF EXISTS message_queues;
DROP TABLE IF EXISTS watch_scraping.models;
DROP TABLE IF EXISTS watch_scraping.brands;

-- Drop the schema
DROP SCHEMA IF EXISTS watch_scraping;

-- Drop the function
DROP FUNCTION IF EXISTS update_updated_at_column();

