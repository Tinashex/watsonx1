import { useState, useEffect, useRef } from 'react';
const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    setLoading(true); setError(null);
    Promise.resolve().then(() => fetchFn()).then((res) => {
      if (!mounted.current) return;
      setData(res?.data?? res); setLoading(false);
    }).catch((err) => {
      if (!mounted.current) return;
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      setError(err?.message || 'Something went wrong'); setLoading(false);
    });
    return () => { mounted.current = false; };
  }, deps);
  return { data, loading, error };
};
export default useFetch;