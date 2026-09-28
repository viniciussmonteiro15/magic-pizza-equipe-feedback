import { useCallback, useEffect, useState } from 'react';
import { addFeedback, listFeedback } from '../services/feedbackService';

export function useFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    listFeedback()
      .then((list) => {
        if (active) setItems(list);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const add = useCallback(async (data) => {
    const created = await addFeedback(data);
    setItems((prev) => [created, ...prev]);
    return created;
  }, []);

  return { items, loading, error, add };
}
