-- Up Migration

CREATE OR REPLACE FUNCTION watch_scraping.get_snapshot_analytic(
    product_id_filter TEXT DEFAULT NULL,
    brand_filter VARCHAR(50) DEFAULT NULL,
    model_filter VARCHAR(50) DEFAULT NULL,
    reference_filter VARCHAR(50) DEFAULT NULL,
    year_filter TEXT DEFAULT NULL,
    condition_filter TEXT DEFAULT NULL,
    location_filter TEXT DEFAULT NULL,
    data_source_filter TEXT DEFAULT NULL, -- 'chrono24', 'carousell', etc.
    p_time_range TEXT DEFAULT NULL, -- renamed parameter to avoid conflict: '1_month', '3_month', '6_month', '1_year', 'all'
    has_box_filter BOOLEAN DEFAULT NULL,
    has_papers_filter BOOLEAN DEFAULT NULL,
    turnover_filter VARCHAR(8) DEFAULT NULL
)
RETURNS TABLE (
    product_id TEXT,
    brand_name VARCHAR(50),
    model_name VARCHAR(50),
    reference_number VARCHAR(50),
    turnover_category VARCHAR(8),
    avg_price DECIMAL,
    min_price DECIMAL,
    max_price DECIMAL,
    currency TEXT,
    data_points BIGINT,
    data_sources TEXT[],
    has_box BOOLEAN,
    has_papers BOOLEAN,
    condition_status TEXT,
    year_of_production TEXT,
    location TEXT,
    last_scraped_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_data AS (
        SELECT
	        *
        FROM
	        watch_scraping.aggregate_snapshot
        WHERE
	        price > 0
	        AND (
	            product_id_filter IS NULL
	            OR product_id_filter = aggregate_snapshot.product_id
	        )
	        AND (
		        brand_filter IS NULL
		        OR aggregate_snapshot.brand_name ILIKE '%' || brand_filter || '%'
	        )
	        AND (
		        model_filter IS NULL
		        OR aggregate_snapshot.model_name ILIKE '%' || model_filter || '%'
	        )
	        AND (
		        reference_filter IS NULL
		        OR aggregate_snapshot.reference_number ILIKE '%' || reference_filter || '%'
	        )
	        AND (
		        year_filter IS NULL
		        OR aggregate_snapshot.year_of_production = year_filter
		        OR (
			        year_filter = 'unknown'
			        AND (
				        aggregate_snapshot.year_of_production IS NULL
				        OR aggregate_snapshot.year_of_production = ''
			        )
		        )
	        )
	        AND (
		        condition_filter IS NULL
		        OR aggregate_snapshot.condition_status ILIKE '%' || condition_filter || '%'
	        )
	        AND (
		        location_filter IS NULL
		        OR aggregate_snapshot.location ILIKE '%' || location_filter || '%'
	        )
	        AND (
		        data_source_filter IS NULL
		        OR data_source = data_source_filter
	        )
	        AND (
		        p_time_range IS NULL
		        OR p_time_range = 'all'
		        OR p_time_range = time_range
	        )
	        AND (
		        has_box_filter IS NULL
		        OR aggregate_snapshot.has_box = has_box_filter
	        )
	        AND (
		        has_papers_filter IS NULL
		        OR aggregate_snapshot.has_papers = has_papers_filter
	        )
    )
    SELECT
        filtered_data.product_id,
	    filtered_data.brand_name,
	    filtered_data.model_name,
	    filtered_data.reference_number,
	    filtered_data.turnover_category,
	    AVG(price) AS avg_price,
	    MIN(price) AS min_price,
	    MAX(price) AS max_price,
	    mode() WITHIN GROUP (
		    ORDER BY
			    filtered_data.currency
	    ) AS currency,
	    COUNT(*) AS data_points,
	    array_agg(DISTINCT data_source) AS data_sources,
	    bool_or(filtered_data.has_box) AS has_box,
	    bool_or(filtered_data.has_papers) AS has_papers,
	    mode() WITHIN GROUP (
		    ORDER BY
			    filtered_data.condition_status
	    ) AS condition_status,
	    mode() WITHIN GROUP (
		    ORDER BY
			    filtered_data.year_of_production
	    ) AS year_of_production,
	    mode() WITHIN GROUP (
		    ORDER BY
			    filtered_data.location
	    ) AS location,
	    MAX(snapshot_date) AS last_scraped_date
    FROM
	    filtered_data
    GROUP BY
        filtered_data.product_id,
	    filtered_data.brand_name,
	    filtered_data.model_name,
	    filtered_data.reference_number,
	    filtered_data.turnover_category
    ORDER BY
	    brand_name,
	    model_name,
	    reference_number;
    END;
$$ LANGUAGE plpgsql;

-- Down Migration

DROP FUNCTION watch_scraping.get_snapshot_data;
