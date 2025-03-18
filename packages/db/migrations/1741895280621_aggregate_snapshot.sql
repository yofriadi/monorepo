-- Up Migration

-- Create a view that handles multiple data source formats
CREATE OR REPLACE VIEW watch_scraping.aggregate_snapshot AS
WITH
    snapshot_with_sources AS (
        SELECT
            s.id,
            s.extracted_data,
            s.created_at AS snapshot_date,
            s.extracted_data ->> 'from' AS data_source,
            -- Get the effective source ID, either directly or via parent
            COALESCE(s.source_id, p.source_id) AS effective_source_id
        FROM
            watch_scraping.snapshots s
            -- For child snapshots, join with parent to get the source_id
            LEFT JOIN watch_scraping.snapshots p ON s.parent_id = p.id
        WHERE
            s.extracted_data IS NOT NULL
    ),
    -- Get product information related to each snapshot
    snapshot_products AS (
        SELECT
            sws.*,
            src.product_id,
            prod.reference_number,
            prod.turnover_category,
            prod.model_id,
            m.name AS model_name,
            m.brand_id,
            b.name AS brand_name
        FROM
            snapshot_with_sources sws
            LEFT JOIN watch_scraping.sources src ON sws.effective_source_id = src.id
            LEFT JOIN watch_scraping.products prod ON src.product_id = prod.id
            LEFT JOIN watch_scraping.models m ON prod.model_id = m.id
            LEFT JOIN watch_scraping.brands b ON m.brand_id = b.id
    )
SELECT
    sp.id,
    sp.data_source,
    sp.brand_name,
    sp.model_name,
    sp.reference_number,
    sp.turnover_category,
    sp.extracted_data -> 'price' ->> 'currency' AS currency,
    CASE
        WHEN sp.data_source = 'carousell' THEN
            NULLIF(sp.extracted_data -> 'price' ->> 'amount', '')::DECIMAL
        WHEN sp.data_source = 'chrono24' THEN
            NULLIF(regexp_replace(sp.extracted_data ->> 'price', '[^0-9\.]', '', 'g'), '')::DECIMAL
    END AS price,
    CASE
        WHEN sp.data_source = 'chrono24' THEN
            split_part(sp.extracted_data -> 'productInformation' -> 'Basic Info' ->> 'Location', ',', 1)
        WHEN sp.data_source = 'carousell' THEN 'Singapore'
    END AS location,
    CASE
        WHEN sp.data_source = 'chrono24' THEN CASE
            WHEN sp.extracted_data -> 'productInformation' -> 'Basic Info' ->> 'Year of production' = 'Unknown'
            OR sp.extracted_data -> 'productInformation' -> 'Basic Info' ->> 'Year of production' IS NULL THEN NULL
            ELSE REGEXP_REPLACE(COALESCE(sp.extracted_data -> 'productInformation' -> 'Basic Info' ->> 'Year of production', ''), '[^0-9]', '', 'g')
        END
        WHEN sp.data_source = 'carousell' THEN CASE
            WHEN sp.extracted_data -> 'description' ->> 'Dated' IS NOT NULL THEN
            -- Extract year from "Mar 2025" format
            SUBSTRING(
                sp.extracted_data -> 'description' ->> 'Dated'
                FROM
                    '[0-9]{4}'
            )
            ELSE NULL
        END
        ELSE NULL
    END AS year_of_production,
    CASE
        WHEN sp.data_source = 'chrono24' THEN (
            EXISTS (
                SELECT
                    1
                FROM
                    jsonb_array_elements_text(
                        CASE
                            WHEN jsonb_typeof(sp.extracted_data -> 'condition') = 'array' THEN sp.extracted_data -> 'condition'
                            ELSE to_jsonb(ARRAY[sp.extracted_data ->> 'condition'])
                        END
                    ) AS cond
                WHERE
                    cond ILIKE '%box%'
            )
            OR COALESCE(sp.extracted_data -> 'productInformation' -> 'Basic Info' ->> 'Scope of delivery', '') ILIKE '%box%'
        )
        WHEN sp.data_source = 'carousell' THEN COALESCE(sp.extracted_data -> 'description' ->> 'Original Box', '') ILIKE '%yes%'
        ELSE FALSE
    END AS has_box,
    CASE
        WHEN sp.data_source = 'chrono24' THEN (
            EXISTS (
                SELECT
                    1
                FROM
                    jsonb_array_elements_text(
                        CASE
                            WHEN jsonb_typeof(sp.extracted_data -> 'condition') = 'array' THEN sp.extracted_data -> 'condition'
                            ELSE to_jsonb(ARRAY[sp.extracted_data ->> 'condition'])
                        END
                    ) AS cond
                WHERE
                    cond ILIKE '%papers%'
                    OR cond ILIKE '%certificate%'
            )
            OR COALESCE(sp.extracted_data -> 'productInformation' -> 'Basic Info' ->> 'Scope of delivery', '') ILIKE '%papers%'
        )
        WHEN sp.data_source = 'carousell' THEN COALESCE(sp.extracted_data -> 'description' ->> 'Original Cert/Papers', '') ILIKE '%yes%'
        ELSE FALSE
    END AS has_papers,
    CASE
        WHEN sp.data_source = 'chrono24' THEN sp.extracted_data ->> 'condition'
        WHEN sp.data_source = 'carousell' THEN sp.extracted_data -> 'details' ->> 'condition'
        ELSE NULL
    END AS condition_status,
    CASE 
        WHEN sp.snapshot_date > CURRENT_DATE - INTERVAL '1 month' THEN '1_month'
        WHEN sp.snapshot_date > CURRENT_DATE - INTERVAL '3 months' THEN '3_month'
        WHEN sp.snapshot_date > CURRENT_DATE - INTERVAL '6 months' THEN '6_month'
        WHEN sp.snapshot_date > CURRENT_DATE - INTERVAL '1 year' THEN '1_year'
        ELSE 'older'
    END AS time_range,
    sp.product_id,
    sp.model_id,
    sp.brand_id
FROM
    snapshot_products sp;

-- Down Migration

DROP VIEW watch_scraping.aggregate_snapshot;
