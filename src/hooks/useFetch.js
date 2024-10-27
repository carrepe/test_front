import { useState, useEffect, useCallback } from "react";

const useFetch = (url) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchData = useCallback(async () => {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error("Failed to fetch data");
			}
			const result = await response.json();
			setData(result);
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	}, [url]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { data, loading, error, refetch: fetchData };
};

export default useFetch;
